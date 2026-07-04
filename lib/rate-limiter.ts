import { getRedis } from "./userStore";

const MAX_ATTEMPTS = 5;
const WINDOW_SECONDS = 15 * 60;
const BLOCK_SECONDS = 15 * 60;

export type RateLimitResult =
  | { allowed: true; remaining: number }
  | { allowed: false; retryAfterMs: number };

export async function checkRateLimit(identifier: string): Promise<RateLimitResult> {
  const redis = getRedis();
  const blockKey = `rl:block:${identifier}`;
  const countKey = `rl:count:${identifier}`;

  const ttl = await redis.ttl(blockKey);
  if (ttl > 0) return { allowed: false, retryAfterMs: ttl * 1000 };

  const count = await redis.get(countKey);
  const current = count ? parseInt(count, 10) : 0;
  if (current >= MAX_ATTEMPTS) return { allowed: false, retryAfterMs: BLOCK_SECONDS * 1000 };

  return { allowed: true, remaining: MAX_ATTEMPTS - current };
}

export async function recordFailedAttempt(identifier: string): Promise<void> {
  const redis = getRedis();
  const countKey = `rl:count:${identifier}`;
  const blockKey = `rl:block:${identifier}`;

  const count = await redis.incr(countKey);
  if (count === 1) await redis.expire(countKey, WINDOW_SECONDS);
  if (count >= MAX_ATTEMPTS) await redis.setex(blockKey, BLOCK_SECONDS, "1");
}

export async function resetAttempts(identifier: string): Promise<void> {
  const redis = getRedis();
  await redis.del(`rl:count:${identifier}`, `rl:block:${identifier}`);
}
