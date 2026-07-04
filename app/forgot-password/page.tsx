"use client";
import { useState } from "react";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setSent(true);
    } catch {
      setError("Erreur réseau, veuillez réessayer.");
    } finally {
      setLoading(false);
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
          <p className="text-slate-400 text-sm mt-1">Réinitialisation du mot de passe</p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          {sent ? (
            <div className="text-center py-2">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={24} className="text-emerald-500" />
              </div>
              <h2 className="font-semibold text-slate-900 mb-2">Email envoyé</h2>
              <p className="text-sm text-slate-500 mb-6">
                Si un compte existe avec <strong>{email}</strong>, vous recevrez un lien de réinitialisation valable 1 heure.
              </p>
              <a href="/login" className="text-sm text-blue-600 hover:underline font-medium">
                Retour à la connexion →
              </a>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-slate-900 mb-2">Mot de passe oublié ?</h2>
              <p className="text-sm text-slate-500 mb-6">Entrez votre adresse email pour recevoir un lien de réinitialisation.</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Adresse email</label>
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="vous@pgic.fr" autoComplete="email"
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                </div>
                {error && (
                  <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-100 rounded-lg px-3 py-2.5">
                    <AlertCircle size={15} className="shrink-0" /> {error}
                  </div>
                )}
                <button type="submit" disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                  {loading && <Loader2 size={16} className="animate-spin" />}
                  {loading ? "Envoi…" : "Envoyer le lien"}
                </button>
                <a href="/login" className="block text-center text-sm text-slate-500 hover:text-slate-700 transition-colors">
                  Retour à la connexion
                </a>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
