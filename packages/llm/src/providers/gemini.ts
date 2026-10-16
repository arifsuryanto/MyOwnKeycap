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


export function generateMockDesignSpec(input: GenerateDesignInput): KeycapDesignSpec {
  const p = input.prompt.toLowerCase();

  let themeName = 'Custom Artisan Edition';
  let baseColor = '#1e1e2e';
  let legendColor = '#cdd6f4';
  let modifierColor = '#313244';
  let accentColor = '#f38ba8';
  let font: 'inter' | 'roboto' | 'jetbrains-mono' = 'jetbrains-mono';

  if (p.includes('cyber') || p.includes('neon') || p.includes('synth')) {
    themeName = 'Cyberpunk Neon Pulse';
    baseColor = '#10141e';
    legendColor = '#00f2fe';
    modifierColor = '#1c2237';
    accentColor = '#ff007f';
    font = 'jetbrains-mono';
  } else if (p.includes('matcha') || p.includes('green') || p.includes('forest') || p.includes('nature') || p.includes('botanical')) {
    themeName = 'Matcha Botanical Garden';
    baseColor = '#e8ecd7';
    legendColor = '#2d3a2e';
    modifierColor = '#7d8c71';
    accentColor = '#b5c99a';
    font = 'inter';
  } else if (p.includes('retro') || p.includes('classic') || p.includes('beige') || p.includes('vintage') || p.includes('9009')) {
    themeName = 'Vintage Atelier 1984';
    baseColor = '#ede8d0';
    legendColor = '#2b2b2b';
    modifierColor = '#968c83';
    accentColor = '#d65d0e';
    font = 'roboto';
  } else if (p.includes('sakura') || p.includes('pink') || p.includes('pastel') || p.includes('macaron')) {
    themeName = 'Sakura Blossom Artisan';
    baseColor = '#fff5f7';
    legendColor = '#4a4e69';
    modifierColor = '#fcd5ce';
    accentColor = '#f28482';
    font = 'inter';
  } else if (p.includes('dark') || p.includes('stealth') || p.includes('black') || p.includes('carbon')) {
    themeName = 'Stealth Obsidian Matrix';
    baseColor = '#18181b';
    legendColor = '#a1a1aa';
    modifierColor = '#27272a';
    accentColor = '#3f3f46';
    font = 'jetbrains-mono';
  } else if (p.includes('blue') || p.includes('ocean') || p.includes('nautilus') || p.includes('sea')) {
    themeName = 'Deep Ocean Abyss';
    baseColor = '#0b1d3a';
    legendColor = '#e0f2fe';
    modifierColor = '#1e3a5f';
    accentColor = '#38bdf8';
    font = 'inter';
  }

  const raw = {
    theme: {
      name: themeName,
      description: `Bespoke artisanal mechanical keycaps inspired by: "${input.prompt.slice(0, 100)}"`,
    },
    global: {
      profile: (input.options?.profile as any) || 'CHERRY',
      stem: 'MX',
      material: (input.options?.material as any) || 'PETG',
      finish: 'MATTE',
      baseColor,
      legendColor,
      font,
      stemToleranceMm: 0.15,
      wallMm: 1.5,
    },
    overrides: [
      {
        target: { group: 'MODIFIERS' },
        baseColor: modifierColor,
        legendColor,
      },
      {
        target: { group: 'ESC' },
        baseColor: accentColor,
        legendColor: baseColor,
      },
      {
        target: { group: 'ENTER' },
        baseColor: accentColor,
        legendColor: baseColor,
      },
      {
        target: { group: 'SPACE' },
        baseColor: modifierColor,
        legendColor,
      },
    ],
  };

  const { spec } = validateAndSanitizeDesignSpec(raw);
  return spec;
}

export class GeminiProvider implements LlmClient {
  private client: GoogleGenAI;
  private model: string;
  private apiKey: string;

  constructor(apiKey: string, model: string = 'gemini-2.5-flash') {
    this.apiKey = apiKey;
    this.client = new GoogleGenAI({ apiKey: apiKey || 'dummy-key' });
    this.model = model;
  }

  async generateDesignSpec(input: GenerateDesignInput): Promise<KeycapDesignSpec> {
    // 1. Guardrail input prompt moderation
    const moderation = moderatePrompt(input.prompt);
    if (moderation.flagged) {
      throw new Error(`Input prompt rejected by moderation policy: ${moderation.reason}`);
    }

    // Check for local mock / simulation mode when API key is not yet configured
    const isMockKey =
      !this.apiKey ||
      this.apiKey === 'your-gemini-api-key' ||
      this.apiKey === 'mock' ||
      this.apiKey.startsWith('mock_');

    if (isMockKey) {
      return generateMockDesignSpec(input);
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

        // In development mode, if the API key fails or network times out, gracefully fallback to local design engine
        if (process.env.NODE_ENV !== 'production') {
          console.warn(`[GeminiProvider] Google Gemini API request encountered error: ${err.message}. Falling back to local development generator.`);
          return generateMockDesignSpec(input);
        }

        throw err;
      }
    }

    throw lastError ?? new Error('Failed to generate valid design spec after retries.');
  }
}
