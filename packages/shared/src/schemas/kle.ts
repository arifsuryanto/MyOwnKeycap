import { z } from 'zod';

// ─── KLE Key ─────────────────────────────────────────────────

/**
 * A single key in a simplified KLE-compatible layout format.
 * This is the internal representation used throughout the platform.
 */
export const KleKey = z
  .object({
    id: z.string().max(32),
    label: z.string().max(16),
    size: z.number().min(1).max(7), // In units (1u, 1.25u, ..., 6.25u)
    row: z.number().int().min(-1).max(6),
    col: z.number().min(0).max(25),
    height: z.number().min(1).max(2).optional(), // For ISO Enter, etc.
    stepped: z.boolean().optional(),
    group: z.string().max(20).optional(), // For grouping overrides
  })
  .strict();
export type KleKey = z.infer<typeof KleKey>;

// ─── KLE Layout ──────────────────────────────────────────────

export const KleLayout = z
  .object({
    name: z.string().max(100),
    keys: z.array(KleKey).min(1).max(200),
  })
  .strict();
export type KleLayout = z.infer<typeof KleLayout>;

// ─── KLE Import Validation ──────────────────────────────────

/**
 * Validates a raw KLE JSON import (from keyboard-layout-editor.com).
 * Accepts the raw KLE JSON array format and converts to our internal format.
 * Max file size: 200 KB (enforced at the route handler level).
 */
export const KleImportSchema = z
  .array(z.union([z.record(z.unknown()), z.string()]))
  .min(1)
  .max(200);
export type KleImport = z.infer<typeof KleImportSchema>;
