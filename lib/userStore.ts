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

export type UserRecord = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  company?: CompanyData;
  setupComplete?: boolean;
  passwordChangedAt?: string;
};

let client: Redis | null = null;

export function getRedis(): Redis {
  if (!process.env.REDIS_URL) throw new Error("REDIS_URL non configuré");
  if (!client) {
    client = new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: 2, lazyConnect: true });
  }
  return client;
}

export async function findUserByEmail(email: string): Promise<UserRecord | null> {
  try {
    const raw = await getRedis().get(`user:${email.toLowerCase()}`);
    if (!raw) return null;
    return JSON.parse(raw) as UserRecord;
  } catch {
    return null;
  }
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
