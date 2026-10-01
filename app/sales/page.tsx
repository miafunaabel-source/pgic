"use client";
import { useState, useEffect } from "react";
import { ShoppingCart, TrendingUp, FileText, ChevronRight, Printer, X } from "lucide-react";
import type { Vente, Vehicule } from "@/lib/data";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import Modal from "@/components/ui/Modal";
import { useToast } from "@/contexts/ToastContext";
import { useSession } from "next-auth/react";

const STATUT_CONFIG: Record<Vente["statut"], { label: string; style: string; step: number }> = {
  devis:    { label: "Devis",    style: "bg-slate-100 text-slate-700",   step: 1 },
  commande: { label: "Commande", style: "bg-blue-100 text-blue-700",     step: 2 },
  finance:  { label: "Financé",  style: "bg-purple-100 text-purple-700", step: 3 },
  livre:    { label: "Livré",    style: "bg-emerald-100 text-emerald-700", step: 4 },
};

const PIPELINE_STEPS = ["devis", "commande", "finance", "livre"] as Vente["statut"][];

function printDevis(v: Vente) {
  const w = window.open("", "_blank");
  if (!w) return;
  const garage = v.garage || "Garage PGIC";
  const prixHT = Math.round(v.montant / 1.2);
  const tva = v.montant - prixHT;
  w.document.write(`<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>Devis ${v.id}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, sans-serif; font-size: 13px; color: #1e293b; padding: 40px; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; border-bottom: 3px solid #2563eb; padding-bottom: 20px; }
  .logo { font-size: 24px; font-weight: 800; color: #2563eb; }
  .garage { font-size: 12px; color: #64748b; margin-top: 4px; }
  .devis-title { text-align: right; }
  .devis-title h2 { font-size: 20px; font-weight: 700; color: #0f172a; }
  .devis-title p { color: #64748b; font-size: 11px; margin-top: 4px; }
  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
  .info-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; }
  .info-box h3 { font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
  .info-box p { font-size: 13px; font-weight: 600; color: #0f172a; line-height: 1.8; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
  thead tr { background: #1e3a5f; color: white; }
  thead th { padding: 10px 12px; text-align: left; font-size: 11px; font-weight: 600; }
  tbody tr { border-bottom: 1px solid #f1f5f9; }
  tbody td { padding: 12px; font-size: 13px; }
  .totaux { margin-left: auto; width: 260px; }
  .totaux table { margin: 0; }
  .totaux td { padding: 6px 8px; }
  .totaux .label { color: #64748b; }
  .totaux .total-row { font-weight: 700; font-size: 15px; border-top: 2px solid #2563eb; }
  .financement { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 12px; margin-top: 16px; font-size: 12px; }
  .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center; }
  .validity { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 10px 14px; font-size: 12px; color: #166534; margin-top: 16px; }
  @media print { body { padding: 20px; } }
</style>
</head>
<body>
<div class="header">
  <div>
    <div class="logo">${garage}</div>
    <div class="garage">Devis commercial • N° ${v.id}</div>
  </div>
  <div class="devis-title">
    <h2>DEVIS DE VENTE</h2>
    <p>Émis le ${new Date(v.date).toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" })}</p>
    <p>Vendeur : ${v.vendeur}</p>
  </div>
</div>

<div class="info-grid">
  <div class="info-box">
    <h3>Client</h3>
    <p>${v.clientNom}</p>
  </div>
  <div class="info-box">
    <h3>Statut du dossier</h3>
    <p>${STATUT_CONFIG[v.statut].label}</p>
  </div>
</div>

<table>
  <thead>
    <tr>
      <th>Désignation</th>
      <th>Prix HT</th>
      <th>TVA (20%)</th>
      <th>Prix TTC</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>${v.vehicule}</td>
      <td>${prixHT.toLocaleString("fr-FR")} €</td>
      <td>${tva.toLocaleString("fr-FR")} €</td>
      <td><strong>${v.montant.toLocaleString("fr-FR")} €</strong></td>
    </tr>
  </tbody>
</table>

<div class="totaux">
  <table>
    <tr><td class="label">Total HT</td><td>${prixHT.toLocaleString("fr-FR")} €</td></tr>
    <tr><td class="label">TVA 20%</td><td>${tva.toLocaleString("fr-FR")} €</td></tr>
    <tr class="total-row"><td>TOTAL TTC</td><td><strong>${v.montant.toLocaleString("fr-FR")} €</strong></td></tr>
  </table>
</div>

${v.financement !== "En attente" ? `<div class="financement">Mode de financement : <strong>${v.financement}</strong></div>` : ""}

<div class="validity">
  Ce devis est valable 30 jours à compter de sa date d'émission.
</div>

<div class="footer">
  ${garage} — Devis N° ${v.id} — Ce document a valeur de proposition commerciale.<br>
  Généré via PGIC Hub Digital Concessionnaire
</div>

<script>window.print();</script>
</body>
</html>`);
  w.document.close();
}

function VenteDetailModal({ vente, onClose, onUpdate }: {
  vente: Vente;
  onClose: () => void;
  onUpdate: (updated: Vente) => void;
}) {
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    clientNom: vente.clientNom,
    vehicule: vente.vehicule,
    montant: String(vente.montant),
    financement: vente.financement,
    statut: vente.statut,
  });
  const inputCls = "w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500";

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/sales/${vente.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, montant: Number(form.montant) }),
      });
      if (!res.ok) { toast("error", "Erreur lors de la sauvegarde"); return; }
      const updated: Vente = await res.json();
      onUpdate(updated);
      setEditing(false);
      toast("success", "Devis mis à jour");
    } finally {
      setSaving(false);
    }
  }

  const config = STATUT_CONFIG[vente.statut];
  const prixHT = Math.round(vente.montant / 1.2);

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div>
            <h2 className="font-bold text-slate-900 text-lg">Dossier {vente.id}</h2>
            <span className={`badge ${config.style} text-xs mt-1`}>{config.label}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => printDevis(vente)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Printer size={14} /> Imprimer
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {editing ? (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Client</label>
                <input value={form.clientNom} onChange={e => setForm(f => ({ ...f, clientNom: e.target.value }))} className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Véhicule</label>
                <input value={form.vehicule} onChange={e => setForm(f => ({ ...f, vehicule: e.target.value }))} className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Montant TTC (€)</label>
                  <input type="number" value={form.montant} onChange={e => setForm(f => ({ ...f, montant: e.target.value }))} className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Statut</label>
                  <select value={form.statut} onChange={e => setForm(f => ({ ...f, statut: e.target.value as Vente["statut"] }))} className={inputCls}>
                    {PIPELINE_STEPS.map(s => <option key={s} value={s}>{STATUT_CONFIG[s].label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Financement</label>
                <select value={form.financement} onChange={e => setForm(f => ({ ...f, financement: e.target.value }))} className={inputCls}>
                  {["En attente", "Comptant", "Crédit Classique", "LOA", "LLD", "RCI Banque", "PSA Finance", "BNP Paribas PF"].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-slate-500">Client</p>
                  <p className="font-semibold text-slate-900">{vente.clientNom}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">Date</p>
                  <p className="text-sm text-slate-700">{formatDate(vente.date)}</p>
                </div>
              </div>
              <div className="bg-slate-50 rounded-xl p-3">
                <p className="text-xs text-slate-500">Véhicule</p>
                <p className="font-semibold text-slate-900">{vente.vehicule}</p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-blue-50 rounded-xl p-3">
                  <p className="text-xs text-slate-500">Prix TTC</p>
                  <p className="font-bold text-blue-700">{formatCurrency(vente.montant)}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-500">Prix HT</p>
                  <p className="font-semibold text-slate-700">{formatCurrency(prixHT)}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs text-slate-500">Financement</p>
                  <p className="text-xs font-semibold text-slate-700">{vente.financement}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-xs text-slate-500">Vendeur :</p>
                <p className="text-sm text-slate-700">{vente.vendeur}</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 p-5 border-t border-slate-100">
          {editing ? (
            <>
              <button onClick={() => setEditing(false)} className="flex-1 btn-secondary">Annuler</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 btn-primary">
                {saving ? "Sauvegarde…" : "Sauvegarder"}
              </button>
            </>
          ) : (
            <>
              <button onClick={() => printDevis(vente)} className="flex-1 flex items-center justify-center gap-2 btn-secondary">
                <Printer size={14} /> Imprimer le devis
              </button>
              <button onClick={() => setEditing(true)} className="flex-1 btn-primary">Modifier</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function PipelineColumn({ statut, items, onAdd, onSelect }: {
  statut: Vente["statut"];
  items: Vente[];
  onAdd: () => void;
  onSelect: (v: Vente) => void;
}) {
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
          <div key={v.id} onClick={() => onSelect(v)} className="card p-4 cursor-pointer hover:shadow-md transition-shadow">
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

export default function SalesPage() {
  const { data: session } = useSession();
  const toast = useToast();
  const [ventes, setVentes] = useState<Vente[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"pipeline" | "liste">("pipeline");
  const [showModal, setShowModal] = useState(false);
  const [selectedVente, setSelectedVente] = useState<Vente | null>(null);
  const [stockVehicules, setStockVehicules] = useState<Vehicule[]>([]);
  const [selectedVehiculeId, setSelectedVehiculeId] = useState("");
  const [form, setForm] = useState({ clientNom: "", vehicule: "", montant: "", financement: "En attente" });

  const garage = (session?.user as any)?.company?.concession ?? "Mon Garage";

  useEffect(() => {
    fetch("/api/sales").then(r => r.json()).then(data => {
      setVentes(Array.isArray(data) ? data : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (showModal) {
      fetch("/api/inventory").then(r => r.json()).then(data => {
        setStockVehicules(Array.isArray(data) ? data.filter((v: Vehicule) => v.statut !== "vendu") : []);
      }).catch(() => {});
    }
  }, [showModal]);

  const totalEnCours = ventes.filter(v => v.statut !== "livre").reduce((s, v) => s + v.montant, 0);
  const totalLivre = ventes.filter(v => v.statut === "livre").reduce((s, v) => s + v.montant, 0);

  function handleVehiculeSelect(id: string) {
    setSelectedVehiculeId(id);
    const v = stockVehicules.find(v => v.id === id);
    if (v) {
      setForm(f => ({
        ...f,
        vehicule: `${v.marque} ${v.modele} ${v.annee}`,
        montant: String(v.prix),
      }));
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, montant: Number(form.montant), garage }),
    });
    if (!res.ok) { toast("error", "Erreur lors de la création"); return; }
    const newVente: Vente = await res.json();
    setVentes(prev => [newVente, ...prev]);
    setShowModal(false);
    setForm({ clientNom: "", vehicule: "", montant: "", financement: "En attente" });
    setSelectedVehiculeId("");
    toast("success", `Devis créé pour ${form.clientNom}`);
  }

  const inputCls = "w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div>
      {selectedVente && (
        <VenteDetailModal
          vente={selectedVente}
          onClose={() => setSelectedVente(null)}
          onUpdate={updated => {
            setVentes(prev => prev.map(v => v.id === updated.id ? updated : v));
            setSelectedVente(updated);
          }}
        />
      )}

      {showModal && (
        <Modal title="Nouveau devis" onClose={() => { setShowModal(false); setSelectedVehiculeId(""); }}>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Véhicule du stock</label>
              <select
                value={selectedVehiculeId}
                onChange={e => handleVehiculeSelect(e.target.value)}
                className={inputCls}
              >
                <option value="">— Choisir un véhicule du stock —</option>
                {stockVehicules.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.marque} {v.modele} {v.annee} — {formatCurrency(v.prix)} ({v.statut === "reserve" ? "Réservé" : "Disponible"})
                  </option>
                ))}
                <option value="custom">Autre véhicule (saisir manuellement)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Véhicule *</label>
              <input required value={form.vehicule} onChange={e => setForm(f => ({ ...f, vehicule: e.target.value }))}
                placeholder="Marque Modèle Année"
                className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Client *</label>
              <input required value={form.clientNom} onChange={e => setForm(f => ({ ...f, clientNom: e.target.value }))}
                placeholder="Nom du client"
                className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Montant TTC (€) *</label>
              <input required type="number" value={form.montant} onChange={e => setForm(f => ({ ...f, montant: e.target.value }))}
                placeholder="25000"
                className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Financement</label>
              <select value={form.financement} onChange={e => setForm(f => ({ ...f, financement: e.target.value }))} className={inputCls}>
                <option>En attente</option>
                <option>Comptant</option>
                <option>Crédit Classique</option>
                <option>LOA</option>
                <option>LLD</option>
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => { setShowModal(false); setSelectedVehiculeId(""); }} className="flex-1 btn-secondary">Annuler</button>
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
          <p className="text-xl font-bold text-purple-700 mt-1">
            {ventes.length > 0 ? `${Math.round(ventes.filter(v => v.statut === "livre").length / ventes.length * 100)}%` : "—"}
          </p>
        </div>
      </div>

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
              onAdd={() => setShowModal(true)}
              onSelect={setSelectedVente}
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
              {ventes.map(v => {
                const config = STATUT_CONFIG[v.statut];
                return (
                  <tr key={v.id} onClick={() => setSelectedVente(v)} className="border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors">
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
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
