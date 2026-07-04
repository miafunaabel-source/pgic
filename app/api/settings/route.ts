import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getRedis } from "@/lib/userStore";
import { z } from "zod";

const schema = z.object({
  nom: z.string().min(1),
  ville: z.string().min(1),
  caObjectifAnnuel: z.number().positive(),
  caObjectifMensuel: z.number().positive(),
  objectifVentesMois: z.number().positive(),
  panierMoyen: z.number().positive(),
  objectifRdvSemaine: z.number().positive(),
  capaciteAtelier: z.number().positive(),
  nbTechniciens: z.number().positive(),
  objectifSatisfaction: z.number().min(1).max(100),
  margeObjectif: z.number().min(1).max(100),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  try {
    const raw = await getRedis().get(`settings:${session.user.id}`);
    if (!raw) return NextResponse.json(null);
    return NextResponse.json(JSON.parse(raw));
  } catch {
    return NextResponse.json(null);
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  try {
    const body = schema.parse(await req.json());
    await getRedis().set(`settings:${session.user.id}`, JSON.stringify(body));
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
