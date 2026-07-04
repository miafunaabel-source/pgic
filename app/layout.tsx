import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Suspense } from "react";
import ConditionalSidebar from "@/components/layout/ConditionalSidebar";
import ConditionalMain from "@/components/layout/ConditionalMain";
import AuthProvider from "@/components/layout/AuthProvider";
import { ToastProvider } from "@/contexts/ToastContext";
import PwaRegistration from "@/components/layout/PwaRegistration";
import SetupHandler from "@/components/layout/SetupHandler";

export const metadata: Metadata = {
  metadataBase: new URL("https://pgic-rho.vercel.app"),
  title: "PGIC - Hub Digital Concessionnaire",
  description: "Plateforme de Gestion Intégrée pour Concessionnaires Automobiles",
  manifest: "/manifest.webmanifest",
  robots: { index: false, follow: false },
  openGraph: {
    title: "PGIC - Tableau de bord",
    description: "Connectez-vous à votre espace de gestion PGIC.",
    url: "https://pgic-rho.vercel.app",
    siteName: "PGIC",
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "PGIC - Tableau de bord",
    description: "Connectez-vous à votre espace de gestion PGIC.",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "PGIC",
  },
};

export const viewport: Viewport = {
  themeColor: "#3b82f6",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="flex min-h-screen bg-slate-50">
        <AuthProvider>
          <ToastProvider>
            <PwaRegistration />
            <Suspense><SetupHandler /></Suspense>
            <ConditionalSidebar />
            <ConditionalMain>
              {children}
            </ConditionalMain>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
