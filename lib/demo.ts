import { clients, vehicules, rendezVous, ventes, type Campaign, type Avis } from "@/lib/data";
import type { UserRecord } from "@/lib/userStore";
import { DEMO_EMAIL, DEMO_USER_ID } from "@/lib/demoConfig";

export { DEMO_USER_ID, isDemoEnabled } from "@/lib/demoConfig";

// Compte démo public : session sans mot de passe, données fictives servies depuis le code
// (jamais depuis Redis) et toute écriture refusée par le middleware.
export const DEMO_USER: Omit<UserRecord, "passwordHash"> = {
  id: DEMO_USER_ID,
  name: "Visiteur Démo",
  email: DEMO_EMAIL,
  role: "directeur",
  setupComplete: true,
  company: {
    concession: "Concession Démo — Lyon",
    ville: "Lyon",
    plan: "demo",
  },
};

const campaigns: Campaign[] = [
  { id: "CAM001", nom: "Portes ouvertes hybrides",      canal: "Email", cible: "Prospects",        envoyes: 1240, ouverts: 612, clics: 148, statut: "termine",  date: "2026-04-20" },
  { id: "CAM002", nom: "Rappel révision printemps",      canal: "SMS",   cible: "Clients actifs",   envoyes: 386,  ouverts: 371, clics: 94,  statut: "termine",  date: "2026-04-28" },
  { id: "CAM003", nom: "Offre reprise +2 000 €",         canal: "Email", cible: "Clients inactifs", envoyes: 210,  ouverts: 87,  clics: 23,  statut: "actif",    date: "2026-05-10" },
  { id: "CAM004", nom: "Lancement Peugeot 3008 2024",    canal: "Email", cible: "Tous les contacts",envoyes: 0,    ouverts: 0,   clics: 0,   statut: "planifie", date: "2026-05-22" },
];

const avis: Avis[] = [
  { id: "AVI001", auteur: "Jean D.",   note: 5, texte: "Équipe très professionnelle, livraison dans les délais.",       date: "2026-05-08", source: "Google",   reponse: "Merci Jean, au plaisir de vous revoir pour la première révision !" },
  { id: "AVI002", auteur: "Marie P.",  note: 5, texte: "Super expérience d'achat, je recommande vivement !",            date: "2026-05-06", source: "Google"   },
  { id: "AVI003", auteur: "Thomas L.", note: 4, texte: "Bon service, juste un peu d'attente pour la livraison.",        date: "2026-05-02", source: "Facebook" },
  { id: "AVI004", auteur: "Sophie M.", note: 3, texte: "SAV correct mais délai de réponse perfectible.",                date: "2026-04-28", source: "Google"   },
  { id: "AVI005", auteur: "Alexis P.", note: 5, texte: "Reprise de mon ancien véhicule au juste prix, top.",            date: "2026-04-15", source: "Google"   },
];

const documents = [
  { id: "DOC001", nom: "Bon de commande — Peugeot 508 SW",   type: "bon_commande", status: "signe",      client: "Jean Dupont",       vehicule: "Peugeot 508 SW 2024", date: "2026-04-28", taille: "182 Ko", ajoutePar: "Émilie Blanc" },
  { id: "DOC002", nom: "Contrat de financement BNP PF",      type: "contrat",      status: "signe",      client: "Jean Dupont",       vehicule: "Peugeot 508 SW 2024", date: "2026-04-29", taille: "412 Ko", ajoutePar: "Émilie Blanc" },
  { id: "DOC003", nom: "Facture — BMW X3",                   type: "facture",      status: "signe",      client: "Thomas Laurent",    vehicule: "BMW X3 2024",         date: "2026-04-15", taille: "96 Ko",  ajoutePar: "Nicolas Mercier" },
  { id: "DOC004", nom: "Carte grise provisoire",             type: "carte_grise",  status: "signe",      client: "Alexis Perrin",     vehicule: "Kia Sportage 2024",   date: "2026-04-09", taille: "240 Ko", ajoutePar: "Julien Favre" },
  { id: "DOC005", nom: "Bon de commande — Mégane E-Tech",    type: "bon_commande", status: "en_attente", client: "Claire Simon",      vehicule: "Renault Mégane E-Tech 2023", date: "2026-05-05", taille: "175 Ko", ajoutePar: "Nicolas Mercier" },
  { id: "DOC006", nom: "Procuration immatriculation",        type: "procuration",  status: "en_attente", client: "Mathieu Renard",    vehicule: "Kia Sportage 2024",   date: "2026-05-04", taille: "58 Ko",  ajoutePar: "Julien Favre" },
  { id: "DOC007", nom: "Devis — Peugeot 2008",               type: "autre",        status: "brouillon",  client: "Pierre Bernard",    vehicule: "Peugeot 2008 2024",   date: "2026-05-13", taille: "88 Ko",  ajoutePar: "Émilie Blanc" },
];

const DEMO_DATA: Record<string, unknown[]> = {
  clients,
  inventory: vehicules,
  appointments: rendezVous,
  sales: ventes,
  campaigns,
  avis,
  documents,
};

// Les données de référence sont datées autour du 15/05/2026 : on les décale pour
// que la démo paraisse toujours « à jour » (RDV de la semaine, ventes du mois…).
const SEED_ANCHOR = Date.UTC(2026, 4, 15);
const DATE_FIELDS = ["date", "derniereVisite"] as const;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const DAY_MS = 86_400_000;

function shiftDate(iso: string, offsetDays: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d) + offsetDays * DAY_MS).toISOString().slice(0, 10);
}

export function getDemoData<T>(entity: string): T[] {
  const items = DEMO_DATA[entity];
  if (!items) return [];
  const now = new Date();
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const offset = Math.round((today - SEED_ANCHOR) / DAY_MS);
  return items.map((item) => {
    const copy = { ...(item as Record<string, unknown>) };
    for (const field of DATE_FIELDS) {
      const value = copy[field];
      if (typeof value === "string" && ISO_DATE.test(value)) copy[field] = shiftDate(value, offset);
    }
    return copy as T;
  });
}
