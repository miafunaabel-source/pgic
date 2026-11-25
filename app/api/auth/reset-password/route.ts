import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { findUserByEmailStrict, saveUser, getRedis } from "@/lib/userStore";
import { checkRateLimit, recordFailedAttempt, resetAttempts } from "@/lib/rate-limiter";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const rateCheck = await checkRateLimit(`reset:${ip}`);
  if (!rateCheck.allowed) {
    const minutes = Math.ceil(rateCheck.retryAfterMs / 60000);
    return NextResponse.json({ error: `Trop de tentatives. Réessayez dans ${minutes} minute(s).` }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const token = typeof body?.token === "string" ? body.token : "";
  const password = typeof body?.password === "string" ? body.password : "";
  if (!/^[a-f0-9]{64}$/.test(token)) {
    await recordFailedAttempt(`reset:${ip}`);
    return NextResponse.json({ error: "Lien expiré ou invalide." }, { status: 400 });
  }
  if (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
    return NextResponse.json({ error: "Le mot de passe doit contenir au moins 8 caractères, une majuscule et un chiffre." }, { status: 400 });
  }

  try {
    const redis = getRedis();
    const email = await redis.get(`reset:${token}`);
    if (!email) {
      await recordFailedAttempt(`reset:${ip}`);
      return NextResponse.json({ error: "Lien expiré ou invalide. Faites une nouvelle demande." }, { status: 400 });
    }

    const user = await findUserByEmailStrict(email);
    if (!user) return NextResponse.json({ error: "Compte introuvable." }, { status: 404 });

    const passwordHash = await bcrypt.hash(password, 12);
    await saveUser({ ...user, passwordHash, passwordChangedAt: new Date().toISOString() });
    await redis.del(`reset:${token}`);
    await resetAttempts(`reset:${ip}`);
    return NextResponse.json({ ok: true, email: user.email });
  } catch (err) {
    console.error("[reset-password]", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Service momentanément indisponible. Réessayez dans quelques instants." }, { status: 503 });
  }
}
