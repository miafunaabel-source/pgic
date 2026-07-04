import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { listAll, createItem } from "@/lib/dataStore";
import type { Client } from "@/lib/data";

const clientSchema = z.object({
  nom: z.string().min(1),
  prenom: z.string().min(1),
  email: z.string().email(),
  telephone: z.string().optional(),
  ville: z.string().optional(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisÃ©" }, { status: 401 });
  const items = await listAll<Client>("clients", session.user.id);
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisÃ©" }, { status: 401 });
  const parsed = clientSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  const body = parsed.data;
  const item = await createItem<Client>("clients", session.user.id, {
    nom: body.nom,
    prenom: body.prenom,
    email: body.email,
    telephone: body.telephone || "â€”",
    ville: body.ville || "â€”",
    statut: "prospect",
    score: 30,
    vehicule: "",
    derniereVisite: new Date().toISOString().slice(0, 10),
    valeurTotale: 0,
  });
  return NextResponse.json(item, { status: 201 });
}

