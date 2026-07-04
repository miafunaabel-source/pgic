import Redis from "ioredis";
import { randomUUID } from "crypto";

let client: Redis | null = null;

function getRedis(): Redis {
  if (!process.env.REDIS_URL) throw new Error("REDIS_URL non configuré");
  if (!client) {
    client = new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: 2, lazyConnect: true });
  }
  return client;
}

function key(entity: string, userId: string) {
  return `data:${entity}:${userId}`;
}

export async function listAll<T>(entity: string, userId: string): Promise<T[]> {
  try {
    const raw = await getRedis().get(key(entity, userId));
    if (!raw) return [];
    return JSON.parse(raw) as T[];
  } catch {
    return [];
  }
}

export async function createItem<T extends { id: string }>(
  entity: string,
  userId: string,
  data: Omit<T, "id">
): Promise<T> {
  const prefix = entity.slice(0, 3).toUpperCase();
  const item = { ...data, id: `${prefix}-${randomUUID().slice(0, 8)}` } as T;
  const current = await listAll<T>(entity, userId);
  await getRedis().set(key(entity, userId), JSON.stringify([item, ...current]));
  return item;
}

export async function updateItem<T extends { id: string }>(
  entity: string,
  userId: string,
  id: string,
  patch: Partial<T>
): Promise<T | null> {
  const current = await listAll<T>(entity, userId);
  const idx = current.findIndex((item) => item.id === id);
  if (idx === -1) return null;
  const updated = { ...current[idx], ...patch } as T;
  current[idx] = updated;
  await getRedis().set(key(entity, userId), JSON.stringify(current));
  return updated;
}

export async function removeItem<T extends { id: string }>(
  entity: string,
  userId: string,
  id: string
): Promise<boolean> {
  const current = await listAll<T>(entity, userId);
  const next = current.filter((item) => item.id !== id);
  if (next.length === current.length) return false;
  await getRedis().set(key(entity, userId), JSON.stringify(next));
  return true;
}
