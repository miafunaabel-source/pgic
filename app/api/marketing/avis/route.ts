import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { listAll, createItem } from "@/lib/dataStore";
import type { Avis } from "@/lib/data";

const SEED: Omit<Avis, "id">[] = [
  { auteur: "Jean D.",   note: 5, texte: "Équipe très professionnelle, livraison dans les délais.",      date: "2026-05-08", source: "Google"   },
  { auteur: "Marie P.",  note: 5, texte: "Super expérience d'achat, je recommande vivement !",           date: "2026-05-06", source: "Google"   },
  { auteur: "Thomas L.", note: 4, texte: "Bon service, juste un peu d'attente pour la livraison.",       date: "2026-05-02", source: "Facebook" },
  { auteur: "Sophie M.", note: 3, texte: "SAV correct mais délai de réponse perfectible.",               date: "2026-04-28", source: "Google"   },
];

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  let items = await listAll<Avis>("avis", session.user.id);
  if (items.length === 0) {
    for (const a of [...SEED].reverse()) {
      await createItem<Avis>("avis", session.user.id, a);
    }
    items = await listAll<Avis>("avis", session.user.id);
  }
  return NextResponse.json(items);
}
