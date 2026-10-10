import type { GenerateDesignInput } from '../client';

export function buildUserPrompt(input: GenerateDesignInput): string {
  const { prompt, layout, options } = input;

  const contextLines = [
    `Target Keyboard Model: ${layout.modelName}`,
    `Switch Type: ${layout.switchType}`,
    `Key Count: ${layout.keyCount}`,
    `Key Groups Available: ${layout.keyGroups.join(', ')}`,
  ];

  if (options) {
    if (options.profile) contextLines.push(`Preferred Profile: ${options.profile}`);
    if (options.material) contextLines.push(`Preferred Material: ${options.material}`);
    if (options.finish) contextLines.push(`Preferred Finish: ${options.finish}`);
    if (options.baseColor) contextLines.push(`Suggested Base Color: ${options.baseColor}`);
    if (options.legendColor) contextLines.push(`Suggested Legend Color: ${options.legendColor}`);
  }

  return `CONTEXT:
${contextLines.join('\n')}

USER DESIGN REQUEST:
"""
${prompt}
"""

Translate the user request into a complete KeycapDesignSpec by invoking emit_design_spec.`;
}
