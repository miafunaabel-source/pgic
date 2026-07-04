export type CompanySettings = {
  nom: string;
  ville: string;
  caObjectifAnnuel: number;
  caObjectifMensuel: number;
  objectifVentesMois: number;
  panierMoyen: number;
  objectifRdvSemaine: number;
  capaciteAtelier: number;
  nbTechniciens: number;
  objectifSatisfaction: number;
  margeObjectif: number;
};

export const DEFAULT_SETTINGS: CompanySettings = {
  nom: "Concession Lyon Centre",
  ville: "Lyon",
  caObjectifAnnuel: 10_000_000,
  caObjectifMensuel: 850_000,
  objectifVentesMois: 25,
  panierMoyen: 35_000,
  objectifRdvSemaine: 30,
  capaciteAtelier: 40,
  nbTechniciens: 4,
  objectifSatisfaction: 95,
  margeObjectif: 12,
};

const KEY = "pgic_settings";

export function loadSettings(): CompanySettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {}
  return DEFAULT_SETTINGS;
}

export function saveSettings(s: CompanySettings): void {
  localStorage.setItem(KEY, JSON.stringify(s));
}
