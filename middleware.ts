import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { ROUTE_PERMISSIONS } from "@/lib/roles";
import type { Role } from "@/types/next-auth";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;
    const role = token?.role as Role | undefined;

    if (!role) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Vérification RBAC — politique fail-closed : deny par défaut si route inconnue
    for (const [route, allowedRoles] of Object.entries(ROUTE_PERMISSIONS)) {
      if (route === "/" ? pathname === "/" : pathname.startsWith(route)) {
        if (!allowedRoles.includes(role)) {
          return NextResponse.redirect(new URL("/unauthorized", req.url));
        }
        return NextResponse.next();
      }
    }

    // Route non listée dans ROUTE_PERMISSIONS → accès réservé au directeur uniquement
    if (role !== "directeur") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // Autorise uniquement les utilisateurs avec un token valide
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    // Protège toutes les routes sauf login, API auth, fichiers statiques
    "/((?!login|unauthorized|api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};
