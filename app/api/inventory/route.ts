import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { randomUUID } from "crypto";
import { authOptions } from "@/lib/auth";
import { listAll, createItem } from "@/lib/dataStore";
import type { Vehicule } from "@/lib/data";

const vehiculeSchema = z.object({
  marque: z.string().min(1),
  modele: z.string().min(1),
  annee: z.coerce.number().int().min(1900).max(2030),
  prix: z.coerce.number().min(0),
  carburant: z.string().optional(),
  couleur: z.string().optional(),
  type: z.enum(["neuf", "occasion"]).optional(),
  kilometrage: z.coerce.number().int().min(0).optional(),
  vin: z.string().optional(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisÃ©" }, { status: 401 });
  const items = await listAll<Vehicule>("inventory", session.user.id);
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisÃ©" }, { status: 401 });
  const parsed = vehiculeSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  const body = parsed.data;
  const item = await createItem<Vehicule>("inventory", session.user.id, {
    marque: body.marque,
    modele: body.modele,
    annee: body.annee,
    prix: body.prix,
    carburant: body.carburant || "Essence",
    couleur: body.couleur || "â€”",
    type: body.type ?? "neuf",
    statut: "disponible",
    kilometrage: body.kilometrage ?? 0,
    vin: body.vin || randomUUID(),
  });
  return NextResponse.json(item, { status: 201 });
}

