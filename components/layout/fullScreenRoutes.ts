// Pages affichées en plein écran, sans barre latérale ni marge (pages publiques : connexion, mot de passe…)
const FULL_SCREEN_ROUTES = ["/login", "/unauthorized", "/demo", "/forgot-password"];

export function isFullScreenRoute(pathname: string): boolean {
  return FULL_SCREEN_ROUTES.includes(pathname) || pathname.startsWith("/reset-password/");
}
