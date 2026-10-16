import { z } from 'zod';

/**
 * Zod-validated environment variables.
 * Fails fast at boot if any required variable is missing or invalid.
 * See: KEYCAP_PLATFORM_SPEC.md Section 9
 */
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string(),

  // Auth
  AUTH_SECRET: z.string().min(32),
  AUTH_GOOGLE_ID: z.string().min(1),
  AUTH_GOOGLE_SECRET: z.string().min(1),
  AUTH_URL: z.string().url().optional(),
  ADMIN_EMAILS: z.string().transform((s) => s.split(',').map((e) => e.trim().toLowerCase())),

  // Storage (S3-compatible)
  S3_ENDPOINT: z.string().url(),
  S3_BUCKET: z.string().min(1),
  S3_ACCESS_KEY: z.string().min(1),
  S3_SECRET_KEY: z.string().min(1),
  S3_SIGNED_URL_TTL: z.coerce.number().int().min(60).default(300),

  // LLM
  LLM_API_KEY: z.string().min(1),
  LLM_MODEL: z.string().default('gemini-2.5-flash'),
  AI_FREE_DAILY: z.coerce.number().int().min(0).default(5),
  AI_MAX_TOKENS: z.coerce.number().int().min(256).default(4096),

  // CAD Service
  CAD_SERVICE_URL: z.string().url(),
  CAD_SHARED_SECRET: z.string().min(8),

  // Payment
  PAYMENT_PROVIDER: z.enum(['xendit', 'midtrans']).default('xendit'),
  PAYMENT_API_KEY: z.string().min(1),
  PAYMENT_WEBHOOK_TOKEN: z.string().min(8),
  QRIS_EXPIRY_MIN: z.coerce.number().int().min(5).default(30),

  // Shipping
  SHIPPING_PROVIDER: z.string().default('biteship'),
  SHIPPING_API_KEY: z.string().default(''),
  ORIGIN_AREA_ID: z.string().default(''),

  // Email
  RESEND_API_KEY: z.string().default(''),

  // Observability
  SENTRY_DSN: z.string().optional(),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),

  // Capacity
  MAX_QUEUE_DAYS: z.coerce.number().int().min(1).default(7),
  FAILURE_RATE_DEFAULT: z.coerce.number().min(0).max(1).default(0.15),

  // Node
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('❌ Invalid environment variables:');
    for (const issue of result.error.issues) {
      console.error(`  ${issue.path.join('.')}: ${issue.message}`);
    }
    throw new Error('Invalid environment variables — see above');
  }
  return result.data;
}

export const env = validateEnv();
