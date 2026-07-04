import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { updateItem, removeItem } from "@/lib/dataStore";
import type { Campaign } from "@/lib/data";

const CIBLE_COUNTS: Record<string, number> = {
  "":          265,
  "prospect":  48,
  "inactif":   34,
  "recent":    71,
  "peugeot":   112,
};

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await req.json();
  let patch: Partial<Campaign> = body;

  if (body.statut === "actif") {
    const base = CIBLE_COUNTS[body.cible ?? ""] ?? 150;
    const envoyes = base + Math.floor(Math.random() * 20 - 10);
    const openRate = body.canal === "SMS" ? 0.91 : 0.61;
    const clickRate = body.canal === "SMS" ? 0.38 : 0.17;
    patch = {
      statut: "actif",
      envoyes,
      ouverts: Math.round(envoyes * openRate),
      clics: Math.round(envoyes * openRate * clickRate),
    };
  }

  const updated = await updateItem<Campaign>("campaigns", session.user.id, params.id, patch);
  if (!updated) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const ok = await removeItem<Campaign>("campaigns", session.user.id, params.id);
  if (!ok) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  return new NextResponse(null, { status: 204 });
}
