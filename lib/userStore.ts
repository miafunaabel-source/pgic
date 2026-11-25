import type { Role } from "@/types/next-auth";
import Redis from "ioredis";

export type CompanyData = {
  concession?: string;
  prenom?: string;
  nom?: string;
  email?: string;
  tel?: string;
  adresse?: string;
  codePostal?: string;
  ville?: string;
  taille?: string;
  marques?: string[];
  description?: string;
  plan?: string;
};

// ⚠️ Format partagé avec le site (pgic-site/lib/userStore.ts) : même base Redis, mêmes clés `user:{email}`.
// L'abonnement est écrit par le site (Stripe) ; l'app ne fait que le lire pour autoriser l'accès.
export type SubscriptionStatus =
  | "pending" | "trialing" | "active" | "past_due" | "unpaid" | "canceled"
  | "incomplete" | "incomplete_expired" | "paused" | "cancelled";

export type SubscriptionInfo = {
  plan: string;
  status: SubscriptionStatus;
  createdAt?: string;
  trialEnd?: string;
  currentPeriodEnd?: string;
  cancelAt?: string;
  stripeCustomerId?: string;
};

export type UserRecord = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  company?: CompanyData;
  subscription?: SubscriptionInfo;
  setupComplete?: boolean;
  passwordChangedAt?: string;
};

const ACCESS_STATUSES = new Set<SubscriptionStatus>(["active", "trialing", "past_due"]);
const NEVER_PAID_STATUSES = new Set<SubscriptionStatus>(["pending", "incomplete", "incomplete_expired"]);

export type AccessDecision = "ok" | "payment_pending" | "subscription_inactive";

/** Accès au tableau de bord selon l'abonnement. Les comptes historiques sans abonnement gardent leur accès. */
export function dashboardAccess(user: Pick<UserRecord, "subscription">): AccessDecision {
  const status = user.subscription?.status;
  if (!status || ACCESS_STATUSES.has(status)) return "ok";
  return NEVER_PAID_STATUSES.has(status) ? "payment_pending" : "subscription_inactive";
}

let client: Redis | null = null;

export function getRedis(): Redis {
  const url = process.env.REDIS_URL ?? process.env.REDISS_REDIS_URL ?? process.env.KV_URL;
  if (!url) throw new Error("REDIS_URL non configuré");
  if (!client) {
    client = new Redis(url, { maxRetriesPerRequest: 2, lazyConnect: true });
  }
  return client;
}

/** Lecture tolérante : null si l'utilisateur n'existe pas OU si Redis est indisponible. */
export async function findUserByEmail(email: string): Promise<UserRecord | null> {
  try {
    return await findUserByEmailStrict(email);
  } catch {
    return null;
  }
}

/** Lecture stricte : lève une erreur si Redis est indisponible (pour ne pas confondre panne et mauvais identifiants). */
export async function findUserByEmailStrict(email: string): Promise<UserRecord | null> {
  const raw = await getRedis().get(`user:${email.trim().toLowerCase()}`);
  if (!raw) return null;
  return JSON.parse(raw) as UserRecord;
}

export async function saveUser(user: UserRecord): Promise<void> {
  await getRedis().set(`user:${user.email.toLowerCase()}`, JSON.stringify(user));
}

export async function emailTaken(email: string): Promise<boolean> {
  try {
    const result = await getRedis().exists(`user:${email.toLowerCase()}`);
    return result === 1;
  } catch {
    return false;
  }
}
