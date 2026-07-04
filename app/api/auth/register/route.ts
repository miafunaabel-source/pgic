import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { emailTaken, saveUser } from "@/lib/userStore";
import { checkRateLimit, recordFailedAttempt } from "@/lib/rate-limiter";
import { randomUUID } from "crypto";

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  company: z.record(z.string(), z.unknown()).optional(),
});

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
    const rateCheck = await checkRateLimit(`register:${ip}`);
    if (!rateCheck.allowed) {
      return NextResponse.json({ error: "Trop de tentatives. Réessayez dans 15 minutes." }, { status: 429 });
    }

    const body = schema.parse(await req.json());

    if (await emailTaken(body.email)) {
      return NextResponse.json({ error: "Cet email est déjà utilisé." }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(body.password, 12);
    await saveUser({
      id: randomUUID(),
      name: body.name,
      email: body.email.toLowerCase(),
      passwordHash,
      role: "directeur",
      company: body.company as Record<string, unknown> | undefined,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
