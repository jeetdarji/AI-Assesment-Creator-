// filepath: backend/src/config/redis.ts
// description: Redis client singleton (ioredis) + BullMQ connection config.
// Upstash requires enableReadyCheck: false (no INFO permission).

import IORedis, { Redis, RedisOptions } from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const REDIS_URL: string = process.env.REDIS_URL || "redis://localhost:6379";

/**
 * Parse a redis:// or rediss:// URL into ioredis-compatible options.
 * This is needed because BullMQ creates its own IORedis instances
 * from a config object — it does NOT accept a URL string.
 */
function parseRedisUrl(url: string): RedisOptions {
  const parsed = new URL(url);
  const useTls = parsed.protocol === "rediss:";

  return {
    host: parsed.hostname,
    port: Number(parsed.port) || 6379,
    username: parsed.username || undefined,
    password: decodeURIComponent(parsed.password) || undefined,
    ...(useTls ? { tls: { rejectUnauthorized: false } } : {}),
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  };
}

const REDIS_OPTIONS: RedisOptions = parseRedisUrl(REDIS_URL);

/**
 * Singleton Redis client for cacheService and general use.
 */
export const redisClient: Redis = new IORedis(REDIS_OPTIONS);

/**
 * Plain connection config for BullMQ Queue / Worker.
 * BullMQ creates its own IORedis instances internally, so we pass
 * a config object (not an instance) to ensure every internal connection
 * inherits enableReadyCheck: false — required for Upstash.
 */
export const bullmqConnection: RedisOptions = { ...REDIS_OPTIONS };

redisClient.on("connect", (): void => {
  console.log("\x1b[32m[Redis] Connected\x1b[0m");
});

redisClient.on("error", (err: Error): void => {
  console.error("\x1b[31m[Redis] Error:\x1b[0m", err.message);
});
