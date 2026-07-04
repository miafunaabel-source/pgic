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
  // --- Clients actifs (14) ---
  { id: "C001", nom: "Dupont",      prenom: "Jean",      email: "jean.dupont@email.fr",       telephone: "06 12 34 56 78", ville: "Lyon",         statut: "client",   vehicule: "Peugeot 508 SW 2024",       derniereVisite: "2026-05-10", valeurTotale: 42900, score: 92 },
  { id: "C002", nom: "Martin",      prenom: "Sophie",    email: "s.martin@email.fr",           telephone: "06 98 76 54 32", ville: "Villeurbanne", statut: "client",   vehicule: "Renault Clio 2021",         derniereVisite: "2026-04-28", valeurTotale: 18200, score: 78 },
  { id: "C004", nom: "Petit",       prenom: "Marie",     email: "marie.petit@email.fr",        telephone: "06 55 66 77 88", ville: "Décines",      statut: "client",   vehicule: "Volkswagen Golf 2023",      derniereVisite: "2026-05-08", valeurTotale: 42000, score: 95 },
  { id: "C007", nom: "Laurent",     prenom: "Thomas",    email: "t.laurent@email.fr",          telephone: "06 77 88 99 00", ville: "Lyon",         statut: "client",   vehicule: "BMW Série 3 2024",          derniereVisite: "2026-04-20", valeurTotale: 58900, score: 88 },
  { id: "C008", nom: "Leroy",       prenom: "Isabelle",  email: "i.leroy@email.fr",            telephone: "07 22 33 44 55", ville: "Caluire",      statut: "client",   vehicule: "Toyota Yaris 2022",         derniereVisite: "2026-03-14", valeurTotale: 21500, score: 72 },
  { id: "C009", nom: "Girard",      prenom: "Antoine",   email: "a.girard@email.fr",           telephone: "06 41 52 63 74", ville: "Bron",         statut: "client",   vehicule: "Audi A3 2023",              derniereVisite: "2026-05-05", valeurTotale: 37800, score: 85 },
  { id: "C010", nom: "Fontaine",    prenom: "Camille",   email: "c.fontaine@email.fr",         telephone: "07 63 74 85 96", ville: "Saint-Priest", statut: "client",   vehicule: "Mercedes Classe A 2022",    derniereVisite: "2026-04-17", valeurTotale: 47200, score: 90 },
  { id: "C011", nom: "Chevalier",   prenom: "Nicolas",   email: "n.chevalier@email.fr",        telephone: "06 85 96 07 18", ville: "Tassin",       statut: "client",   vehicule: "Peugeot 3008 2024",         derniereVisite: "2026-05-12", valeurTotale: 51000, score: 93 },
  { id: "C012", nom: "Rousseau",    prenom: "Élodie",    email: "e.rousseau@email.fr",         telephone: "06 07 18 29 30", ville: "Vénissieux",   statut: "client",   vehicule: "Dacia Duster 2023",         derniereVisite: "2026-03-22", valeurTotale: 23400, score: 68 },
  { id: "C013", nom: "Blanc",       prenom: "Frédéric",  email: "f.blanc@email.fr",            telephone: "07 29 30 41 52", ville: "Lyon",         statut: "client",   vehicule: "Renault Austral 2023",      derniereVisite: "2026-04-30", valeurTotale: 39600, score: 82 },
  { id: "C014", nom: "Garnier",     prenom: "Lucie",     email: "l.garnier@email.fr",          telephone: "06 51 62 73 84", ville: "Villeurbanne", statut: "client",   vehicule: "Toyota C-HR 2024",          derniereVisite: "2026-05-09", valeurTotale: 34100, score: 76 },
  { id: "C015", nom: "Morel",       prenom: "Sébastien", email: "s.morel@email.fr",            telephone: "07 73 84 95 06", ville: "Caluire",      statut: "client",   vehicule: "Ford Puma 2023",            derniereVisite: "2026-04-05", valeurTotale: 27900, score: 80 },
  { id: "C016", nom: "André",       prenom: "Nathalie",  email: "n.andre@email.fr",            telephone: "06 95 06 17 28", ville: "Décines",      statut: "client",   vehicule: "Hyundai Tucson 2022",       derniereVisite: "2026-03-18", valeurTotale: 33500, score: 74 },
  { id: "C017", nom: "Perrin",      prenom: "Alexis",    email: "a.perrin@email.fr",           telephone: "06 17 28 39 50", ville: "Lyon",         statut: "client",   vehicule: "Kia Sportage 2024",         derniereVisite: "2026-05-14", valeurTotale: 85000, score: 97 },
  // --- Prospects (7) ---
  { id: "C003", nom: "Bernard",     prenom: "Pierre",    email: "p.bernard@email.fr",          telephone: "07 11 22 33 44", ville: "Bron",         statut: "prospect", vehicule: "-",                         derniereVisite: "2026-05-02", valeurTotale: 0,     score: 55 },
  { id: "C006", nom: "Simon",       prenom: "Claire",    email: "claire.simon@email.fr",       telephone: "06 33 44 55 66", ville: "Lyon",         statut: "prospect", vehicule: "-",                         derniereVisite: "2026-05-09", valeurTotale: 0,     score: 62 },
  { id: "C018", nom: "Renard",      prenom: "Mathieu",   email: "m.renard@email.fr",           telephone: "07 39 50 61 72", ville: "Saint-Priest", statut: "prospect", vehicule: "-",                         derniereVisite: "2026-05-07", valeurTotale: 0,     score: 48 },
  { id: "C019", nom: "Lemaire",     prenom: "Aurélie",   email: "a.lemaire@email.fr",          telephone: "06 61 72 83 94", ville: "Tassin",       statut: "prospect", vehicule: "-",                         derniereVisite: "2026-05-13", valeurTotale: 0,     score: 58 },
  { id: "C020", nom: "Gauthier",    prenom: "Florian",   email: "f.gauthier@email.fr",         telephone: "07 83 94 05 16", ville: "Villeurbanne", statut: "prospect", vehicule: "-",                         derniereVisite: "2026-04-29", valeurTotale: 0,     score: 42 },
  { id: "C021", nom: "Colin",       prenom: "Manon",     email: "m.colin@email.fr",            telephone: "06 05 16 27 38", ville: "Bron",         statut: "prospect", vehicule: "-",                         derniereVisite: "2026-05-11", valeurTotale: 0,     score: 65 },
  { id: "C022", nom: "Marchand",    prenom: "Théo",      email: "t.marchand@email.fr",         telephone: "07 27 38 49 60", ville: "Caluire",      statut: "prospect", vehicule: "-",                         derniereVisite: "2026-05-06", valeurTotale: 0,     score: 37 },
  // --- Inactifs (3) ---
  { id: "C005", nom: "Moreau",      prenom: "Luc",       email: "luc.moreau@email.fr",         telephone: "07 44 55 66 77", ville: "Vénissieux",   statut: "inactif",  vehicule: "Citroën C3 2019",           derniereVisite: "2025-11-10", valeurTotale: 12800, score: 28 },
  { id: "C023", nom: "Bonnet",      prenom: "Sylvie",    email: "s.bonnet@email.fr",           telephone: "06 49 60 71 82", ville: "Vénissieux",   statut: "inactif",  vehicule: "Ford Fiesta 2020",          derniereVisite: "2025-09-03", valeurTotale: 24600, score: 22 },
  { id: "C024", nom: "Mercier",     prenom: "Gilles",    email: "g.mercier@email.fr",          telephone: "07 71 82 93 04", ville: "Saint-Priest", statut: "inactif",  vehicule: "Peugeot 208 2020",          derniereVisite: "2025-08-21", valeurTotale: 15300, score: 18 },
];

export const vehicules: Vehicule[] = [
  // --- Neufs disponibles (13) ---
  { id: "V001", marque: "Peugeot",    modele: "508 SW",         annee: 2024, kilometrage: 0,     prix: 42900, statut: "disponible", type: "neuf",     couleur: "Blanc Nacré",        carburant: "Hybride",          vin: "VF3LCYHZPNS012345" },
  { id: "V007", marque: "Peugeot",    modele: "2008",           annee: 2024, kilometrage: 0,     prix: 33400, statut: "disponible", type: "neuf",     couleur: "Vert Olivine",        carburant: "Électrique",       vin: "VF3CUYHZPNS777888" },
  { id: "V009", marque: "Peugeot",    modele: "3008",           annee: 2024, kilometrage: 0,     prix: 51200, statut: "disponible", type: "neuf",     couleur: "Gris Platinium",      carburant: "Plug-in Hybride",  vin: "VF3MCYHZPNS101010" },
  { id: "V010", marque: "Renault",    modele: "Austral",        annee: 2024, kilometrage: 0,     prix: 41500, statut: "disponible", type: "neuf",     couleur: "Rouge Flamme",        carburant: "Hybride",          vin: "VF1RJBF00K202020" },
  { id: "V011", marque: "Citroën",    modele: "C5 X",           annee: 2024, kilometrage: 0,     prix: 38900, statut: "disponible", type: "neuf",     couleur: "Blanc Banquise",      carburant: "Plug-in Hybride",  vin: "VF7RHNFXXPK303030" },
  { id: "V012", marque: "Volkswagen", modele: "ID.4",           annee: 2024, kilometrage: 0,     prix: 52800, statut: "disponible", type: "neuf",     couleur: "Bleu Nuit",           carburant: "Électrique",       vin: "WVGZZZ11ZNW404040" },
  { id: "V013", marque: "Toyota",     modele: "C-HR",           annee: 2024, kilometrage: 0,     prix: 36700, statut: "disponible", type: "neuf",     couleur: "Argent Minéral",      carburant: "Hybride",          vin: "JTMDFREV40D505050" },
  { id: "V014", marque: "Audi",       modele: "A3 Sportback",   annee: 2024, kilometrage: 0,     prix: 44900, statut: "disponible", type: "neuf",     couleur: "Noir Brillant",       carburant: "Essence",          vin: "WAUZZZ8V9NA606060" },
  { id: "V015", marque: "Hyundai",    modele: "IONIQ 5",        annee: 2024, kilometrage: 0,     prix: 55900, statut: "disponible", type: "neuf",     couleur: "Blanc Opaque",        carburant: "Électrique",       vin: "KMHK341GGNU707070" },
  { id: "V016", marque: "Kia",        modele: "Sportage",       annee: 2024, kilometrage: 0,     prix: 38500, statut: "disponible", type: "neuf",     couleur: "Gris Acier",          carburant: "Hybride",          vin: "U5YHM813PNL808080" },
  { id: "V017", marque: "Dacia",      modele: "Duster",         annee: 2024, kilometrage: 0,     prix: 24900, statut: "disponible", type: "neuf",     couleur: "Orange Atacama",      carburant: "Essence",          vin: "UU1HJDSR6PA909090" },
  { id: "V018", marque: "Ford",       modele: "Puma",           annee: 2024, kilometrage: 0,     prix: 29800, statut: "disponible", type: "neuf",     couleur: "Bleu Magnetic",       carburant: "Hybride",          vin: "WF0AXXGAJANA111111" },
  { id: "V019", marque: "Mercedes",   modele: "Classe A",       annee: 2024, kilometrage: 0,     prix: 47500, statut: "disponible", type: "neuf",     couleur: "Argent Iridium",      carburant: "Essence",          vin: "WDD1770032J222222" },
  // --- Neufs réservés (2) ---
  { id: "V003", marque: "Volkswagen", modele: "Tiguan",         annee: 2024, kilometrage: 0,     prix: 47200, statut: "reserve",    type: "neuf",     couleur: "Gris Platine",        carburant: "Diesel",           vin: "WVGZZZ5NZLW456789" },
  { id: "V020", marque: "BMW",        modele: "Série 1",        annee: 2024, kilometrage: 0,     prix: 39900, statut: "reserve",    type: "neuf",     couleur: "Bleu Estoril",        carburant: "Essence",          vin: "WBAUA11090M333333" },
  // --- Neuf en transit (1) ---
  { id: "V005", marque: "BMW",        modele: "X3",             annee: 2024, kilometrage: 0,     prix: 69900, statut: "transit",    type: "neuf",     couleur: "Noir Saphir",         carburant: "Essence",          vin: "WBAUA71090L333444" },
  // --- Occasions disponibles (5) ---
  { id: "V002", marque: "Renault",    modele: "Mégane E-Tech",  annee: 2023, kilometrage: 18500, prix: 28500, statut: "disponible", type: "occasion", couleur: "Bleu Iron",           carburant: "Électrique",       vin: "VF1RFB00067890123" },
  { id: "V004", marque: "Toyota",     modele: "RAV4",           annee: 2023, kilometrage: 32000, prix: 35800, statut: "disponible", type: "occasion", couleur: "Rouge Bordeaux",      carburant: "Hybride",          vin: "JTMDFREV30D111222" },
  { id: "V006", marque: "Citroën",    modele: "C5 X",           annee: 2023, kilometrage: 15200, prix: 31200, statut: "disponible", type: "occasion", couleur: "Blanc Banquise",      carburant: "Plug-in Hybride",  vin: "VF7RHNFXXPJ555666" },
  { id: "V021", marque: "Peugeot",    modele: "308",            annee: 2022, kilometrage: 41000, prix: 22400, statut: "disponible", type: "occasion", couleur: "Gris Selenium",       carburant: "Diesel",           vin: "VF3LBYHZPMN444444" },
  { id: "V022", marque: "Audi",       modele: "Q3",             annee: 2021, kilometrage: 52000, prix: 31900, statut: "disponible", type: "occasion", couleur: "Bleu Navarre",        carburant: "Essence",          vin: "WAUZZZ8U7MA555555" },
  // --- Occasions réservées (2) ---
  { id: "V023", marque: "Renault",    modele: "Captur",         annee: 2022, kilometrage: 28000, prix: 19800, statut: "reserve",    type: "occasion", couleur: "Jaune Valencia",      carburant: "Hybride",          vin: "VF1RJAF00M666666" },
  { id: "V024", marque: "Ford",       modele: "Focus",          annee: 2021, kilometrage: 39500, prix: 17500, statut: "reserve",    type: "occasion", couleur: "Rouge Racing",        carburant: "Diesel",           vin: "WF0DXXGCKDMA777777" },
  // --- Occasions en transit (2) ---
  { id: "V025", marque: "Hyundai",    modele: "Tucson",         annee: 2022, kilometrage: 33600, prix: 27400, statut: "transit",    type: "occasion", couleur: "Gris Granite",        carburant: "Hybride",          vin: "KMHK341GGNM888888" },
  { id: "V026", marque: "Kia",        modele: "Niro",           annee: 2021, kilometrage: 44200, prix: 21600, statut: "transit",    type: "occasion", couleur: "Blanc Glacier",       carburant: "Hybride",          vin: "U5YHE813PML999999" },
  // --- Vendus (3) ---
  { id: "V008", marque: "Renault",    modele: "Clio",           annee: 2022, kilometrage: 28000, prix: 14900, statut: "vendu",      type: "occasion", couleur: "Jaune Zeste",         carburant: "Essence",          vin: "VF1RBA00052999000" },
  { id: "V027", marque: "Peugeot",    modele: "208",            annee: 2022, kilometrage: 24500, prix: 16800, statut: "vendu",      type: "occasion", couleur: "Rouge Elixir",        carburant: "Essence",          vin: "VF3CCYHZPMN101010" },
  { id: "V028", marque: "Volkswagen", modele: "Polo",           annee: 2020, kilometrage: 58000, prix: 13200, statut: "vendu",      type: "occasion", couleur: "Bleu Reef",           carburant: "Essence",          vin: "WVWZZZ6RZLY202020" },
];

export const rendezVous: RendezVous[] = [
  { id: "RV001", clientNom: "Jean Dupont",      vehicule: "Peugeot 308 2022",       technicien: "Marc Lefebvre",  date: "2026-05-12", heure: "09:00", type: "entretien",   statut: "termine",  duree: 90,  notes: "Révision 30 000 km — terminée sans anomalie" },
  { id: "RV002", clientNom: "Sophie Martin",    vehicule: "Renault Clio 2021",      technicien: "Paul Durand",    date: "2026-05-12", heure: "10:30", type: "reparation",  statut: "termine",  duree: 180, notes: "Remplacement plaquettes et disques avant" },
  { id: "RV003", clientNom: "Marie Petit",      vehicule: "VW Golf 2023",           technicien: "Marc Lefebvre",  date: "2026-05-13", heure: "08:30", type: "diagnostic",  statut: "termine",  duree: 60,  notes: "Voyant moteur — capteur O2 remplacé" },
  { id: "RV004", clientNom: "Thomas Laurent",   vehicule: "BMW Série 3 2024",       technicien: "Anne Rousseau",  date: "2026-05-13", heure: "11:00", type: "entretien",   statut: "termine",  duree: 120, notes: "Première révision 15 000 km" },
  { id: "RV005", clientNom: "Isabelle Leroy",   vehicule: "Toyota Yaris 2022",      technicien: "Paul Durand",    date: "2026-05-13", heure: "14:00", type: "controle",    statut: "termine",  duree: 45,  notes: "Contrôle technique — favorable" },
  { id: "RV006", clientNom: "Luc Moreau",       vehicule: "Citroën C3 2019",        technicien: "Anne Rousseau",  date: "2026-05-14", heure: "09:30", type: "reparation",  statut: "termine",  duree: 240, notes: "Changement courroie de distribution" },
  { id: "RV007", clientNom: "Antoine Girard",   vehicule: "Audi A3 2023",           technicien: "Marc Lefebvre",  date: "2026-05-14", heure: "13:00", type: "entretien",   statut: "en_cours", duree: 90,  notes: "Vidange + filtres" },
  { id: "RV008", clientNom: "Camille Fontaine", vehicule: "Mercedes Classe A 2022", technicien: "Paul Durand",    date: "2026-05-15", heure: "08:00", type: "diagnostic",  statut: "en_cours", duree: 60,  notes: "Bruit suspect boîte de vitesses" },
  { id: "RV009", clientNom: "Nicolas Chevalier",vehicule: "Peugeot 3008 2024",      technicien: "Anne Rousseau",  date: "2026-05-15", heure: "10:00", type: "entretien",   statut: "planifie", duree: 90,  notes: "Révision annuelle" },
  { id: "RV010", clientNom: "Élodie Rousseau",  vehicule: "Dacia Duster 2023",      technicien: "Marc Lefebvre",  date: "2026-05-15", heure: "14:30", type: "reparation",  statut: "planifie", duree: 120, notes: "Remplacement amortisseurs arrière" },
  { id: "RV011", clientNom: "Frédéric Blanc",   vehicule: "Renault Austral 2023",   technicien: "Paul Durand",    date: "2026-05-16", heure: "09:00", type: "controle",    statut: "planifie", duree: 45,  notes: "Contrôle technique programmé" },
  { id: "RV012", clientNom: "Lucie Garnier",    vehicule: "Toyota C-HR 2024",       technicien: "Anne Rousseau",  date: "2026-05-16", heure: "11:30", type: "entretien",   statut: "planifie", duree: 60,  notes: "Vérification système hybride" },
  { id: "RV013", clientNom: "Alexis Perrin",    vehicule: "Kia Sportage 2024",      technicien: "Marc Lefebvre",  date: "2026-05-17", heure: "09:00", type: "entretien",   statut: "planifie", duree: 90,  notes: "Première révision 10 000 km" },
  { id: "RV014", clientNom: "Pierre Bernard",   vehicule: "Peugeot 2008 2024",      technicien: "Paul Durand",    date: "2026-05-17", heure: "11:00", type: "diagnostic",  statut: "planifie", duree: 60,  notes: "Essai avant livraison" },
  { id: "RV015", clientNom: "Manon Colin",      vehicule: "Renault Clio 2023",      technicien: "Anne Rousseau",  date: "2026-05-19", heure: "10:00", type: "entretien",   statut: "planifie", duree: 90,  notes: "Découverte véhicule + révision" },
  { id: "RV016", clientNom: "Sylvie Bonnet",    vehicule: "Ford Fiesta 2020",       technicien: "Marc Lefebvre",  date: "2026-05-20", heure: "14:00", type: "reparation",  statut: "annule",   duree: 180, notes: "Client a annulé — à replanifier" },
];

export const ventes: Vente[] = [
  { id: "VT001", clientNom: "Pierre Bernard",    vehicule: "Peugeot 2008 2024",           vendeur: "Émilie Blanc",   date: "2026-05-13", montant: 33400, statut: "devis",    financement: "En attente" },
  { id: "VT002", clientNom: "Aurélie Lemaire",   vehicule: "Dacia Duster 2024",           vendeur: "Nicolas Mercier",date: "2026-05-11", montant: 24900, statut: "devis",    financement: "En attente" },
  { id: "VT003", clientNom: "Florian Gauthier",  vehicule: "Toyota C-HR 2024",            vendeur: "Julien Favre",   date: "2026-05-09", montant: 36700, statut: "devis",    financement: "En attente" },
  { id: "VT004", clientNom: "Théo Marchand",     vehicule: "Renault Captur 2022",         vendeur: "Émilie Blanc",   date: "2026-05-07", montant: 19800, statut: "devis",    financement: "En attente" },
  { id: "VT005", clientNom: "Claire Simon",      vehicule: "Renault Mégane E-Tech 2023",  vendeur: "Nicolas Mercier",date: "2026-05-05", montant: 28500, statut: "commande", financement: "RCI Banque" },
  { id: "VT006", clientNom: "Mathieu Renard",    vehicule: "Kia Sportage 2024",           vendeur: "Julien Favre",   date: "2026-05-03", montant: 38500, statut: "commande", financement: "CA Consumer Finance" },
  { id: "VT007", clientNom: "Manon Colin",       vehicule: "Ford Focus 2021",             vendeur: "Émilie Blanc",   date: "2026-04-30", montant: 17500, statut: "commande", financement: "Cetelem" },
  { id: "VT008", clientNom: "Jean Dupont",       vehicule: "Peugeot 508 SW 2024",         vendeur: "Émilie Blanc",   date: "2026-04-28", montant: 42900, statut: "finance",  financement: "BNP Paribas PF" },
  { id: "VT009", clientNom: "Marie Petit",       vehicule: "Toyota RAV4 2023",            vendeur: "Nicolas Mercier",date: "2026-04-22", montant: 35800, statut: "finance",  financement: "Crédit Agricole CF" },
  { id: "VT010", clientNom: "Nicolas Chevalier", vehicule: "Peugeot 3008 2024",           vendeur: "Julien Favre",   date: "2026-04-18", montant: 51200, statut: "finance",  financement: "PSA Finance" },
  { id: "VT011", clientNom: "Thomas Laurent",    vehicule: "BMW X3 2024",                 vendeur: "Nicolas Mercier",date: "2026-04-15", montant: 69900, statut: "livre",    financement: "Comptant" },
  { id: "VT012", clientNom: "Alexis Perrin",     vehicule: "Kia Sportage 2024",           vendeur: "Julien Favre",   date: "2026-04-08", montant: 85000, statut: "livre",    financement: "RCI Banque" },
];

export type Campaign = {
  id: string;
  nom: string;
  canal: "Email" | "SMS";
  cible: string;
  envoyes: number;
  ouverts: number;
  clics: number;
  statut: "planifie" | "actif" | "termine";
  date: string;
};

export type Avis = {
  id: string;
  auteur: string;
  note: 1 | 2 | 3 | 4 | 5;
  texte: string;
  date: string;
  source: string;
  reponse?: string;
};

export const kpiData = {
  venteMois: 1247800,
  venteMoisPrev: 1089000,
  vehiculesStock: 25,
  rdvSemaine: 23,
  tauxSatisfaction: 96,
  leadsNouveaux: 31,
  chiffreAffaireAnnuel: [
    { mois: "Jan",  ventes: 680000,  atelier: 78000  },
    { mois: "Fév",  ventes: 754000,  atelier: 89000  },
    { mois: "Mar",  ventes: 921000,  atelier: 103000 },
    { mois: "Avr",  ventes: 1089000, atelier: 118000 },
    { mois: "Mai",  ventes: 1154000, atelier: 128000 },
    { mois: "Juin", ventes: 1247800, atelier: 142000 },
  ],
  stockParType: [
    { name: "Neufs",     value: 16, color: "#3b82f6" },
    { name: "Occasions", value: 12, color: "#10b981" },
  ],
  rdvParType: [
    { name: "Entretien",  value: 7, color: "#3b82f6" },
    { name: "Réparation", value: 4, color: "#ef4444" },
    { name: "Diagnostic", value: 3, color: "#f59e0b" },
    { name: "Contrôle",   value: 2, color: "#8b5cf6" },
  ],
};
