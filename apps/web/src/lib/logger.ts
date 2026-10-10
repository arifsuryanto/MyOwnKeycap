import pino from 'pino';

/**
 * Structured JSON logger using pino.
 *
 * Rules (Spec Section 11):
 * - No PII in logs (emails, names, addresses)
 * - No secrets (tokens, API keys, QR strings)
 * - Correlation ID per request
 * - Audit log for admin actions (separate model, not here)
 */
export const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',

  // Redact sensitive fields from all log output
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      '*.password',
      '*.secret',
      '*.apiKey',
      '*.qrString',
      '*.access_token',
      '*.refresh_token',
      '*.id_token',
      '*.token',
      '*.hash',
      '*.email',
      '*.phone',
      '*.recipient',
      '*.line1',
      '*.line2',
    ],
    censor: '[REDACTED]',
  },

  formatters: {
    level: (label) => ({ level: label }),
  },

  ...(process.env.NODE_ENV === 'development'
    ? {
        transport: {
          target: 'pino-pretty',
          options: { colorize: true },
        },
      }
    : {}),
});

/**
 * Create a child logger with request correlation ID.
 */
export function requestLogger(requestId: string) {
  return logger.child({ requestId });
}
