import { z } from 'zod';

// ─── Common ──────────────────────────────────────────────────

/** Standard API error response */
export const ApiError = z
  .object({
    error: z.object({
      code: z.string(),
      message: z.string(),
      details: z.record(z.unknown()).optional(),
    }),
  })
  .strict();
export type ApiError = z.infer<typeof ApiError>;

// ─── Keyboard ────────────────────────────────────────────────

export const ListKeyboardsQuery = z.object({
  brand: z.string().max(50).optional(),
  switchType: z.string().max(20).optional(),
  verified: z
    .string()
    .transform((v) => v === 'true')
    .optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});
export type ListKeyboardsQuery = z.infer<typeof ListKeyboardsQuery>;

// ─── Design ──────────────────────────────────────────────────

export const CreateDesignBody = z
  .object({
    keyboardModelId: z.string().cuid().optional(),
    customLayout: z.unknown().optional(), // Validated separately as KLE
    prompt: z.string().min(3).max(600),
    options: z
      .object({
        profile: z.enum(['CHERRY', 'OEM']).optional(),
        material: z.enum(['PETG', 'PLA', 'ASA']).optional(),
        finish: z.enum(['RAW', 'SANDED', 'PAINTED']).optional(),
        baseColor: z
          .string()
          .regex(/^#[0-9a-fA-F]{6}$/)
          .optional(),
        legendColor: z
          .string()
          .regex(/^#[0-9a-fA-F]{6}$/)
          .optional(),
      })
      .strict()
      .optional(),
  })
  .strict()
  .refine(
    (d) => d.keyboardModelId !== undefined || d.customLayout !== undefined,
    'Either keyboardModelId or customLayout is required',
  );
export type CreateDesignBody = z.infer<typeof CreateDesignBody>;

// ─── Quote ───────────────────────────────────────────────────

export const QuoteRequestBody = z
  .object({
    designId: z.string().cuid().optional(),
    items: z
      .array(
        z.object({
          assetId: z.string().cuid(),
          qty: z.number().int().min(1).max(999),
        }),
      )
      .min(1)
      .max(200)
      .optional(),
    bundleCode: z.string().max(50).optional(),
    addressId: z.string().cuid().optional(),
    couponCode: z.string().max(50).optional(),
  })
  .strict();
export type QuoteRequestBody = z.infer<typeof QuoteRequestBody>;

// ─── Order ───────────────────────────────────────────────────

export const CreateOrderBody = z
  .object({
    designId: z.string().cuid(),
    addressId: z.string().cuid(),
    bundleCode: z.string().max(50).optional(),
    couponCode: z.string().max(50).optional(),
  })
  .strict();
export type CreateOrderBody = z.infer<typeof CreateOrderBody>;

export const CancelOrderBody = z
  .object({
    reason: z.string().max(500).optional(),
  })
  .strict();
export type CancelOrderBody = z.infer<typeof CancelOrderBody>;

// ─── Address ─────────────────────────────────────────────────

export const CreateAddressBody = z
  .object({
    label: z.string().max(50).optional(),
    recipient: z.string().min(2).max(100),
    phone: z.string().min(8).max(20),
    line1: z.string().min(5).max(200),
    line2: z.string().max(200).optional(),
    city: z.string().min(2).max(100),
    province: z.string().min(2).max(100),
    postalCode: z.string().min(3).max(10),
    areaId: z.string().max(50).optional(),
    isDefault: z.boolean().optional(),
  })
  .strict();
export type CreateAddressBody = z.infer<typeof CreateAddressBody>;

// ─── Pagination ──────────────────────────────────────────────

export const PaginationQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
export type PaginationQuery = z.infer<typeof PaginationQuery>;
