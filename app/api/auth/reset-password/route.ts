import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { findUserByEmail, saveUser, getRedis } from "@/lib/userStore";
import { checkRateLimit, recordFailedAttempt, resetAttempts } from "@/lib/rate-limiter";

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
    const rateCheck = await checkRateLimit(`reset:${ip}`);
    if (!rateCheck.allowed) {
      const minutes = Math.ceil(rateCheck.retryAfterMs / 60000);
      return NextResponse.json(
        { error: `Trop de tentatives. Réessayez dans ${minutes} minute(s).` },
        { status: 429 }
      );
    }

    const { token, password } = await req.json();
    if (!token || !password || password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      await recordFailedAttempt(`reset:${ip}`);
      return NextResponse.json({ error: "Le mot de passe doit contenir au moins 8 caractères, une majuscule et un chiffre." }, { status: 400 });
    }

    const redis = getRedis();
    const email = await redis.get(`reset:${token}`);
    if (!email) {
      await recordFailedAttempt(`reset:${ip}`);
      return NextResponse.json({ error: "Lien expiré ou invalide." }, { status: 400 });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await saveUser({ ...user, passwordHash, passwordChangedAt: new Date().toISOString() });
    await redis.del(`reset:${token}`);
    await resetAttempts(`reset:${ip}`);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
