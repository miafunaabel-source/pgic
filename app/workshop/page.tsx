"use client";
import { useState, useEffect } from "react";
import { Wrench, Clock, User, Car, CalendarPlus } from "lucide-react";
import type { RendezVous } from "@/lib/data";
import { cn } from "@/lib/utils";
import Modal from "@/components/ui/Modal";
import { useToast } from "@/contexts/ToastContext";

const TYPE_COLORS: Record<RendezVous["type"], string> = {
  entretien: "bg-blue-500",
  reparation: "bg-red-500",
  diagnostic: "bg-amber-500",
  controle: "bg-purple-500",
};
const TYPE_LABELS: Record<RendezVous["type"], string> = {
  entretien: "Entretien",
  reparation: "Réparation",
  diagnostic: "Diagnostic",
  controle: "Contrôle",
};
const STATUT_STYLES: Record<RendezVous["statut"], string> = {
  planifie: "bg-blue-100 text-blue-700",
  en_cours: "bg-amber-100 text-amber-700",
  termine: "bg-emerald-100 text-emerald-700",
  annule: "bg-red-100 text-red-700",
};
const STATUT_LABELS: Record<RendezVous["statut"], string> = {
  planifie: "Planifié",
  en_cours: "En cours",
  termine: "Terminé",
  annule: "Annulé",
};
const TECHNICIENS = ["Tous", "Marc Lefebvre", "Paul Durand", "Anne Rousseau"];
const HEURES = ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"];

function RdvCard({ rv, onDemarrer, onTerminer, onModifier }: {
  rv: RendezVous;
  onDemarrer: () => void;
  onTerminer: () => void;
  onModifier: () => void;
}) {
  return (
    <div className="card p-4 border-l-4" style={{ borderLeftColor: rv.type === "entretien" ? "#3b82f6" : rv.type === "reparation" ? "#ef4444" : rv.type === "diagnostic" ? "#f59e0b" : "#8b5cf6" }}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`w-2 h-2 rounded-full ${TYPE_COLORS[rv.type]}`} />
            <span className="text-xs font-medium text-slate-500">{TYPE_LABELS[rv.type]}</span>
          </div>
          <h3 className="font-semibold text-slate-900">{rv.clientNom}</h3>
        </div>
        <span className={`badge ${STATUT_STYLES[rv.statut]}`}>{STATUT_LABELS[rv.statut]}</span>
      </div>
      <div className="space-y-1.5 text-sm text-slate-500">
        <div className="flex items-center gap-2"><Car size={13} /><span>{rv.vehicule}</span></div>
        <div className="flex items-center gap-2"><User size={13} /><span>{rv.technicien}</span></div>
        <div className="flex items-center gap-2"><Clock size={13} /><span>{rv.heure} · {rv.duree} min</span></div>
      </div>
      {rv.notes && (
        <p className="mt-2 text-xs text-slate-400 italic border-t border-slate-50 pt-2">{rv.notes}</p>
      )}
      <div className="flex gap-2 mt-3">
        <button onClick={onModifier} className="btn-secondary flex-1 text-center text-xs py-1.5">Modifier</button>
        {rv.statut === "planifie" && (
          <button onClick={onDemarrer} className="btn-primary flex-1 text-center text-xs py-1.5">Démarrer</button>
        )}
        {rv.statut === "en_cours" && (
          <button onClick={onTerminer} className="flex-1 text-center text-xs py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors">Terminer</button>
        )}
      </div>
    </div>
  );
}

function PlanningView({ rdvList }: { rdvList: RendezVous[] }) {
  const [techFilter, setTechFilter] = useState("Tous");
  const techniciens = ["Marc Lefebvre", "Paul Durand", "Anne Rousseau"];
  const filtered = techFilter === "Tous" ? rdvList : rdvList.filter(r => r.technicien === techFilter);

  return (
    <div>
      <div className="flex gap-2 mb-4">
        {TECHNICIENS.map(t => (
          <button key={t} onClick={() => setTechFilter(t)}
            className={cn("px-3 py-1 rounded-lg text-sm font-medium transition-colors", techFilter === t ? "bg-blue-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50")}>
            {t}
          </button>
        ))}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="text-xs font-semibold text-slate-500 text-left p-3 w-28 bg-slate-50 rounded-tl-lg">Heure</th>
              {(techFilter === "Tous" ? techniciens : [techFilter]).map(t => (
                <th key={t} className="text-xs font-semibold text-slate-500 text-center p-3 bg-slate-50 min-w-[160px]">{t}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {HEURES.map(heure => (
              <tr key={heure} className="border-t border-slate-100">
                <td className="text-xs text-slate-400 p-3 font-mono">{heure}</td>
                {(techFilter === "Tous" ? techniciens : [techFilter]).map(tech => {
                  const rv = filtered.find(r => r.heure === heure && r.technicien === tech);
                  return (
                    <td key={tech} className="p-1.5 align-top">
                      {rv && (
                        <div className={cn("rounded-lg p-2 text-white text-xs", TYPE_COLORS[rv.type])}>
                          <p className="font-semibold truncate">{rv.clientNom}</p>
                          <p className="opacity-80 truncate">{TYPE_LABELS[rv.type]}</p>
                          <p className="opacity-70">{rv.duree}min</p>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function WorkshopPage() {
  const toast = useToast();
  const [rdvList, setRdvList] = useState<RendezVous[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"liste" | "planning">("liste");

  useEffect(() => {
    fetch("/api/appointments").then(r => r.json()).then(data => {
      setRdvList(Array.isArray(data) ? data : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);
  const [statutFilter, setStatutFilter] = useState<"tous" | RendezVous["statut"]>("tous");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ clientNom: "", vehicule: "", type: "entretien" as RendezVous["type"], technicien: "Marc Lefebvre", heure: "09:00", duree: "60", notes: "" });

  const filtered = rdvList.filter(rv => statutFilter === "tous" || rv.statut === statutFilter);
  const counts = {
    planifie: rdvList.filter(r => r.statut === "planifie").length,
    en_cours: rdvList.filter(r => r.statut === "en_cours").length,
    termine: rdvList.filter(r => r.statut === "termine").length,
  };

  async function demarrer(id: string) {
    const rv = rdvList.find(r => r.id === id);
    const res = await fetch(`/api/appointments/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ statut: "en_cours" }),
    });
    if (res.ok) {
      setRdvList(prev => prev.map(r => r.id === id ? { ...r, statut: "en_cours" } : r));
      toast("info", `Intervention démarrée pour ${rv?.clientNom}`);
    }
  }

  async function terminer(id: string) {
    const rv = rdvList.find(r => r.id === id);
    const res = await fetch(`/api/appointments/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ statut: "termine" }),
    });
    if (res.ok) {
      setRdvList(prev => prev.map(r => r.id === id ? { ...r, statut: "termine" } : r));
      toast("success", `Intervention terminée pour ${rv?.clientNom}`);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) { toast("error", "Erreur lors de la création"); return; }
    const newRdv: RendezVous = await res.json();
    setRdvList(prev => [newRdv, ...prev]);
    setShowModal(false);
    setForm({ clientNom: "", vehicule: "", type: "entretien", technicien: "Marc Lefebvre", heure: "09:00", duree: "60", notes: "" });
    toast("success", `RDV créé pour ${form.clientNom}`);
  }

  return (
    <div>
      {showModal && (
        <Modal title="Nouveau rendez-vous" onClose={() => setShowModal(false)}>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Client *</label>
              <input required value={form.clientNom} onChange={e => setForm(f => ({ ...f, clientNom: e.target.value }))}
                placeholder="Nom du client"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Véhicule *</label>
              <input required value={form.vehicule} onChange={e => setForm(f => ({ ...f, vehicule: e.target.value }))}
                placeholder="Marque Modèle"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Type</label>
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as RendezVous["type"] }))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="entretien">Entretien</option>
                  <option value="reparation">Réparation</option>
                  <option value="diagnostic">Diagnostic</option>
                  <option value="controle">Contrôle</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Technicien</label>
                <select value={form.technicien} onChange={e => setForm(f => ({ ...f, technicien: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Marc Lefebvre</option>
                  <option>Paul Durand</option>
                  <option>Anne Rousseau</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Heure</label>
                <select value={form.heure} onChange={e => setForm(f => ({ ...f, heure: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {HEURES.map(h => <option key={h}>{h}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Durée (min)</label>
                <select value={form.duree} onChange={e => setForm(f => ({ ...f, duree: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {["30", "60", "90", "120", "180", "240"].map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Notes</label>
              <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                rows={2} placeholder="Observations, pièces à prévoir..."
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn-secondary">Annuler</button>
              <button type="submit" className="flex-1 btn-primary">Créer le RDV</button>
            </div>
          </form>
        </Modal>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Atelier & SAV</h1>
          <p className="text-sm text-slate-500 mt-0.5">{rdvList.length} rendez-vous</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <CalendarPlus size={16} />
          Nouveau RDV
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="card p-4 border-l-4 border-blue-500">
          <p className="text-2xl font-bold text-slate-900">{counts.planifie}</p>
          <p className="text-xs text-slate-500 mt-0.5">Planifiés</p>
        </div>
        <div className="card p-4 border-l-4 border-amber-500">
          <p className="text-2xl font-bold text-slate-900">{counts.en_cours}</p>
          <p className="text-xs text-slate-500 mt-0.5">En cours</p>
        </div>
        <div className="card p-4 border-l-4 border-emerald-500">
          <p className="text-2xl font-bold text-slate-900">{counts.termine}</p>
          <p className="text-xs text-slate-500 mt-0.5">Terminés</p>
        </div>
      </div>

      {/* View toggle + filters */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="flex gap-1 bg-white border border-slate-200 rounded-lg p-1">
          <button onClick={() => setView("liste")} className={cn("px-3 py-1 rounded text-sm font-medium transition-colors", view === "liste" ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-50")}>Liste</button>
          <button onClick={() => setView("planning")} className={cn("px-3 py-1 rounded text-sm font-medium transition-colors", view === "planning" ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-50")}>Planning</button>
        </div>
        {view === "liste" && (
          <div className="flex gap-1 bg-white border border-slate-200 rounded-lg p-1">
            {(["tous", "planifie", "en_cours", "termine", "annule"] as const).map(s => (
              <button key={s} onClick={() => setStatutFilter(s)}
                className={cn("px-3 py-1 rounded text-xs font-medium transition-colors", statutFilter === s ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-50")}>
                {s === "tous" ? "Tous" : STATUT_LABELS[s as RendezVous["statut"]]}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400">Chargement…</div>
      ) : view === "liste" ? (
        filtered.length === 0 && rdvList.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Wrench size={40} className="mx-auto mb-3 text-slate-300" />
            <p className="font-medium text-slate-500">Aucun rendez-vous atelier</p>
            <p className="text-sm mt-1">Planifiez votre premier RDV avec le bouton ci-dessus</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(rv => (
              <RdvCard
                key={rv.id}
                rv={rv}
                onDemarrer={() => demarrer(rv.id)}
                onTerminer={() => terminer(rv.id)}
                onModifier={() => toast("info", `Modification du RDV de ${rv.clientNom} en cours...`)}
              />
            ))}
          </div>
        )
      ) : (
        <div className="card p-5">
          <PlanningView rdvList={rdvList} />
        </div>
      )}
    </div>
  );
}
