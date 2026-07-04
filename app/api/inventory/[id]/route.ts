import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { updateItem, removeItem } from "@/lib/dataStore";
import type { Vehicule } from "@/lib/data";

const vehiculeUpdateSchema = z.object({
  marque: z.string().min(1).optional(),
  modele: z.string().min(1).optional(),
  annee: z.number().int().min(1900).max(2030).optional(),
  prix: z.number().min(0).optional(),
  carburant: z.string().optional(),
  couleur: z.string().optional(),
  type: z.enum(["neuf", "occasion"]).optional(),
  statut: z.enum(["disponible", "reserve", "vendu", "transit"]).optional(),
  kilometrage: z.number().int().min(0).optional(),
  vin: z.string().optional(),
  photo: z.string().optional(),
});

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const { id } = await params;
  const parsed = vehiculeUpdateSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  const updated = await updateItem<Vehicule>("inventory", session.user.id, id, parsed.data);
  if (!updated) return NextResponse.json({ error: "Non trouvé" }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const { id } = await params;
  const ok = await removeItem<Vehicule>("inventory", session.user.id, id);
  if (!ok) return NextResponse.json({ error: "Non trouvé" }, { status: 404 });
  return NextResponse.json({ success: true });
}
