"use client";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { ShieldX } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-2xl mb-4">
          <ShieldX size={32} className="text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Accès refusé</h1>
        <p className="text-slate-500 mb-6">
          Vous n&apos;avez pas les droits nécessaires pour accéder à cette page.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/" className="btn-primary">
            Retour au tableau de bord
          </Link>
          <button onClick={() => signOut({ callbackUrl: "/login" })} className="btn-secondary">
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  );
}
