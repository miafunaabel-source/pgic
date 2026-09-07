import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { listAll, createItem } from "@/lib/dataStore";

export type Document = {
  id: string;
  nom: string;
  type: "contrat" | "facture" | "bon_commande" | "carte_grise" | "procuration" | "autre";
  status: "signe" | "en_attente" | "brouillon";
  client: string;
  vehicule?: string;
  date: string;
  taille: string;
  ajoutePar: string;
};

const schema = z.object({
  nom: z.string().min(1),
  type: z.enum(["contrat", "facture", "bon_commande", "carte_grise", "procuration", "autre"]),
  client: z.string().min(1),
  vehicule: z.string().optional(),
  taille: z.string().optional(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const items = await listAll<Document>("documents", session.user.id);
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  const { nom, type, client, vehicule, taille } = parsed.data;
  const item = await createItem<Document>("documents", session.user.id, {
    nom,
    type,
    client,
    vehicule: vehicule || undefined,
    status: "brouillon",
    date: new Date().toISOString().slice(0, 10),
    taille: taille || "—",
    ajoutePar: session.user.name ?? session.user.email ?? "Utilisateur",
  });
  return NextResponse.json(item, { status: 201 });
}
