import Link from "next/link";
import { ShieldX } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-2xl mb-4">
          <ShieldX size={32} className="text-red-500" />
        </div>
        <h1 className="text-xl font-bold text-slate-900 mb-2">Accès refusé</h1>
        <p className="text-slate-500 text-sm mb-6">
          Vous n'avez pas les permissions nécessaires pour accéder à cette page.
        </p>
        <Link href="/" className="btn-primary inline-block">
          Retour au tableau de bord
        </Link>
      </div>
    </div>
  );
}
