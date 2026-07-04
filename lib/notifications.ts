export type NotifType = "success" | "info" | "warning" | "error";

export interface Notification {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  time: string;
  read: boolean;
  link?: string;
}

export const DEMO_NOTIFICATIONS: Notification[] = [
  {
    id: "N001",
    type: "success",
    title: "Vente finalisée",
    body: "Thomas Laurent — BMW X3 2024 — 69 900 €",
    time: "Il y a 12 min",
    read: false,
    link: "/sales",
  },
  {
    id: "N002",
    type: "info",
    title: "Nouveau prospect",
    body: "Alexandre Fontaine vient de remplir le formulaire de contact",
    time: "Il y a 38 min",
    read: false,
    link: "/clients",
  },
  {
    id: "N003",
    type: "warning",
    title: "RDV dans 30 minutes",
    body: "Marie Petit — Diagnostic VW Golf — Technicien: Marc Lefebvre",
    time: "Il y a 1h",
    read: false,
    link: "/workshop",
  },
  {
    id: "N004",
    type: "success",
    title: "Avis 5 étoiles reçu",
    body: "\"Excellent service, je recommande vivement !\" — Sophie Martin",
    time: "Il y a 2h",
    read: true,
    link: "/marketing",
  },
  {
    id: "N005",
    type: "info",
    title: "Stock — Alerte seuil",
    body: "Peugeot 2008 Électrique : dernier exemplaire disponible",
    time: "Il y a 3h",
    read: true,
    link: "/inventory",
  },
  {
    id: "N006",
    type: "success",
    title: "Intervention terminée",
    body: "Luc Moreau — Citroën C3 — Courroie de distribution",
    time: "Hier 15h30",
    read: true,
    link: "/workshop",
  },
  {
    id: "N007",
    type: "info",
    title: "Campagne email envoyée",
    body: "\"Révision été\" — 145 destinataires — taux d'ouverture 61%",
    time: "Hier 09h00",
    read: true,
    link: "/marketing",
  },
];
