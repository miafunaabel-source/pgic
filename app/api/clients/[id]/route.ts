import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { updateItem, removeItem } from "@/lib/dataStore";
import type { Client } from "@/lib/data";

const clientUpdateSchema = z.object({
  nom: z.string().min(1).optional(),
  prenom: z.string().min(1).optional(),
  email: z.string().email().optional(),
  telephone: z.string().optional(),
  ville: z.string().optional(),
  statut: z.enum(["prospect", "client", "inactif"]).optional(),
  vehicule: z.string().optional(),
  valeurTotale: z.number().min(0).optional(),
  score: z.number().min(0).max(100).optional(),
  derniereVisite: z.string().optional(),
});

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const { id } = await params;
  const parsed = clientUpdateSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  const updated = await updateItem<Client>("clients", session.user.id, id, parsed.data);
  if (!updated) return NextResponse.json({ error: "Non trouvé" }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const { id } = await params;
  const ok = await removeItem<Client>("clients", session.user.id, id);
  if (!ok) return NextResponse.json({ error: "Non trouvé" }, { status: 404 });
  return NextResponse.json({ success: true });
}
