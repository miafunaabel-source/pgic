"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Building2, MapPin, Phone, Tag, Users, ArrowRight, AlertCircle } from "lucide-react";
import { saveSettings, DEFAULT_SETTINGS } from "@/lib/settings";

const MARQUES = [
  "Peugeot", "Renault", "Citroën", "Volkswagen", "BMW", "Mercedes-Benz",
  "Audi", "Toyota", "Ford", "Opel", "Fiat", "Hyundai", "Kia", "Nissan", "Autre",
];

const TAILLES = [
  { value: "1-5", label: "1 – 5 employés" },
  { value: "6-15", label: "6 – 15 employés" },
  { value: "16-50", label: "16 – 50 employés" },
  { value: "50+", label: "+ de 50 employés" },
];

const field = "w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white";

export default function SetupPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const company = (session?.user as any)?.company ?? {};

  const [form, setForm] = useState({
    nom: company.concession ?? "",
    ville: company.ville ?? "",
    tel: company.tel ?? "",
    adresse: company.adresse ?? "",
    taille: company.taille ?? "1-5",
    marques: (company.marques as string[]) ?? [],
  });

  function toggleMarque(m: string) {
    setForm(f => ({
      ...f,
      marques: f.marques.includes(m) ? f.marques.filter(x => x !== m) : [...f.marques, m],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nom.trim() || !form.ville.trim()) {
      setError("Le nom de la concession et la ville sont requis.");
      return;
    }
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...DEFAULT_SETTINGS,
          nom: form.nom,
          ville: form.ville,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Erreur lors de la sauvegarde.");
        setSubmitting(false);
        return;
      }

      saveSettings({ ...DEFAULT_SETTINGS, nom: form.nom, ville: form.ville });
      await update({ setupComplete: true });
      router.replace("/");
    } catch {
      setError("Erreur réseau. Veuillez réessayer.");
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-500 rounded-xl mb-3">
            <span className="text-white font-bold text-xl">P</span>
          </div>
          <h1 className="text-xl font-bold text-white">Bienvenue sur PGIC</h1>
          <p className="text-slate-400 text-sm mt-1">Quelques informations pour personnaliser votre espace</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-6">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-5 text-sm">
              <AlertCircle size={15} className="shrink-0" /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Infos générales */}
            <div className="space-y-3">
              <h2 className="font-semibold text-slate-800 flex items-center gap-2 text-sm">
                <Building2 size={16} className="text-blue-500" /> Votre concession
              </h2>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Nom de la concession *</label>
                <input required className={field} placeholder="Garage Dupont Automobiles"
                  value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Ville *</label>
                  <input required className={field} placeholder="Lyon"
                    value={form.ville} onChange={e => setForm(f => ({ ...f, ville: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Téléphone</label>
                  <input type="tel" className={field} placeholder="04 78 00 00 00"
                    value={form.tel} onChange={e => setForm(f => ({ ...f, tel: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Adresse</label>
                <input className={field} placeholder="12 rue de la République"
                  value={form.adresse} onChange={e => setForm(f => ({ ...f, adresse: e.target.value }))} />
              </div>
            </div>

            {/* Taille */}
            <div className="space-y-2">
              <h2 className="font-semibold text-slate-800 flex items-center gap-2 text-sm">
                <Users size={16} className="text-blue-500" /> Taille de l'équipe
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {TAILLES.map(t => (
                  <label key={t.value} className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors text-xs ${
                    form.taille === t.value
                      ? "bg-blue-50 border-blue-400 text-blue-700 font-medium"
                      : "border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}>
                    <input type="radio" name="taille" value={t.value} checked={form.taille === t.value}
                      onChange={() => setForm(f => ({ ...f, taille: t.value }))} className="hidden" />
                    {t.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Marques */}
            <div className="space-y-2">
              <h2 className="font-semibold text-slate-800 flex items-center gap-2 text-sm">
                <Tag size={16} className="text-blue-500" /> Marques représentées
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {MARQUES.map(m => (
                  <button key={m} type="button" onClick={() => toggleMarque(m)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                      form.marques.includes(m)
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"
                    }`}>
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" disabled={submitting}
              className="w-full mt-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-3 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2">
              {submitting ? (
                <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Chargement…</>
              ) : (
                <>Accéder à mon tableau de bord <ArrowRight size={16} /></>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
