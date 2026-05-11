export type Client = {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  ville: string;
  statut: "prospect" | "client" | "inactif";
  vehicule: string;
  derniereVisite: string;
  valeurTotale: number;
  score: number;
};

export type Vehicule = {
  id: string;
  marque: string;
  modele: string;
  annee: number;
  kilometrage: number;
  prix: number;
  statut: "disponible" | "reserve" | "vendu" | "transit";
  type: "neuf" | "occasion";
  couleur: string;
  carburant: string;
  vin: string;
  photo?: string;
};

export type RendezVous = {
  id: string;
  clientNom: string;
  vehicule: string;
  technicien: string;
  date: string;
  heure: string;
  type: "entretien" | "reparation" | "diagnostic" | "controle";
  statut: "planifie" | "en_cours" | "termine" | "annule";
  duree: number;
  notes: string;
};

export type Vente = {
  id: string;
  clientNom: string;
  vehicule: string;
  vendeur: string;
  date: string;
  montant: number;
  statut: "devis" | "commande" | "finance" | "livre";
  financement: string;
};

export const clients: Client[] = [
  { id: "C001", nom: "Dupont", prenom: "Jean", email: "jean.dupont@email.fr", telephone: "06 12 34 56 78", ville: "Lyon", statut: "client", vehicule: "Peugeot 308 2022", derniereVisite: "2026-04-15", valeurTotale: 34500, score: 92 },
  { id: "C002", nom: "Martin", prenom: "Sophie", email: "s.martin@email.fr", telephone: "06 98 76 54 32", ville: "Villeurbanne", statut: "client", vehicule: "Renault Clio 2021", derniereVisite: "2026-03-28", valeurTotale: 18200, score: 78 },
  { id: "C003", nom: "Bernard", prenom: "Pierre", email: "p.bernard@email.fr", telephone: "07 11 22 33 44", ville: "Bron", statut: "prospect", vehicule: "-", derniereVisite: "2026-05-02", valeurTotale: 0, score: 45 },
  { id: "C004", nom: "Petit", prenom: "Marie", email: "marie.petit@email.fr", telephone: "06 55 66 77 88", ville: "Décines", statut: "client", vehicule: "Volkswagen Golf 2023", derniereVisite: "2026-05-08", valeurTotale: 42000, score: 95 },
  { id: "C005", nom: "Moreau", prenom: "Luc", email: "luc.moreau@email.fr", telephone: "07 44 55 66 77", ville: "Vénissieux", statut: "inactif", vehicule: "Citroën C3 2019", derniereVisite: "2025-11-10", valeurTotale: 12800, score: 30 },
  { id: "C006", nom: "Simon", prenom: "Claire", email: "claire.simon@email.fr", telephone: "06 33 44 55 66", ville: "Lyon", statut: "prospect", vehicule: "-", derniereVisite: "2026-05-09", valeurTotale: 0, score: 60 },
  { id: "C007", nom: "Laurent", prenom: "Thomas", email: "t.laurent@email.fr", telephone: "06 77 88 99 00", ville: "Lyon", statut: "client", vehicule: "BMW Série 3 2024", derniereVisite: "2026-04-20", valeurTotale: 58900, score: 88 },
  { id: "C008", nom: "Leroy", prenom: "Isabelle", email: "i.leroy@email.fr", telephone: "07 22 33 44 55", ville: "Caluire", statut: "client", vehicule: "Toyota Yaris 2022", derniereVisite: "2026-02-14", valeurTotale: 21500, score: 72 },
];

export const vehicules: Vehicule[] = [
  { id: "V001", marque: "Peugeot", modele: "508 SW", annee: 2024, kilometrage: 0, prix: 42900, statut: "disponible", type: "neuf", couleur: "Blanc Nacré", carburant: "Hybride", vin: "VF3LCYHZPNS012345" },
  { id: "V002", marque: "Renault", modele: "Mégane E-Tech", annee: 2023, kilometrage: 18500, prix: 28500, statut: "disponible", type: "occasion", couleur: "Bleu Iron", carburant: "Électrique", vin: "VF1RFB00067890123" },
  { id: "V003", marque: "Volkswagen", modele: "Tiguan", annee: 2024, kilometrage: 0, prix: 47200, statut: "reserve", type: "neuf", couleur: "Gris Platine", carburant: "Diesel", vin: "WVGZZZ5NZLW456789" },
  { id: "V004", marque: "Toyota", modele: "RAV4", annee: 2023, kilometrage: 32000, prix: 35800, statut: "disponible", type: "occasion", couleur: "Rouge Bordeaux", carburant: "Hybride", vin: "JTMDFREV30D111222" },
  { id: "V005", marque: "BMW", modele: "X3", annee: 2024, kilometrage: 0, prix: 69900, statut: "transit", type: "neuf", couleur: "Noir Saphir", carburant: "Essence", vin: "WBAUA71090L333444" },
  { id: "V006", marque: "Citroën", modele: "C5 X", annee: 2023, kilometrage: 15200, prix: 31200, statut: "disponible", type: "occasion", couleur: "Blanc Banquise", carburant: "Plug-in Hybride", vin: "VF7RHNFXXPJ555666" },
  { id: "V007", marque: "Peugeot", modele: "2008", annee: 2024, kilometrage: 0, prix: 33400, statut: "disponible", type: "neuf", couleur: "Vert Olivine", carburant: "Électrique", vin: "VF3CUYHZPNS777888" },
  { id: "V008", marque: "Renault", modele: "Clio", annee: 2022, kilometrage: 28000, prix: 14900, statut: "vendu", type: "occasion", couleur: "Jaune Zeste", carburant: "Essence", vin: "VF1RBA00052999000" },
];

export const rendezVous: RendezVous[] = [
  { id: "RV001", clientNom: "Jean Dupont", vehicule: "Peugeot 308 2022", technicien: "Marc Lefebvre", date: "2026-05-12", heure: "09:00", type: "entretien", statut: "planifie", duree: 90, notes: "Révision 30 000 km" },
  { id: "RV002", clientNom: "Sophie Martin", vehicule: "Renault Clio 2021", technicien: "Paul Durand", date: "2026-05-12", heure: "10:30", type: "reparation", statut: "en_cours", duree: 180, notes: "Remplacement plaquettes de frein" },
  { id: "RV003", clientNom: "Marie Petit", vehicule: "VW Golf 2023", technicien: "Marc Lefebvre", date: "2026-05-12", heure: "14:00", type: "diagnostic", statut: "planifie", duree: 60, notes: "Voyant moteur allumé" },
  { id: "RV004", clientNom: "Thomas Laurent", vehicule: "BMW Série 3 2024", technicien: "Anne Rousseau", date: "2026-05-13", heure: "08:30", type: "entretien", statut: "planifie", duree: 120, notes: "Première révision" },
  { id: "RV005", clientNom: "Isabelle Leroy", vehicule: "Toyota Yaris 2022", technicien: "Paul Durand", date: "2026-05-13", heure: "11:00", type: "controle", statut: "planifie", duree: 45, notes: "Contrôle technique" },
  { id: "RV006", clientNom: "Luc Moreau", vehicule: "Citroën C3 2019", technicien: "Anne Rousseau", date: "2026-05-10", heure: "15:30", type: "reparation", statut: "termine", duree: 240, notes: "Changement courroie distribution" },
];

export const ventes: Vente[] = [
  { id: "VT001", clientNom: "Pierre Bernard", vehicule: "Peugeot 2008 2024", vendeur: "Émilie Blanc", date: "2026-05-08", montant: 33400, statut: "devis", financement: "En attente" },
  { id: "VT002", clientNom: "Claire Simon", vehicule: "Renault Mégane E-Tech 2023", vendeur: "Nicolas Mercier", date: "2026-05-05", montant: 28500, statut: "commande", financement: "RCI Banque" },
  { id: "VT003", clientNom: "Jean Dupont", vehicule: "Peugeot 508 SW 2024", vendeur: "Émilie Blanc", date: "2026-04-28", montant: 42900, statut: "finance", financement: "BNP Paribas PF" },
  { id: "VT004", clientNom: "Thomas Laurent", vehicule: "BMW X3 2024", vendeur: "Nicolas Mercier", date: "2026-04-15", montant: 69900, statut: "livre", financement: "Comptant" },
  { id: "VT005", clientNom: "Marie Petit", vehicule: "Toyota RAV4 2023", vendeur: "Émilie Blanc", date: "2026-05-01", montant: 35800, statut: "commande", financement: "Crédit Agricole CF" },
];

export const kpiData = {
  venteMois: 847200,
  venteMoisPrev: 762000,
  vehiculesStock: 47,
  rdvSemaine: 23,
  tauxSatisfaction: 94,
  leadsNouveaux: 18,
  chiffreAffaireAnnuel: [
    { mois: "Jan", ventes: 520000, atelier: 85000 },
    { mois: "Fév", ventes: 610000, atelier: 92000 },
    { mois: "Mar", ventes: 780000, atelier: 105000 },
    { mois: "Avr", ventes: 720000, atelier: 98000 },
    { mois: "Mai", ventes: 847000, atelier: 112000 },
  ],
  stockParType: [
    { name: "Neufs", value: 28, color: "#3b82f6" },
    { name: "Occasions", value: 19, color: "#10b981" },
  ],
  rdvParType: [
    { name: "Entretien", value: 12, color: "#3b82f6" },
    { name: "Réparation", value: 7, color: "#ef4444" },
    { name: "Diagnostic", value: 3, color: "#f59e0b" },
    { name: "Contrôle", value: 1, color: "#8b5cf6" },
  ],
};
