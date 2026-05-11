/**
 * Rate limiter en mémoire pour les tentatives de connexion.
 * En production, remplacer par @upstash/ratelimit avec Redis
 * pour persister les compteurs entre redémarrages serveur.
 */

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;  // fenêtre glissante 15 min
const BLOCK_MS = 15 * 60 * 1000;   // blocage 15 min après 5 échecs

type Record = {
  count: number;
  firstAttempt: number;
  blockedUntil?: number;
};

const store = new Map<string, Record>();

// Nettoyage périodique pour éviter les fuites mémoire
setInterval(() => {
  const now = Date.now();
  for (const [key, rec] of store.entries()) {
    if (now - rec.firstAttempt > WINDOW_MS * 2) {
      store.delete(key);
    }
  }
}, 30 * 60 * 1000);

export type RateLimitResult =
  | { allowed: true; remaining: number }
  | { allowed: false; retryAfterMs: number };

export function checkRateLimit(identifier: string): RateLimitResult {
  const now = Date.now();
  const rec = store.get(identifier);

  if (!rec) {
    return { allowed: true, remaining: MAX_ATTEMPTS - 1 };
  }

  // Bloqué ?
  if (rec.blockedUntil && now < rec.blockedUntil) {
    return { allowed: false, retryAfterMs: rec.blockedUntil - now };
  }

  // Fenêtre expirée → réinitialiser
  if (now - rec.firstAttempt > WINDOW_MS) {
    store.delete(identifier);
    return { allowed: true, remaining: MAX_ATTEMPTS - 1 };
  }

  // Seuil atteint → bloquer
  if (rec.count >= MAX_ATTEMPTS) {
    rec.blockedUntil = now + BLOCK_MS;
    store.set(identifier, rec);
    return { allowed: false, retryAfterMs: BLOCK_MS };
  }

  return { allowed: true, remaining: MAX_ATTEMPTS - rec.count - 1 };
}

export function recordFailedAttempt(identifier: string): void {
  const now = Date.now();
  const rec = store.get(identifier);

  if (!rec || now - rec.firstAttempt > WINDOW_MS) {
    store.set(identifier, { count: 1, firstAttempt: now });
  } else {
    rec.count++;
    if (rec.count >= MAX_ATTEMPTS) {
      rec.blockedUntil = now + BLOCK_MS;
    }
    store.set(identifier, rec);
  }
}

export function resetAttempts(identifier: string): void {
  store.delete(identifier);
}
