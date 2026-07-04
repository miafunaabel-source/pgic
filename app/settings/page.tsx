"use client";
import { useState, useEffect } from "react";
import { Building2, Euro, Wrench, Star, Save, Target } from "lucide-react";
import { loadSettings, saveSettings, DEFAULT_SETTINGS, type CompanySettings } from "@/lib/settings";
import { kpiData } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/contexts/ToastContext";

function PerfoBar({ label, actual, target, formatVal }: {
  label: string; actual: number; target: number; formatVal: (n: number) => string;
}) {
  const pct = Math.min(Math.round((actual / target) * 100), 120);
  const clampedPct = Math.min(pct, 100);
  const color = pct >= 100 ? "bg-emerald-500" : pct >= 80 ? "bg-amber-400" : "bg-red-400";
  const textColor = pct >= 100 ? "text-emerald-700" : pct >= 80 ? "text-amber-700" : "text-red-600";
  return (
    <div className="mb-4 last:mb-0">
      <div className="flex justify-between items-baseline mb-1">
        <span className="text-xs font-medium text-slate-600">{label}</span>
        <span className={`text-xs font-bold ${textColor}`}>{formatVal(actual)} / {formatVal(target)}</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${clampedPct}%` }} />
      </div>
      <p className={`text-xs mt-0.5 text-right ${textColor}`}>{pct}%</p>
    </div>
  );
}

function SectionCard({ icon, iconColor, title, children }: {
  icon: React.ReactNode; iconColor: string; title: string; children: React.ReactNode;
}) {
  return (
    <div className="card p-5">
      <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
        <span className={iconColor}>{icon}</span>
        {title}
      </h2>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-700 mb-1">{label}</label>
      {children}
    </div>
  );
}

const INPUT = "w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500";

export default function SettingsPage() {
  const toast = useToast();
  const [form, setForm] = useState<CompanySettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    fetch("/api/settings")
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          setForm({ ...DEFAULT_SETTINGS, ...data });
          saveSettings({ ...DEFAULT_SETTINGS, ...data });
        } else {
          setForm(loadSettings());
        }
      })
      .catch(() => { setForm(loadSettings()); });
  }, []);

  function set<K extends keyof CompanySettings>(key: K, val: CompanySettings[K]) {
    setForm(f => ({ ...f, [key]: val }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    saveSettings(form);
    try {
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    } catch {}
    toast("success", "Paramètres sauvegardés avec succès");
  }

  const caAtelierMois = kpiData.chiffreAffaireAnnuel.at(-1)?.atelier ?? 0;
  const caTotalMois = kpiData.venteMois + caAtelierMois;
  const caYTD = kpiData.chiffreAffaireAnnuel.reduce((s, m) => s + m.ventes + m.atelier, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Paramètres</h1>
          <p className="text-sm text-slate-500 mt-0.5">Configuration et objectifs de votre concession</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulaire */}
        <form onSubmit={handleSave} className="lg:col-span-2 space-y-5">
          <SectionCard icon={<Building2 size={16} />} iconColor="text-blue-500" title="Informations entreprise">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Nom de la concession">
                <input className={INPUT} value={form.nom} onChange={e => set("nom", e.target.value)} />
              </Field>
              <Field label="Ville">
                <input className={INPUT} value={form.ville} onChange={e => set("ville", e.target.value)} />
              </Field>
            </div>
          </SectionCard>

          <SectionCard icon={<Euro size={16} />} iconColor="text-emerald-500" title="Objectifs Chiffre d'Affaires">
            <div className="grid grid-cols-2 gap-4">
              <Field label="CA objectif annuel (€)">
                <input className={INPUT} type="number" value={form.caObjectifAnnuel}
                  onChange={e => set("caObjectifAnnuel", Number(e.target.value))} />
              </Field>
              <Field label="CA objectif mensuel (€)">
                <input className={INPUT} type="number" value={form.caObjectifMensuel}
                  onChange={e => set("caObjectifMensuel", Number(e.target.value))} />
              </Field>
              <Field label="Ventes / mois (nb véhicules)">
                <input className={INPUT} type="number" value={form.objectifVentesMois}
                  onChange={e => set("objectifVentesMois", Number(e.target.value))} />
              </Field>
              <Field label="Panier moyen véhicule (€)">
                <input className={INPUT} type="number" value={form.panierMoyen}
                  onChange={e => set("panierMoyen", Number(e.target.value))} />
              </Field>
            </div>
          </SectionCard>

          <SectionCard icon={<Wrench size={16} />} iconColor="text-amber-500" title="Atelier SAV">
            <div className="grid grid-cols-3 gap-4">
              <Field label="RDV objectif / semaine">
                <input className={INPUT} type="number" value={form.objectifRdvSemaine}
                  onChange={e => set("objectifRdvSemaine", Number(e.target.value))} />
              </Field>
              <Field label="Capacité max / semaine">
                <input className={INPUT} type="number" value={form.capaciteAtelier}
                  onChange={e => set("capaciteAtelier", Number(e.target.value))} />
              </Field>
              <Field label="Nombre de techniciens">
                <input className={INPUT} type="number" value={form.nbTechniciens}
                  onChange={e => set("nbTechniciens", Number(e.target.value))} />
              </Field>
            </div>
          </SectionCard>

          <SectionCard icon={<Star size={16} />} iconColor="text-purple-500" title="Qualité & Rentabilité">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Satisfaction cible (%)">
                <input className={INPUT} type="number" min="0" max="100" value={form.objectifSatisfaction}
                  onChange={e => set("objectifSatisfaction", Number(e.target.value))} />
              </Field>
              <Field label="Marge commerciale cible (%)">
                <input className={INPUT} type="number" min="0" max="100" value={form.margeObjectif}
                  onChange={e => set("margeObjectif", Number(e.target.value))} />
              </Field>
            </div>
          </SectionCard>

          <button type="submit" className="btn-primary flex items-center gap-2">
            <Save size={16} />
            Sauvegarder les paramètres
          </button>
        </form>

        {/* Colonne de droite */}
        <div className="space-y-5">
          <div className="card p-5">
            <h2 className="font-semibold text-slate-900 mb-1 flex items-center gap-2">
              <Target size={16} className="text-blue-500" />
              Performance vs Objectifs
            </h2>
            <p className="text-xs text-slate-400 mb-4">Données en temps réel — mai 2026</p>
            <PerfoBar label="CA mensuel (ventes + atelier)" actual={caTotalMois} target={form.caObjectifMensuel} formatVal={formatCurrency} />
            <PerfoBar label="CA annuel YTD (Jan–Mai)" actual={caYTD} target={form.caObjectifAnnuel} formatVal={formatCurrency} />
            <PerfoBar label="RDV cette semaine" actual={kpiData.rdvSemaine} target={form.objectifRdvSemaine} formatVal={n => `${n} RDV`} />
            <PerfoBar label="Satisfaction client" actual={kpiData.tauxSatisfaction} target={form.objectifSatisfaction} formatVal={n => `${n}%`} />
          </div>

          <div className="card p-5">
            <h2 className="font-semibold text-slate-900 mb-4">CA mensuel détaillé</h2>
            <div className="space-y-0">
              {kpiData.chiffreAffaireAnnuel.map(m => {
                const total = m.ventes + m.atelier;
                const pct = Math.round((total / form.caObjectifMensuel) * 100);
                const tagColor = pct >= 100 ? "text-emerald-700 bg-emerald-50" : pct >= 80 ? "text-amber-700 bg-amber-50" : "text-red-600 bg-red-50";
                return (
                  <div key={m.mois} className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0">
                    <span className="text-sm font-semibold text-slate-700 w-8">{m.mois}</span>
                    <div className="flex-1 mx-3 min-w-0">
                      <p className="text-xs text-slate-400 truncate">
                        {formatCurrency(m.ventes)} ventes + {formatCurrency(m.atelier)} atelier
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-sm font-bold text-slate-900">{formatCurrency(total)}</span>
                      <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${tagColor}`}>{pct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between items-center">
              <span className="text-sm font-semibold text-slate-600">Total YTD</span>
              <span className="text-base font-bold text-blue-700">{formatCurrency(caYTD)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
