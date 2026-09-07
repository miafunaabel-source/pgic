"use client";
import { useState, useEffect } from "react";
import {
  FileText, Search, Upload, Download, Eye, Trash2,
  FileSignature, Receipt, ClipboardList, Car, Filter,
  CheckCircle, Clock, AlertCircle, X, Plus, FolderOpen, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

type DocType = "contrat" | "facture" | "bon_commande" | "carte_grise" | "procuration" | "autre";
type DocStatus = "signe" | "en_attente" | "brouillon";

interface Document {
  id: string;
  nom: string;
  type: DocType;
  status: DocStatus;
  client: string;
  vehicule?: string;
  date: string;
  taille: string;
  ajoutePar: string;
}

const TYPE_LABELS: Record<DocType, string> = {
  contrat: "Contrat de vente",
  facture: "Facture",
  bon_commande: "Bon de commande",
  carte_grise: "Carte grise",
  procuration: "Procuration",
  autre: "Autre",
};

const TYPE_ICONS: Record<DocType, typeof FileText> = {
  contrat: FileSignature,
  facture: Receipt,
  bon_commande: ClipboardList,
  carte_grise: Car,
  procuration: FileText,
  autre: FolderOpen,
};

const TYPE_COLORS: Record<DocType, string> = {
  contrat: "bg-blue-100 text-blue-700",
  facture: "bg-emerald-100 text-emerald-700",
  bon_commande: "bg-orange-100 text-orange-700",
  carte_grise: "bg-purple-100 text-purple-700",
  procuration: "bg-pink-100 text-pink-700",
  autre: "bg-slate-100 text-slate-600",
};

const STATUS_CONFIG: Record<DocStatus, { label: string; color: string; Icon: typeof CheckCircle }> = {
  signe: { label: "Signé", color: "bg-emerald-100 text-emerald-700", Icon: CheckCircle },
  en_attente: { label: "En attente", color: "bg-amber-100 text-amber-700", Icon: Clock },
  brouillon: { label: "Brouillon", color: "bg-slate-100 text-slate-500", Icon: AlertCircle },
};

function UploadModal({ onClose, onSaved }: { onClose: () => void; onSaved: (doc: Document) => void }) {
  const [step, setStep] = useState<"form" | "done">("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ client: "", type: "contrat" as DocType, vehicule: "", nom: "" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const nomFichier = form.nom || `${TYPE_LABELS[form.type]}_${form.client.replace(/\s+/g, "_")}.pdf`;
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nom: nomFichier, type: form.type, client: form.client, vehicule: form.vehicule }),
      });
      if (!res.ok) { setError("Erreur lors de l'enregistrement."); return; }
      const doc = await res.json();
      onSaved(doc);
      setStep("done");
    } catch {
      setError("Erreur réseau.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="font-semibold text-slate-900">Ajouter un document</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
        </div>

        {step === "form" ? (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Client *</label>
              <input
                required value={form.client} onChange={e => setForm({ ...form, client: e.target.value })}
                placeholder="Nom du client"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Type de document *</label>
              <select
                value={form.type} onChange={e => setForm({ ...form, type: e.target.value as DocType })}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Véhicule concerné</label>
              <input
                value={form.vehicule} onChange={e => setForm({ ...form, vehicule: e.target.value })}
                placeholder="ex. Peugeot 308 2024"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nom du fichier</label>
              <input
                value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })}
                placeholder="Généré automatiquement si vide"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer">
              <Upload size={24} className="text-slate-400 mx-auto mb-2" />
              <p className="text-sm text-slate-500">Glissez un fichier ici ou <span className="text-blue-600 font-medium">parcourir</span></p>
              <p className="text-xs text-slate-400 mt-1">PDF, DOCX, JPEG — max 20 Mo</p>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="flex-1 border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50">
                Annuler
              </button>
              <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2">
                {loading && <Loader2 size={14} className="animate-spin" />}
                Enregistrer
              </button>
            </div>
          </form>
        ) : (
          <div className="p-8 text-center">
            <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={28} className="text-emerald-600" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-1">Document ajouté</h3>
            <p className="text-sm text-slate-500 mb-6">Le document a été enregistré dans le dossier client.</p>
            <button onClick={onClose} className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
              Fermer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DocumentsPage() {
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<DocType | "all">("all");
  const [filterStatus, setFilterStatus] = useState<DocStatus | "all">("all");
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    fetch("/api/documents")
      .then(r => r.ok ? r.json() : [])
      .then(data => setDocs(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Supprimer ce document ?")) return;
    await fetch(`/api/documents/${id}`, { method: "DELETE" });
    setDocs(prev => prev.filter(d => d.id !== id));
  }

  async function handleStatusChange(id: string, status: DocStatus) {
    const res = await fetch(`/api/documents/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const updated = await res.json();
      setDocs(prev => prev.map(d => d.id === id ? updated : d));
    }
  }

  const filtered = docs.filter(d => {
    const matchSearch = d.client.toLowerCase().includes(search.toLowerCase()) ||
      d.nom.toLowerCase().includes(search.toLowerCase()) ||
      (d.vehicule?.toLowerCase().includes(search.toLowerCase()) ?? false);
    const matchType = filterType === "all" || d.type === filterType;
    const matchStatus = filterStatus === "all" || d.status === filterStatus;
    return matchSearch && matchType && matchStatus;
  });

  const stats = {
    total: docs.length,
    signes: docs.filter(d => d.status === "signe").length,
    enAttente: docs.filter(d => d.status === "en_attente").length,
    brouillons: docs.filter(d => d.status === "brouillon").length,
  };

  return (
    <div className="space-y-6">
      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onSaved={doc => { setDocs(prev => [doc, ...prev]); setShowUpload(false); }}
        />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Documents Clients</h1>
          <p className="text-slate-500 text-sm mt-0.5">Contrats, factures et pièces administratives</p>
        </div>
        <button
          onClick={() => setShowUpload(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
        >
          <Plus size={16} /> Ajouter un document
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total documents", value: stats.total, color: "text-slate-900", bg: "bg-white" },
          { label: "Signés", value: stats.signes, color: "text-emerald-700", bg: "bg-emerald-50" },
          { label: "En attente", value: stats.enAttente, color: "text-amber-700", bg: "bg-amber-50" },
          { label: "Brouillons", value: stats.brouillons, color: "text-slate-500", bg: "bg-slate-50" },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-xl p-4 border border-slate-100`}>
            <p className="text-xs text-slate-500 font-medium">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-100 p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un client, document, véhicule…"
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={15} className="text-slate-400" />
          <select
            value={filterType} onChange={e => setFilterType(e.target.value as DocType | "all")}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="all">Tous les types</option>
            {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <select
            value={filterStatus} onChange={e => setFilterStatus(e.target.value as DocStatus | "all")}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="all">Tous les statuts</option>
            <option value="signe">Signé</option>
            <option value="en_attente">En attente</option>
            <option value="brouillon">Brouillon</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={24} className="animate-spin text-blue-500" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-5 py-3 font-semibold text-slate-600">Document</th>
                  <th className="text-left px-5 py-3 font-semibold text-slate-600">Client</th>
                  <th className="text-left px-5 py-3 font-semibold text-slate-600">Véhicule</th>
                  <th className="text-left px-5 py-3 font-semibold text-slate-600">Type</th>
                  <th className="text-left px-5 py-3 font-semibold text-slate-600">Statut</th>
                  <th className="text-left px-5 py-3 font-semibold text-slate-600">Date</th>
                  <th className="text-left px-5 py-3 font-semibold text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400">
                      <FileText size={32} className="mx-auto mb-2 opacity-30" />
                      {docs.length === 0 ? "Aucun document enregistré" : "Aucun document trouvé"}
                    </td>
                  </tr>
                ) : filtered.map(doc => {
                  const TypeIcon = TYPE_ICONS[doc.type];
                  const status = STATUS_CONFIG[doc.status];
                  const StatusIcon = status.Icon;
                  return (
                    <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                            <TypeIcon size={15} className="text-slate-500" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900 leading-tight truncate max-w-44">{doc.nom}</p>
                            <p className="text-xs text-slate-400">{doc.taille} · {doc.ajoutePar}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 font-medium text-slate-800">{doc.client}</td>
                      <td className="px-5 py-3.5 text-slate-600 text-xs">{doc.vehicule ?? "—"}</td>
                      <td className="px-5 py-3.5">
                        <span className={cn("text-xs font-medium px-2 py-1 rounded-full", TYPE_COLORS[doc.type])}>
                          {TYPE_LABELS[doc.type]}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <select
                          value={doc.status}
                          onChange={e => handleStatusChange(doc.id, e.target.value as DocStatus)}
                          className={cn("text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500", status.color)}
                        >
                          <option value="brouillon">Brouillon</option>
                          <option value="en_attente">En attente</option>
                          <option value="signe">Signé</option>
                        </select>
                      </td>
                      <td className="px-5 py-3.5 text-slate-500 text-xs">
                        {new Date(doc.date).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1">
                          <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Voir">
                            <Eye size={15} />
                          </button>
                          <button className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Télécharger">
                            <Download size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(doc.id)}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-slate-100 text-xs text-slate-400">
            {filtered.length} document{filtered.length > 1 ? "s" : ""} affiché{filtered.length > 1 ? "s" : ""}
          </div>
        )}
      </div>
    </div>
  );
}
