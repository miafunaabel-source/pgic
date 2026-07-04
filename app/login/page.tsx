"use client";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, Loader2, AlertCircle, Clock } from "lucide-react";

function LoginContent() {
  const params = useSearchParams();
  const [email, setEmail] = useState(params.get("email") ?? "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [blockedMinutes, setBlockedMinutes] = useState(0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (blockedMinutes > 0) return;
    setError("");
    setLoading(true);

    const result = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);

    if (result?.error) {
      const rateLimitMatch = result.error.match(/RATE_LIMIT:(\d+)/);
      if (rateLimitMatch) {
        const minutes = parseInt(rateLimitMatch[1], 10);
        setBlockedMinutes(minutes);
        setError(`Trop de tentatives. Compte bloqué ${minutes} minute(s).`);
      } else {
        setError(`Email ou mot de passe incorrect.`);
      }
    } else {
      window.location.replace("/");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-500 rounded-2xl mb-4">
            <span className="text-white font-bold text-2xl">P</span>
          </div>
          <h1 className="text-2xl font-bold text-white">PGIC</h1>
          <p className="text-slate-400 text-sm mt-1">Hub Digital Concessionnaire</p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <h2 className="text-lg font-semibold text-slate-900 mb-6">Connexion</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Adresse email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="vous@pgic.fr" required autoComplete="email"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Mot de passe</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} value={password}
                  onChange={e => setPassword(e.target.value)} placeholder="••••••••" required
                  autoComplete="current-password"
                  className="w-full px-3.5 py-2.5 pr-10 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className={`flex items-start gap-2 border rounded-lg px-3 py-2.5 text-sm ${blockedMinutes > 0 ? "text-amber-700 bg-amber-50 border-amber-100" : "text-red-600 bg-red-50 border-red-100"}`}>
                {blockedMinutes > 0
                  ? <Clock size={15} className="shrink-0 mt-0.5" />
                  : <AlertCircle size={15} className="shrink-0 mt-0.5" />}
                <span>{error}</span>
              </div>
            )}

            <button type="submit" disabled={loading || blockedMinutes > 0}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? "Connexion..." : blockedMinutes > 0 ? `Bloqué (${blockedMinutes} min)` : "Se connecter"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs mt-4">
          <a href="/forgot-password" className="text-slate-400 hover:text-slate-200 transition-colors">Mot de passe oublié ?</a>
        </p>
        <p className="text-center text-xs text-slate-500 mt-3">
          © 2026 PGIC — Accès réservé au personnel autorisé
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense><LoginContent /></Suspense>;
}
