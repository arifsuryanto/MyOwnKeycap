import { z } from 'zod';
import { createHash } from 'crypto';

// ─── Primitives ──────────────────────────────────────────────

export const Profile = z.enum(['CHERRY', 'OEM']);
export type Profile = z.infer<typeof Profile>;

export const StemType = z.enum(['MX']);
export type StemType = z.infer<typeof StemType>;

export const Material = z.enum(['PETG', 'PLA', 'ASA']);
export type Material = z.infer<typeof Material>;

export const Finish = z.enum(['RAW', 'SANDED', 'PAINTED']);
export type Finish = z.infer<typeof Finish>;

export const FontId = z.enum([
  'inter-bold',
  'jetbrains-mono',
  'space-grotesk',
  'noto-sans-jp',
]);
export type FontId = z.infer<typeof FontId>;

const Hex = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, 'Must be a valid hex color (e.g., #FF00AA)');

// ─── Legend ──────────────────────────────────────────────────

export const LegendSpec = z
  .object({
    text: z
      .string()
      .min(1)
      .max(8)
      .regex(/^[\p{L}\p{N}\p{P}\p{S} ]+$/u, 'Only letters, numbers, punctuation, symbols, and spaces'),
    font: FontId,
    sizeMm: z.number().min(2).max(9),
    depthMm: z.number().min(0.2).max(0.8),
    mode: z.enum(['ENGRAVE', 'EMBOSS']),
    position: z.enum(['CENTER', 'TOP_LEFT', 'FRONT']),
  })
  .strict();
export type LegendSpec = z.infer<typeof LegendSpec>;

// ─── Key Groups ──────────────────────────────────────────────

export const KeyGroup = z.enum([
  'MODIFIERS',
  'ALPHAS',
  'NUMBERS',
  'FUNCTION',
  'ARROWS',
  'NUMPAD',
  'ESC',
  'ENTER',
  'SPACE',
]);
export type KeyGroup = z.infer<typeof KeyGroup>;

// ─── Overrides ───────────────────────────────────────────────

export const KeyOverride = z
  .object({
    target: z.union([
      z.object({ keyId: z.string().max(32) }).strict(),
      z.object({ group: KeyGroup }).strict(),
    ]),
    baseColor: Hex.optional(),
    legendColor: Hex.optional(),
    legend: LegendSpec.optional(),
  })
  .strict();
export type KeyOverride = z.infer<typeof KeyOverride>;

// ─── Main Spec ───────────────────────────────────────────────

export const KeycapDesignSpec = z
  .object({
    theme: z
      .object({
        name: z.string().max(60),
        description: z.string().max(240),
      })
      .strict(),
    global: z
      .object({
        profile: Profile,
        stem: StemType,
        material: Material,
        finish: Finish,
        baseColor: Hex,
        legendColor: Hex,
        font: FontId,
        stemToleranceMm: z.number().min(0.05).max(0.3).default(0.15),
        wallMm: z.number().min(1.2).max(2.4).default(1.5),
      })
      .strict(),
    overrides: z.array(KeyOverride).max(60),
  })
  .strict();
export type KeycapDesignSpec = z.infer<typeof KeycapDesignSpec>;

// ─── Helpers ─────────────────────────────────────────────────

/**
 * Produce a canonical JSON string from a KeycapDesignSpec.
 * Keys sorted recursively for deterministic hashing.
 */
export function canonicalize(spec: KeycapDesignSpec): string {
  return JSON.stringify(spec, (_key, value) => {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return Object.keys(value)
        .sort()
        .reduce(
          (sorted, k) => {
            sorted[k] = value[k];
            return sorted;
          },
          {} as Record<string, unknown>,
        );
    }
    return value;
  });
}

/**
 * SHA-256 hash of the canonicalized spec. Used for deduplication and caching.
 */
export function specHash(spec: KeycapDesignSpec): string {
  return createHash('sha256').update(canonicalize(spec)).digest('hex');
}
