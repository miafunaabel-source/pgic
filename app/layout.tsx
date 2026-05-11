import type { Metadata } from "next";
import "./globals.css";
import ConditionalSidebar from "@/components/layout/ConditionalSidebar";
import AuthProvider from "@/components/layout/AuthProvider";

export const metadata: Metadata = {
  title: "PGIC - Plateforme de Gestion Intégrée Concessionnaire",
  description: "Hub Digital pour Concessionnaires Automobiles",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="flex min-h-screen bg-slate-50">
        <AuthProvider>
          <ConditionalSidebar />
          <main className="flex-1 p-6 overflow-auto min-h-screen">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
