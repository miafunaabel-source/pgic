import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { findUserByEmail, getRedis } from "@/lib/userStore";
import { checkRateLimit, recordFailedAttempt } from "@/lib/rate-limiter";

const SITE_URL = process.env.NEXTAUTH_URL ?? "https://app.pgic.eu";
const TOKEN_TTL = 3600;

async function sendResetEmail(email: string, token: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("Service email non configuré");

  const resetUrl = `${SITE_URL}/reset-password/${token}`;
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "PGIC <noreply@pgic.eu>",
      to: [email],
      subject: "Réinitialisation de votre mot de passe PGIC",
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:32px 16px">
          <div style="background:#2563eb;border-radius:12px;padding:20px 24px;margin-bottom:24px">
            <h1 style="color:#fff;font-size:20px;margin:0">PGIC</h1>
          </div>
          <h2 style="color:#0f172a;font-size:18px;margin-bottom:8px">Réinitialisation du mot de passe</h2>
          <p style="color:#475569;font-size:14px;line-height:1.6;margin-bottom:24px">
            Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe.
            Ce lien est valable <strong>1 heure</strong>.
          </p>
          <a href="${resetUrl}" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600">
            Réinitialiser mon mot de passe
          </a>
          <p style="color:#94a3b8;font-size:12px;margin-top:24px">
            Si vous n'avez pas effectué cette demande, ignorez cet email. Votre mot de passe restera inchangé.
          </p>
        </div>
      `,
    }),
  });
}

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
    const rateCheck = await checkRateLimit(`forgot:${ip}`);
    if (!rateCheck.allowed) {
      const minutes = Math.ceil(rateCheck.retryAfterMs / 60000);
      return NextResponse.json(
        { error: `Trop de tentatives. Réessayez dans ${minutes} minute(s).` },
        { status: 429 }
      );
    }

    const { email } = await req.json();
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email requis" }, { status: 400 });
    }

    await recordFailedAttempt(`forgot:${ip}`);

    const user = await findUserByEmail(email.toLowerCase());
    if (user) {
      const token = randomBytes(32).toString("hex");
      await getRedis().setex(`reset:${token}`, TOKEN_TTL, email.toLowerCase());
      try {
        await sendResetEmail(email.toLowerCase(), token);
      } catch {
        // Silently fail — don't leak whether email exists
      }
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
