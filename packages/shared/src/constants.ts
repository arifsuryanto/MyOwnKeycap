// ─── Application Constants ───────────────────────────────────
// All magic numbers in one place. No hardcoding elsewhere.

/** AI Design Limits */
export const AI = {
  /** Free daily design generations for each user */
  FREE_DAILY: 5,
  /** Maximum prompt length (characters) */
  MAX_PROMPT_LENGTH: 600,
  /** Maximum tokens per LLM request */
  MAX_TOKENS: 4096,
  /** Maximum retries for LLM output validation */
  MAX_RETRIES: 2,
  /** Cache TTL for design specs (seconds) */
  CACHE_TTL: 86400 * 30, // 30 days
} as const;

/** Keycap Physical Constraints */
export const KEYCAP = {
  /** Standard pitch between keys (mm) */
  PITCH_MM: 19.05,
  /** Standard 1u keycap bottom footprint (mm) */
  FOOTPRINT_1U_MM: 18.0,
  /** MX stem cross dimensions (mm) — nominal */
  STEM_MX_WIDTH: 4.0,
  STEM_MX_THICKNESS: 1.3,
  /** Minimum wall thickness for printability (mm) */
  MIN_WALL_MM: 1.2,
  /** Maximum legend characters per key */
  MAX_LEGEND_CHARS: 8,
  /** Maximum keys per layout */
  MAX_KEYS: 200,
  /** Maximum unique keycap geometries per design (for performance) */
  MAX_UNIQUE_ASSETS: 30,
} as const;

/** Payment */
export const PAYMENT = {
  /** QRIS QR code expiry (minutes) */
  QRIS_EXPIRY_MIN: 30,
  /** Quote validity (minutes) */
  QUOTE_VALIDITY_MIN: 30,
  /** Reconciliation interval (minutes) */
  RECONCILE_INTERVAL_MIN: 5,
  /** Minimum time before checking pending payment status (ms) */
  PENDING_CHECK_DELAY_MS: 120_000, // 2 minutes
} as const;

/** Printing */
export const PRINTING = {
  /** Heartbeat interval (seconds) */
  HEARTBEAT_INTERVAL_S: 15,
  /** Offline threshold — alert after this many seconds without heartbeat */
  OFFLINE_THRESHOLD_S: 60,
  /** Maximum print job attempts before requiring manual intervention */
  MAX_ATTEMPTS: 3,
  /** Maximum nozzle temperature per material (°C) — safety limits */
  MAX_NOZZLE_TEMP: {
    PETG: 260,
    PLA: 230,
    ASA: 270,
  } as Record<string, number>,
  /** Maximum bed temperature per material (°C) */
  MAX_BED_TEMP: {
    PETG: 90,
    PLA: 70,
    ASA: 110,
  } as Record<string, number>,
  /** Dangerous G-code commands that must never appear */
  DANGEROUS_GCODE: ['M500', 'M502', 'M997', 'M112'],
} as const;

/** Capacity Planning */
export const CAPACITY = {
  /** Maximum queue depth in days before pausing new orders */
  MAX_QUEUE_DAYS: 7,
  /** Estimated keys per hour per printer (FDM, batch) */
  KEYS_PER_HOUR: 1.6,
  /** Realistic keys per day per printer (with supervision) */
  KEYS_PER_DAY: 28,
} as const;

/** Security */
export const SECURITY = {
  /** Signed URL TTL (seconds) */
  SIGNED_URL_TTL: 300,
  /** Maximum KLE import file size (bytes) */
  MAX_KLE_FILE_SIZE: 200 * 1024, // 200 KB
  /** Maximum SVG upload size (bytes) */
  MAX_SVG_SIZE: 500 * 1024, // 500 KB
  /** Admin session idle timeout (minutes) */
  ADMIN_SESSION_TIMEOUT_MIN: 30,
  /** Re-auth window for sensitive admin actions (minutes) */
  ADMIN_REAUTH_WINDOW_MIN: 10,
  /** Rate limits (requests per window) */
  RATE_LIMITS: {
    LOGIN: { max: 10, windowMs: 60_000 },
    QUOTE: { max: 30, windowMs: 60_000 },
    DESIGN: { max: 10, windowMs: 60_000 },
    PAY: { max: 5, windowMs: 60_000 },
    API: { max: 60, windowMs: 60_000 },
  },
} as const;

/** Data Retention (days) */
export const RETENTION = {
  /** LLM prompt logs */
  PROMPT_LOGS: 90,
  /** Application logs */
  APP_LOGS: 30,
  /** Audit logs — kept indefinitely but archived after N days */
  AUDIT_ARCHIVE: 365,
} as const;
