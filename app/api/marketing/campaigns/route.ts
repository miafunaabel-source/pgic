import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { listAll, createItem } from "@/lib/dataStore";
import type { Campaign } from "@/lib/data";

const schema = z.object({
  nom: z.string().min(1),
  canal: z.enum(["Email", "SMS"]),
  cible: z.string(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const items = await listAll<Campaign>("campaigns", session.user.id);
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  const { nom, canal, cible } = parsed.data;
  const item = await createItem<Campaign>("campaigns", session.user.id, {
    nom,
    canal,
    cible,
    envoyes: 0,
    ouverts: 0,
    clics: 0,
    statut: "planifie",
    date: new Date().toISOString().slice(0, 10),
  });
  return NextResponse.json(item, { status: 201 });
}
