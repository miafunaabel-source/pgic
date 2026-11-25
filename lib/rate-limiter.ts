import { getRedis } from "@/lib/userStore";

export type RateLimitResult =
  | { allowed: true; remaining: number }
  | { allowed: false; retryAfterMs: number };

// 5 échecs max par fenêtre de 15 minutes et par identifiant, stockés dans Redis.
// En cas de panne Redis, on laisse passer (fail-open) pour ne jamais bloquer un client légitime.
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

const key = (identifier: string) => `rl:app:${identifier}`;

export async function checkRateLimit(identifier: string): Promise<RateLimitResult> {
  try {
    const redis = getRedis();
    const [count, ttl] = await Promise.all([redis.get(key(identifier)), redis.pttl(key(identifier))]);
    const attempts = Number(count ?? 0);
    if (attempts >= MAX_ATTEMPTS) return { allowed: false, retryAfterMs: ttl > 0 ? ttl : WINDOW_MS };
    return { allowed: true, remaining: MAX_ATTEMPTS - attempts };
  } catch (err) {
    console.error("[rate-limiter] check failed:", err instanceof Error ? err.message : err);
    return { allowed: true, remaining: MAX_ATTEMPTS };
  }
}

export async function recordFailedAttempt(identifier: string): Promise<void> {
  try {
    const redis = getRedis();
    const count = await redis.incr(key(identifier));
    if (count === 1) await redis.pexpire(key(identifier), WINDOW_MS);
  } catch (err) {
    console.error("[rate-limiter] record failed:", err instanceof Error ? err.message : err);
  }
}

export async function resetAttempts(identifier: string): Promise<void> {
  try {
    await getRedis().del(key(identifier));
  } catch (err) {
    console.error("[rate-limiter] reset failed:", err instanceof Error ? err.message : err);
  }
}
