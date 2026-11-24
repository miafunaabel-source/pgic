// Constantes du compte démo, sans dépendance : importables depuis le middleware (edge) et le client.
export const DEMO_USER_ID = "demo";
export const DEMO_EMAIL = "demo@pgic.eu";

// Désactivable en production via DEMO_ENABLED=false (les sessions démo existantes sont alors rejetées).
export function isDemoEnabled(): boolean {
  return process.env.DEMO_ENABLED !== "false";
}

export const DEMO_READONLY_HEADER = "x-pgic-demo";
export const DEMO_READONLY_MESSAGE =
  "Mode démo : les modifications sont désactivées. Démarrez un essai gratuit pour utiliser vos propres données.";

export const SIGNUP_URL = "https://pgic.eu/#pricing";
