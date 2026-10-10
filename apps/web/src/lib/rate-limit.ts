import { redis } from './redis';

/**
 * Redis sliding-window rate limiter.
 *
 * Uses a sorted set per key with timestamps as scores.
 * Thread-safe via Redis atomicity.
 *
 * See: KEYCAP_PLATFORM_SPEC.md Section 11.2
 */
export async function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<{ success: boolean; remaining: number; resetMs: number }> {
  const now = Date.now();
  const windowStart = now - windowMs;

  const pipe = redis.pipeline();
  // Remove expired entries
  pipe.zremrangebyscore(key, 0, windowStart);
  // Add current request
  pipe.zadd(key, now.toString(), `${now}-${Math.random().toString(36).slice(2)}`);
  // Count entries in window
  pipe.zcard(key);
  // Set expiry on the key itself
  pipe.pexpire(key, windowMs);

  const results = await pipe.exec();
  const count = (results?.[2]?.[1] as number) ?? 0;
  const remaining = Math.max(0, limit - count);

  return {
    success: count <= limit,
    remaining,
    resetMs: windowMs,
  };
}

/**
 * Pre-configured rate limiters for specific routes.
 * Uses the constants from @keycap/shared.
 */
export function rateLimitKey(prefix: string, identifier: string): string {
  return `rl:${prefix}:${identifier}`;
}
