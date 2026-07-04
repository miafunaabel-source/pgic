"use client";
import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle } from "lucide-react";

const fieldCls = "w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all";

function RegisterContent() {
  const params = useSearchParams();
  const router = useRouter();

  let setupData: Record<string, string> = {};
  try {
    const setup = params.get("setup");
    if (setup) setupData = JSON.parse(decodeURIComponent(atob(setup)));
  } catch {}

  const [form, setForm] = useState({
    prenom: setupData.prenom ?? "",
    nom: setupData.nom ?? "",
    email: setupData.email ?? "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: `${form.prenom} ${form.nom}`.trim() || form.email,
        email: form.email,
        password: form.password,
        company: Object.keys(setupData).length ? setupData : undefined,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Une erreur est survenue.");
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push("/login"), 2000);
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-2xl p-8 shadow-2xl text-center">
            <CheckCircle className="text-emerald-500 mx-auto mb-3" size={44} />
            <p className="font-semibold text-slate-900 text-lg">Compte créé avec succès !</p>
            <p className="text-slate-500 text-sm mt-1">Redirection vers la connexion…</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-500 rounded-2xl mb-4">
            <span className="text-white font-bold text-2xl">P</span>
          </div>
          <h1 className="text-2xl font-bold text-white">PGIC</h1>
          <p className="text-slate-400 text-sm mt-1">
            {setupData.concession ? `Bienvenue, ${setupData.concession}` : "Créer votre compte"}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <h2 className="text-lg font-semibold text-slate-900 mb-6">Créer votre accès</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Prénom</label>
                <input type="text" required value={form.prenom}
                  onChange={e => setForm(f => ({ ...f, prenom: e.target.value }))}
                  className={fieldCls} placeholder="Jean" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Nom</label>
                <input type="text" required value={form.nom}
                  onChange={e => setForm(f => ({ ...f, nom: e.target.value }))}
                  className={fieldCls} placeholder="Dupont" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Adresse email</label>
              <input type="email" required value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className={fieldCls} placeholder="vous@concession.fr" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Mot de passe</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} required minLength={8}
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="8 caractères minimum"
                  className={fieldCls + " pr-10"} />
                <button type="button" onClick={() => setShowPassword(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirmer le mot de passe</label>
              <input type="password" required value={form.confirmPassword}
                onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
                className={fieldCls} placeholder="••••••••" />
            </div>

            {error && (
              <div className="flex items-start gap-2 border rounded-lg px-3 py-2.5 text-sm text-red-600 bg-red-50 border-red-100">
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? "Création…" : "Accéder à mon espace"}
            </button>
          </form>

          <p className="text-center text-xs text-slate-500 mt-4">
            Déjà un compte ?{" "}
            <a href="/login" className="text-blue-600 hover:underline">Se connecter</a>
          </p>
        </div>

        <p className="text-center text-xs text-slate-500 mt-6">
          © 2026 PGIC — Accès réservé au personnel autorisé
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterContent />
    </Suspense>
  );
}
