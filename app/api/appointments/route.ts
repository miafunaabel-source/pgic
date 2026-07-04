import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { listAll, createItem } from "@/lib/dataStore";
import type { RendezVous } from "@/lib/data";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const items = await listAll<RendezVous>("appointments", session.user.id);
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const body = await req.json();
  const item = await createItem<RendezVous>("appointments", session.user.id, {
    clientNom: body.clientNom ?? "",
    vehicule: body.vehicule ?? "",
    technicien: body.technicien || "—",
    date: body.date || new Date().toISOString().slice(0, 10),
    heure: body.heure || "09:00",
    type: body.type || "entretien",
    statut: "planifie",
    duree: parseInt(body.duree) || 60,
    notes: body.notes || "",
  });
  return NextResponse.json(item, { status: 201 });
}
