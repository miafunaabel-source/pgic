import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { updateItem } from "@/lib/dataStore";
import type { Avis } from "@/lib/data";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { reponse } = await req.json();
  if (!reponse?.trim()) return NextResponse.json({ error: "Réponse requise" }, { status: 400 });

  const updated = await updateItem<Avis>("avis", session.user.id, params.id, { reponse: reponse.trim() });
  if (!updated) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  return NextResponse.json(updated);
}
