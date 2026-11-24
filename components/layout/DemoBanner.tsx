"use client";
import { useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { Sparkles } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";
import { DEMO_USER_ID, DEMO_READONLY_HEADER, DEMO_READONLY_MESSAGE, SIGNUP_URL } from "@/lib/demoConfig";

export default function DemoBanner() {
  const { data: session } = useSession();
  const toast = useToast();
  const isDemo = session?.user?.id === DEMO_USER_ID;

  // Les pages affichent un message d'erreur générique en cas d'échec d'écriture :
  // on ajoute l'explication « lecture seule » quand le refus vient du mode démo.
  useEffect(() => {
    if (!isDemo) return;
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const res = await originalFetch(...args);
      if (res.status === 403 && res.headers.get(DEMO_READONLY_HEADER) === "readonly") {
        toast("info", DEMO_READONLY_MESSAGE);
      }
      return res;
    };
    return () => { window.fetch = originalFetch; };
  }, [isDemo, toast]);

  if (!isDemo) return null;

  return (
    <div className="sticky top-0 z-40 -mx-6 -mt-6 mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 px-6 py-2.5 text-sm">
        <p className="flex items-center gap-2 flex-1">
          <Sparkles size={16} className="shrink-0" />
          <span>
            <strong className="font-semibold">Mode démo</strong>
            <span className="text-white/80"> — concession fictive, données d&apos;exemple. Les modifications ne sont pas enregistrées.</span>
          </span>
        </p>
        <div className="flex items-center gap-3 shrink-0">
          <button onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-white/80 hover:text-white text-xs underline-offset-2 hover:underline">
            Quitter
          </button>
          <a href={SIGNUP_URL}
            className="bg-white text-blue-700 hover:bg-blue-50 px-3.5 py-1.5 rounded-lg font-semibold text-xs transition-colors">
            Essai gratuit 14 jours →
          </a>
        </div>
      </div>
    </div>
  );
}
