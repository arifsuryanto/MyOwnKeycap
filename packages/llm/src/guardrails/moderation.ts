/**
 * Moderation filter for keycap design prompts and generated content.
 * Checks for:
 * 1. SARA / hate speech / adult content
 * 2. Third-party trademarks (Nintendo, Pokemon, Disney, Nike, Apple, etc.)
 * 3. Jailbreak / injection indicators (ignore previous, emit gcode, rm -rf, etc.)
 */

const TRADEMARKS = [
  'nintendo',
  'pokemon',
  'pokémon',
  'pikachu',
  'disney',
  'marvel',
  'star wars',
  'nike',
  'adidas',
  'apple',
  'microsoft',
  'coca-cola',
  'pepsi',
  'gucci',
  'louis vuitton',
  'chanel',
];

const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior|above)\s+instructions/i,
  /system\s*prompt/i,
  /emit\s+(gcode|g-code|shell|bash|python)/i,
  /sudo\s+/i,
  /drop\s+table/i,
  /delete\s+from/i,
  /<script>/i,
];

const PROFANITY_AND_HATE = [
  /\b(nazi|hitler|swastika|white\s*power|isis|terrorist)\b/i,
  /\b(porn|nsfw|hentai|sex|nude|penis|vagina)\b/i,
];

export interface ModerationResult {
  flagged: boolean;
  category?: 'TRADEMARK' | 'INJECTION' | 'SAFETY';
  reason?: string;
}

export function moderatePrompt(text: string): ModerationResult {
  const normalized = text.toLowerCase().trim();

  // 1. Check prompt injection attempts
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(normalized)) {
      return {
        flagged: true,
        category: 'INJECTION',
        reason: 'Prompt contains prohibited instructions or prompt injection attempts.',
      };
    }
  }

  // 2. Check hate / SARA / adult content
  for (const pattern of PROFANITY_AND_HATE) {
    if (pattern.test(normalized)) {
      return {
        flagged: true,
        category: 'SAFETY',
        reason: 'Prompt contains safety-prohibited or adult content.',
      };
    }
  }

  // 3. Check trademarks
  for (const tm of TRADEMARKS) {
    const tmRegex = new RegExp(`\\b${tm}\\b`, 'i');
    if (tmRegex.test(normalized)) {
      return {
        flagged: true,
        category: 'TRADEMARK',
        reason: `Prohibited trademark detected: "${tm}". Please use original or generic themes.`,
      };
    }
  }

  return { flagged: false };
}
