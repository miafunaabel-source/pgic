"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { signIn } from "next-auth/react";
import { Loader2, AlertCircle } from "lucide-react";

export default function DemoPage() {
  const [error, setError] = useState(false);
  const started = useRef(false);

  const startDemo = useCallback(async () => {
    setError(false);
    const result = await signIn("demo", { redirect: false });
    if (result?.error || !result?.ok) {
      setError(true);
      return;
    }
    window.location.replace("/");
  }, []);

  useEffect(() => {
    // Évite le double appel du StrictMode en développement
    if (started.current) return;
    started.current = true;
    startDemo();
  }, [startDemo]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-500 rounded-2xl mb-4">
          <span className="text-white font-bold text-2xl">P</span>
        </div>
        <h1 className="text-2xl font-bold text-white">PGIC</h1>
        <p className="text-slate-400 text-sm mt-1 mb-8">Hub Digital Concessionnaire</p>

        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          {error ? (
            <>
              <div className="flex items-start gap-2 text-left text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2.5 text-sm mb-4">
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                <span>La démo est momentanément indisponible.</span>
              </div>
              <button onClick={startDemo}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors">
                Réessayer
              </button>
              <a href="/login" className="block mt-3 text-xs text-slate-500 hover:text-slate-700">
                J&apos;ai déjà un compte
              </a>
            </>
          ) : (
            <div className="flex flex-col items-center gap-3 text-slate-600 text-sm">
              <Loader2 size={24} className="animate-spin text-blue-600" />
              <p className="font-medium text-slate-900">Préparation de votre démo…</p>
              <p className="text-xs text-slate-500">Concession fictive avec données d&apos;exemple — aucune inscription requise.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
