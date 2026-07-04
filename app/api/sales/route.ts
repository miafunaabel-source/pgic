import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { listAll, createItem } from "@/lib/dataStore";
import type { Vente } from "@/lib/data";

const venteSchema = z.object({
  clientNom: z.string().min(1),
  vehicule: z.string().min(1),
  montant: z.coerce.number().min(0),
  vendeur: z.string().optional(),
  financement: z.string().optional(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisÃ©" }, { status: 401 });
  const items = await listAll<Vente>("sales", session.user.id);
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisÃ©" }, { status: 401 });
  const parsed = venteSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  const body = parsed.data;
  const item = await createItem<Vente>("sales", session.user.id, {
    clientNom: body.clientNom,
    vehicule: body.vehicule,
    montant: body.montant,
    statut: "devis",
    vendeur: body.vendeur || (session.user as any).name || "â€”",
    date: new Date().toISOString().slice(0, 10),
    financement: body.financement || "En attente",
  });
  return NextResponse.json(item, { status: 201 });
}

