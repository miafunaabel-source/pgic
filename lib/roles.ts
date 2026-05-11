import type { Role } from "@/types/next-auth";

// Définit quels rôles peuvent accéder à quelles routes
export const ROUTE_PERMISSIONS: Record<string, Role[]> = {
  "/":          ["directeur", "vendeur", "technicien", "receptionniste"],
  "/clients":   ["directeur", "vendeur", "receptionniste"],
  "/inventory": ["directeur", "vendeur"],
  "/sales":     ["directeur", "vendeur"],
  "/workshop":  ["directeur", "technicien", "receptionniste"],
  "/marketing": ["directeur"],
};

export const ROLE_LABELS: Record<Role, string> = {
  directeur:      "Directeur",
  vendeur:        "Vendeur",
  technicien:     "Technicien",
  receptionniste: "Réceptionniste",
};

export const ROLE_COLORS: Record<Role, string> = {
  directeur:      "bg-purple-100 text-purple-700",
  vendeur:        "bg-blue-100 text-blue-700",
  technicien:     "bg-amber-100 text-amber-700",
  receptionniste: "bg-emerald-100 text-emerald-700",
};

export function canAccess(role: Role, pathname: string): boolean {
  for (const [route, roles] of Object.entries(ROUTE_PERMISSIONS)) {
    if (pathname === route || pathname.startsWith(route + "/")) {
      return roles.includes(role);
    }
  }
  return false;
}
