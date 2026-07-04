import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { updateItem, removeItem } from "@/lib/dataStore";
import type { Vente } from "@/lib/data";

const venteUpdateSchema = z.object({
  clientNom: z.string().min(1).optional(),
  vehicule: z.string().min(1).optional(),
  montant: z.number().min(0).optional(),
  vendeur: z.string().optional(),
  financement: z.string().optional(),
  statut: z.enum(["devis", "commande", "finance", "livre"]).optional(),
  date: z.string().optional(),
});

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const { id } = await params;
  const parsed = venteUpdateSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  const updated = await updateItem<Vente>("sales", session.user.id, id, parsed.data);
  if (!updated) return NextResponse.json({ error: "Non trouvé" }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const { id } = await params;
  const ok = await removeItem<Vente>("sales", session.user.id, id);
  if (!ok) return NextResponse.json({ error: "Non trouvé" }, { status: 404 });
  return NextResponse.json({ success: true });
}
