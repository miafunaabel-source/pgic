import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { updateItem, removeItem } from "@/lib/dataStore";
import type { Document } from "../route";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const body = await req.json();
  const updated = await updateItem<Document>("documents", session.user.id, params.id, body);
  if (!updated) return NextResponse.json({ error: "Document introuvable" }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const ok = await removeItem("documents", session.user.id, params.id);
  if (!ok) return NextResponse.json({ error: "Document introuvable" }, { status: 404 });
  return NextResponse.json({ success: true });
}
