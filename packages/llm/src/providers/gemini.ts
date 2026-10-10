import { GoogleGenAI, Type, FunctionCallingConfigMode } from '@google/genai';
import type { LlmClient, GenerateDesignInput } from '../client';
import type { KeycapDesignSpec } from '@keycap/shared';
import { SYSTEM_PROMPT } from '../prompts/system';
import { buildUserPrompt } from '../prompts/user';
import { moderatePrompt } from '../guardrails/moderation';
import { validateAndSanitizeDesignSpec, DesignSpecValidationError } from '../guardrails/validate';

const EMIT_DESIGN_SPEC_TOOL = {
  functionDeclarations: [
    {
      name: 'emit_design_spec',
      description: 'Emit a strictly validated mechanical keyboard keycap set design specification',
      parameters: {
        type: Type.OBJECT,
        properties: {
          theme: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: 'Creative name of the theme (max 60 chars)' },
              description: {
                type: Type.STRING,
                description: 'Short description and design rationale (max 240 chars)',
              },
            },
            required: ['name', 'description'],
          },
          global: {
            type: Type.OBJECT,
            properties: {
              profile: {
                type: Type.STRING,
                enum: ['CHERRY', 'OEM'],
                description: 'Keycap profile',
              },
              stem: {
                type: Type.STRING,
                enum: ['MX'],
                description: 'Switch stem type (MX standard)',
              },
              material: {
                type: Type.STRING,
                enum: ['PETG', 'PLA', 'ASA'],
                description: 'Print material (PETG recommended default)',
              },
              finish: {
                type: Type.STRING,
                enum: ['RAW', 'SANDED', 'PAINTED'],
                description: 'Surface finish',
              },
              baseColor: {
                type: Type.STRING,
                description: 'Primary keycap body color in hex format e.g. #1e1e24',
              },
              legendColor: {
                type: Type.STRING,
                description: 'Primary text/legend color in hex format e.g. #f4f4f5',
              },
              font: {
                type: Type.STRING,
                enum: ['inter-bold', 'jetbrains-mono', 'space-grotesk', 'noto-sans-jp'],
                description: 'Allowlisted font for legends',
              },
              stemToleranceMm: {
                type: Type.NUMBER,
                description: 'Stem fit tolerance in mm (0.05 - 0.30, default 0.15)',
              },
              wallMm: {
                type: Type.NUMBER,
                description: 'Wall thickness in mm (1.2 - 2.4, default 1.5)',
              },
            },
            required: [
              'profile',
              'stem',
              'material',
              'finish',
              'baseColor',
              'legendColor',
              'font',
            ],
          },
          overrides: {
            type: Type.ARRAY,
            description: 'Per-key or per-group color and legend overrides (max 60)',
            items: {
              type: Type.OBJECT,
              properties: {
                target: {
                  type: Type.OBJECT,
                  properties: {
                    keyId: { type: Type.STRING, description: 'Specific key ID if targeted' },
                    group: {
                      type: Type.STRING,
                      enum: [
                        'MODIFIERS',
                        'ALPHAS',
                        'NUMBERS',
                        'FUNCTION',
                        'ARROWS',
                        'NUMPAD',
                        'ESC',
                        'ENTER',
                        'SPACE',
                      ],
                      description: 'Targeted functional key group',
                    },
                  },
                },
                baseColor: { type: Type.STRING, description: 'Override base color hex' },
                legendColor: { type: Type.STRING, description: 'Override legend color hex' },
                legend: {
                  type: Type.OBJECT,
                  properties: {
                    text: { type: Type.STRING, description: 'Text on keycap' },
                    font: {
                      type: Type.STRING,
                      enum: ['inter-bold', 'jetbrains-mono', 'space-grotesk', 'noto-sans-jp'],
                    },
                    sizeMm: { type: Type.NUMBER, description: 'Font size in mm (2.0 - 9.0)' },
                    depthMm: { type: Type.NUMBER, description: 'Emboss/engrave depth (0.2 - 0.8)' },
                    mode: { type: Type.STRING, enum: ['ENGRAVE', 'EMBOSS'] },
                    position: { type: Type.STRING, enum: ['CENTER', 'TOP_LEFT', 'FRONT'] },
                  },
                  required: ['text', 'font', 'sizeMm', 'depthMm', 'mode', 'position'],
                },
              },
              required: ['target'],
            },
          },
        },
        required: ['theme', 'global', 'overrides'],
      },
    },
  ],
};

export class GeminiProvider implements LlmClient {
  private client: GoogleGenAI;
  private model: string;

  constructor(apiKey: string, model: string = 'gemini-2.5-flash') {
    this.client = new GoogleGenAI({ apiKey });
    this.model = model;
  }

  async generateDesignSpec(input: GenerateDesignInput): Promise<KeycapDesignSpec> {
    // 1. Guardrail input prompt moderation
    const moderation = moderatePrompt(input.prompt);
    if (moderation.flagged) {
      throw new Error(`Input prompt rejected by moderation policy: ${moderation.reason}`);
    }

    const userPrompt = buildUserPrompt(input);
    let lastError: Error | null = null;

    // Retry loop: up to 2 attempts if schema validation fails
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await this.client.models.generateContent({
          model: this.model,
          contents: [
            {
              role: 'user',
              parts: [{ text: userPrompt }],
            },
          ],
          config: {
            systemInstruction: SYSTEM_PROMPT,
            tools: [EMIT_DESIGN_SPEC_TOOL],
            toolConfig: {
              functionCallingConfig: {
                mode: FunctionCallingConfigMode.ANY,
                allowedFunctionNames: ['emit_design_spec'],
              },
            },
            temperature: 0.7,
          },
        });

        // Extract function call
        const functionCalls = response.functionCalls;
        if (!functionCalls || functionCalls.length === 0) {
          throw new Error('LLM did not invoke emit_design_spec tool');
        }

        const call = functionCalls.find((c) => c.name === 'emit_design_spec') ?? functionCalls[0];
        const rawArgs = call?.args;
        if (!rawArgs) {
          throw new Error('emit_design_spec was called without arguments');
        }

        // Validate and clamp
        const { spec } = validateAndSanitizeDesignSpec(rawArgs);
        return spec;
      } catch (err: any) {
        lastError = err;
        if (err instanceof DesignSpecValidationError) {
          // Retry with feedback if attempt < 2
          continue;
        }
        throw err;
      }
    }

    throw lastError ?? new Error('Failed to generate valid design spec after retries.');
  }
}
