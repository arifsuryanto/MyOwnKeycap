import Redis from 'ioredis';

const globalForRedis = globalThis as unknown as { redis: Redis };

/**
 * Singleton Redis client for the web app.
 * Used by: rate limiter, BullMQ queue producer, caching.
 */
export const redis =
  globalForRedis.redis ??
  new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
    maxRetriesPerRequest: null, // Required by BullMQ
    lazyConnect: true,
  });

redis.on('error', (err) => {
  if (process.env.NODE_ENV !== 'production') {
    // Suppress spam in local dev if Redis is not started
  }
});

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis;
