"use client";
import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { Car, Eye, EyeOff, Loader2, AlertCircle, Clock } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [blockedMinutes, setBlockedMinutes] = useState(0);

  // Compte à rebours si compte bloqué
  useEffect(() => {
    if (blockedMinutes <= 0) return;
    const timer = setInterval(() => {
      setBlockedMinutes(m => {
        if (m <= 1) { clearInterval(timer); setError(""); return 0; }
        return m - 1;
      });
    }, 60000);
    return () => clearInterval(timer);
  }, [blockedMinutes]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (blockedMinutes > 0) return;
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      // Erreur rate limit : format "RATE_LIMIT:N" transmis via NextAuth error
      const rateLimitMatch = result.error.match(/RATE_LIMIT:(\d+)/);
      if (rateLimitMatch) {
        const minutes = parseInt(rateLimitMatch[1], 10);
        setBlockedMinutes(minutes);
        setError(`Trop de tentatives échouées. Compte bloqué ${minutes} minute(s).`);
      } else {
        setError("Email ou mot de passe incorrect.");
      }
    } else {
      // Full page reload pour que le cookie de session soit reconnu par le middleware
      window.location.href = "/";
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-500 rounded-2xl mb-4">
            <Car size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">PGIC</h1>
          <p className="text-slate-400 text-sm mt-1">Hub Digital Concessionnaire</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <h2 className="text-lg font-semibold text-slate-900 mb-6">Connexion</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Adresse email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="vous@pgic.fr"
                required
                autoComplete="email"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full px-3.5 py-2.5 pr-10 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className={`flex items-start gap-2 border rounded-lg px-3 py-2.5 text-sm ${blockedMinutes > 0 ? "text-amber-700 bg-amber-50 border-amber-100" : "text-red-600 bg-red-50 border-red-100"}`}>
                {blockedMinutes > 0
                  ? <Clock size={15} className="shrink-0 mt-0.5" />
                  : <AlertCircle size={15} className="shrink-0 mt-0.5" />
                }
                <span>{error}{blockedMinutes > 0 && ` (${blockedMinutes} min restante${blockedMinutes > 1 ? "s" : ""})`}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || blockedMinutes > 0}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? "Connexion..." : blockedMinutes > 0 ? `Bloqué (${blockedMinutes} min)` : "Se connecter"}
            </button>
          </form>

          {/* Comptes démo — visible uniquement en développement local */}
          {process.env.NODE_ENV === "development" && (
            <div className="mt-6 pt-5 border-t border-slate-100">
              <p className="text-xs font-medium text-slate-400 uppercase mb-3">Comptes démo</p>
              <div className="space-y-1.5">
                {[
                  { label: "Directeur", email: "admin@pgic.fr" },
                  { label: "Vendeur", email: "emilie@pgic.fr" },
                  { label: "Technicien", email: "marc@pgic.fr" },
                ].map(({ label, email: demoEmail }) => (
                  <button
                    key={demoEmail}
                    type="button"
                    onClick={() => { setEmail(demoEmail); setPassword("Admin@2026!"); }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors flex items-center justify-between"
                  >
                    <span className="font-medium">{label}</span>
                    <span className="text-slate-400">{demoEmail}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-slate-500 mt-6">
          © 2026 PGIC — Accès réservé au personnel autorisé
        </p>
      </div>
    </div>
  );
}
