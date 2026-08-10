export type RateLimitResult =
  | { allowed: true; remaining: number }
  | { allowed: false; retryAfterMs: number };

export async function checkRateLimit(_identifier: string): Promise<RateLimitResult> {
  return { allowed: true, remaining: 999 };
}

export async function recordFailedAttempt(_identifier: string): Promise<void> {}

export async function resetAttempts(_identifier: string): Promise<void> {}
