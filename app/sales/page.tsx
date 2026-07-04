"use client";
import { useState, useEffect } from "react";
import { ShoppingCart, TrendingUp, Clock, CheckCircle, FileText, ChevronRight } from "lucide-react";
import type { Vente } from "@/lib/data";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import Modal from "@/components/ui/Modal";
import { useToast } from "@/contexts/ToastContext";

const STATUT_CONFIG: Record<Vente["statut"], { label: string; style: string; step: number }> = {
  devis: { label: "Devis", style: "bg-slate-100 text-slate-700", step: 1 },
  commande: { label: "Commande", style: "bg-blue-100 text-blue-700", step: 2 },
  finance: { label: "Financé", style: "bg-purple-100 text-purple-700", step: 3 },
  livre: { label: "Livré", style: "bg-emerald-100 text-emerald-700", step: 4 },
};

const PIPELINE_STEPS = ["devis", "commande", "finance", "livre"] as Vente["statut"][];

function PipelineColumn({ statut, items, onAdd }: { statut: Vente["statut"]; items: Vente[]; onAdd: () => void }) {
  const config = STATUT_CONFIG[statut];
  const total = items.reduce((s, v) => s + v.montant, 0);

  return (
    <div className="flex-1 min-w-[200px]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`badge ${config.style}`}>{config.label}</span>
          <span className="text-xs text-slate-400">({items.length})</span>
        </div>
        <span className="text-xs font-semibold text-slate-600">{formatCurrency(total)}</span>
      </div>
      <div className="space-y-3">
        {items.map(v => (
          <div key={v.id} className="card p-4 cursor-pointer hover:shadow-md transition-shadow">
            <p className="font-semibold text-sm text-slate-900 mb-1">{v.clientNom}</p>
            <p className="text-xs text-slate-400 mb-2">{v.vehicule}</p>
            <p className="text-base font-bold text-blue-700">{formatCurrency(v.montant)}</p>
            <div className="flex items-center justify-between mt-2 text-xs text-slate-400">
              <span>{v.vendeur.split(" ")[0]}</span>
              <span>{formatDate(v.date)}</span>
            </div>
            {v.financement !== "En attente" && (
              <p className="text-xs text-slate-500 mt-1.5 border-t border-slate-50 pt-1.5">{v.financement}</p>
            )}
          </div>
        ))}
        <button onClick={onAdd} className="w-full border-2 border-dashed border-slate-200 rounded-xl p-3 text-sm text-slate-400 hover:border-blue-300 hover:text-blue-500 transition-colors">
          + Ajouter
        </button>
      </div>
    </div>
  );
}

function VenteRow({ v }: { v: Vente }) {
  const config = STATUT_CONFIG[v.statut];
  return (
    <tr className="border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors">
      <td className="px-5 py-3.5">
        <p className="text-sm font-medium text-slate-900">{v.clientNom}</p>
        <p className="text-xs text-slate-400">{v.id}</p>
      </td>
      <td className="px-4 py-3.5"><p className="text-sm text-slate-700">{v.vehicule}</p></td>
      <td className="px-4 py-3.5"><p className="text-sm font-bold text-blue-700">{formatCurrency(v.montant)}</p></td>
      <td className="px-4 py-3.5"><span className={`badge ${config.style}`}>{config.label}</span></td>
      <td className="px-4 py-3.5"><p className="text-xs text-slate-600">{v.financement}</p></td>
      <td className="px-4 py-3.5"><p className="text-xs text-slate-500">{v.vendeur}</p></td>
      <td className="px-4 py-3.5"><p className="text-xs text-slate-400">{formatDate(v.date)}</p></td>
      <td className="px-4 py-3.5"><ChevronRight size={16} className="text-slate-300" /></td>
    </tr>
  );
}

export default function SalesPage() {
  const toast = useToast();
  const [ventes, setVentes] = useState<Vente[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"pipeline" | "liste">("pipeline");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ clientNom: "", vehicule: "", montant: "", financement: "En attente" });

  useEffect(() => {
    fetch("/api/sales").then(r => r.json()).then(data => {
      setVentes(Array.isArray(data) ? data : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const totalEnCours = ventes.filter(v => v.statut !== "livre").reduce((s, v) => s + v.montant, 0);
  const totalLivre = ventes.filter(v => v.statut === "livre").reduce((s, v) => s + v.montant, 0);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) { toast("error", "Erreur lors de la création"); return; }
    const newVente: Vente = await res.json();
    setVentes(prev => [newVente, ...prev]);
    setShowModal(false);
    setForm({ clientNom: "", vehicule: "", montant: "", financement: "En attente" });
    toast("success", `Devis créé pour ${form.clientNom}`);
  }

  return (
    <div>
      {showModal && (
        <Modal title="Nouveau devis" onClose={() => setShowModal(false)}>
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
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Montant (€) *</label>
              <input required type="number" value={form.montant} onChange={e => setForm(f => ({ ...f, montant: e.target.value }))}
                placeholder="25000"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Financement</label>
              <select value={form.financement} onChange={e => setForm(f => ({ ...f, financement: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>En attente</option>
                <option>Crédit Classique</option>
                <option>LOA</option>
                <option>LLD</option>
                <option>Comptant</option>
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn-secondary">Annuler</button>
              <button type="submit" className="flex-1 btn-primary">Créer le devis</button>
            </div>
          </form>
        </Modal>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Ventes</h1>
          <p className="text-sm text-slate-500 mt-0.5">{ventes.length} dossiers actifs</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <FileText size={16} />
          Nouveau devis
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <div className="card p-4">
          <p className="text-xs text-slate-500">Pipeline total</p>
          <p className="text-xl font-bold text-blue-700 mt-1">{formatCurrency(totalEnCours)}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-slate-500">Livré ce mois</p>
          <p className="text-xl font-bold text-emerald-700 mt-1">{formatCurrency(totalLivre)}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-slate-500">Dossiers en cours</p>
          <p className="text-xl font-bold text-slate-900 mt-1">{ventes.filter(v => v.statut !== "livre").length}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-slate-500">Taux conversion</p>
          <p className="text-xl font-bold text-purple-700 mt-1">68%</p>
        </div>
      </div>

      {/* Pipeline progress */}
      <div className="card p-5 mb-5">
        <h2 className="font-semibold text-slate-900 mb-4">Avancement du pipeline</h2>
        <div className="flex items-center gap-2">
          {PIPELINE_STEPS.map((step, i) => {
            const count = ventes.filter(v => v.statut === step).length;
            const config = STATUT_CONFIG[step];
            return (
              <div key={step} className="flex items-center flex-1">
                <div className="flex-1">
                  <div className={cn("rounded-lg p-3 text-center", step === "livre" ? "bg-emerald-50" : "bg-slate-50")}>
                    <p className={`text-lg font-bold ${step === "livre" ? "text-emerald-700" : "text-slate-900"}`}>{count}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{config.label}</p>
                  </div>
                </div>
                {i < PIPELINE_STEPS.length - 1 && <ChevronRight size={20} className="text-slate-300 mx-1 shrink-0" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* View toggle */}
      <div className="flex gap-1 bg-white border border-slate-200 rounded-lg p-1 mb-5 w-fit">
        <button onClick={() => setView("pipeline")} className={cn("px-3 py-1 rounded text-sm font-medium transition-colors", view === "pipeline" ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-50")}>Vue Pipeline</button>
        <button onClick={() => setView("liste")} className={cn("px-3 py-1 rounded text-sm font-medium transition-colors", view === "liste" ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-50")}>Vue Liste</button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400">Chargement…</div>
      ) : ventes.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <FileText size={40} className="mx-auto mb-3 text-slate-300" />
          <p className="font-medium text-slate-500">Aucun dossier de vente</p>
          <p className="text-sm mt-1">Créez votre premier devis avec le bouton ci-dessus</p>
        </div>
      ) : view === "pipeline" ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {PIPELINE_STEPS.map(step => (
            <PipelineColumn
              key={step}
              statut={step}
              items={ventes.filter(v => v.statut === step)}
              onAdd={() => { setShowModal(true); }}
            />
          ))}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {["Client", "Véhicule", "Montant", "Statut", "Financement", "Vendeur", "Date", ""].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-slate-500 uppercase px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ventes.map(v => <VenteRow key={v.id} v={v} />)}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
