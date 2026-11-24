import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { ROUTE_PERMISSIONS } from "@/lib/roles";
import type { Role } from "@/types/next-auth";
import { DEMO_USER_ID, DEMO_READONLY_HEADER, DEMO_READONLY_MESSAGE, isDemoEnabled } from "@/lib/demoConfig";

const READ_METHODS = ["GET", "HEAD", "OPTIONS"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Toujours laisser passer les assets statiques, l'API auth et le setup
  if (
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/setup") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: process.env.NODE_ENV === "production",
  });

  // Utilisateur déjà connecté sur /login → tableau de bord
  if (pathname === "/login") {
    if (token) return NextResponse.redirect(new URL("/", req.url));
    return NextResponse.next();
  }

  // Entrée de la démo publique : déjà connecté → tableau de bord
  if (pathname === "/demo") {
    if (token) return NextResponse.redirect(new URL("/", req.url));
    return NextResponse.next();
  }

  // Pages publiques accessibles sans authentification
  if (
    pathname === "/unauthorized" ||
    pathname === "/forgot-password" ||
    pathname.startsWith("/reset-password")
  ) {
    return NextResponse.next();
  }

  // Non authentifié → redirection vers /login
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Session démo : lecture seule, et invalidée si la démo est désactivée
  if (token.id === DEMO_USER_ID) {
    if (!isDemoEnabled()) {
      const res = NextResponse.redirect(new URL("/login", req.url));
      res.cookies.delete("__Secure-next-auth.session-token");
      res.cookies.delete("next-auth.session-token");
      return res;
    }
    if (pathname.startsWith("/api/") && !READ_METHODS.includes(req.method)) {
      return NextResponse.json(
        { error: DEMO_READONLY_MESSAGE },
        { status: 403, headers: { [DEMO_READONLY_HEADER]: "readonly" } }
      );
    }
  }

  // Onboarding non complété → redirection vers /setup (sauf si déjà sur /setup)
  if (!token.setupComplete && pathname !== "/setup") {
    return NextResponse.redirect(new URL("/setup", req.url));
  }

  // Setup complété → empêcher l'accès à /setup
  if (token.setupComplete && pathname === "/setup") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  const role = token.role as Role;

  // RBAC — vérifie les permissions par route
  for (const [route, allowedRoles] of Object.entries(ROUTE_PERMISSIONS)) {
    const matches = route === "/" ? pathname === "/" : pathname.startsWith(route);
    if (matches) {
      if (!allowedRoles.includes(role)) {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
      return NextResponse.next();
    }
  }

  // Route non listée → accès directeur uniquement
  if (role !== "directeur") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
