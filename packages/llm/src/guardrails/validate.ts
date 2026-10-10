import { KeycapDesignSpec, specHash, canonicalize } from '@keycap/shared';
import { clampDesignSpec } from './clamp';
import { moderatePrompt } from './moderation';

export class DesignSpecValidationError extends Error {
  constructor(message: string, public issues?: any[]) {
    super(message);
    this.name = 'DesignSpecValidationError';
  }
}

export function validateAndSanitizeDesignSpec(rawSpec: unknown): {
  spec: KeycapDesignSpec;
  hash: string;
  canonicalJson: string;
} {
  // 1. Clamp numeric limits and fallbacks
  const clamped = clampDesignSpec(rawSpec);

  // 2. Validate against Zod schema
  const parseResult = KeycapDesignSpec.safeParse(clamped);
  if (!parseResult.success) {
    throw new DesignSpecValidationError(
      'Generated design specification failed schema validation.',
      parseResult.error.issues,
    );
  }

  const spec = parseResult.data;

  // 3. Moderation check on output text fields
  const textToCheck = `${spec.theme.name} ${spec.theme.description}`;
  const modResult = moderatePrompt(textToCheck);
  if (modResult.flagged) {
    throw new DesignSpecValidationError(
      `Generated design content flagged by safety policy: ${modResult.reason}`,
    );
  }

  // 4. Compute hash and canonical JSON
  const hash = specHash(spec);
  const canonicalJson = canonicalize(spec);

  return { spec, hash, canonicalJson };
}
