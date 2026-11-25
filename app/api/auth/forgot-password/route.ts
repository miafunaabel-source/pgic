import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { findUserByEmailStrict, getRedis } from "@/lib/userStore";
import { checkRateLimit, recordFailedAttempt } from "@/lib/rate-limiter";

const APP_URL = process.env.NEXTAUTH_URL ?? "https://app.pgic.eu";
const SUPPORT_EMAIL = "support@pgic.eu";
const TOKEN_TTL = 3600;

async function sendResetEmail(email: string, token: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY non configuré");

  const resetUrl = `${APP_URL}/reset-password/${token}`;
  const res = await fetch("https://api.resend.com/emails", {
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
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Resend ${res.status}: ${detail.slice(0, 300)}`);
  }
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const rateCheck = await checkRateLimit(`forgot:${ip}`);
  if (!rateCheck.allowed) {
    const minutes = Math.ceil(rateCheck.retryAfterMs / 60000);
    return NextResponse.json({ error: `Trop de demandes. Réessayez dans ${minutes} minute(s).` }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Email requis" }, { status: 400 });
  }

  // Problème de configuration (indépendant du compte) : on le dit au lieu d'afficher « email envoyé ».
  if (!process.env.RESEND_API_KEY) {
    console.error("[forgot-password] RESEND_API_KEY manquante : aucun email ne peut être envoyé");
    return NextResponse.json(
      { error: `L'envoi d'emails est momentanément indisponible. Contactez ${SUPPORT_EMAIL}.` },
      { status: 503 }
    );
  }

  await recordFailedAttempt(`forgot:${ip}`);

  try {
    const user = await findUserByEmailStrict(email);
    if (user) {
      const token = randomBytes(32).toString("hex");
      await getRedis().setex(`reset:${token}`, TOKEN_TTL, user.email);
      try {
        await sendResetEmail(user.email, token);
      } catch (err) {
        // Journalisé, mais même réponse au visiteur : on ne révèle pas si le compte existe.
        console.error("[forgot-password] envoi impossible:", err instanceof Error ? err.message : err);
      }
    }
  } catch (err) {
    console.error("[forgot-password]", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Service momentanément indisponible. Réessayez dans quelques instants." }, { status: 503 });
  }

  return NextResponse.json({ ok: true });
}
