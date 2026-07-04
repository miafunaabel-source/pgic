"use client";
import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Megaphone, Mail, Star, TrendingUp, Send, Eye, MousePointerClick, Play, Square, Trash2, Loader2, MessageSquare, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import Modal from "@/components/ui/Modal";
import { useToast } from "@/contexts/ToastContext";
import type { Campaign, Avis } from "@/lib/data";

const CANAL_STYLES: Record<string, string> = {
  Email: "bg-blue-100 text-blue-700",
  SMS:   "bg-emerald-100 text-emerald-700",
};
const STATUT_STYLES: Record<string, string> = {
  actif:    "bg-emerald-100 text-emerald-700",
  planifie: "bg-amber-100 text-amber-700",
  termine:  "bg-slate-100 text-slate-500",
};
const STATUT_LABELS: Record<string, string> = {
  actif:    "Actif",
  planifie: "Planifié",
  termine:  "Terminé",
};

function Stars({ note }: { note: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={12} className={i <= note ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200"} />
      ))}
    </div>
  );
}

export default function MarketingPage() {
  const toast = useToast();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [avis, setAvis] = useState<Avis[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ nom: "", canal: "Email", cible: "" });
  const [submitting, setSubmitting] = useState(false);
  const [repondreId, setRepondreId] = useState<string | null>(null);
  const [reponse, setReponse] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/marketing/campaigns").then(r => r.json()),
      fetch("/api/marketing/avis").then(r => r.json()),
    ]).then(([camps, av]) => {
      setCampaigns(Array.isArray(camps) ? camps : []);
      setAvis(Array.isArray(av) ? av : []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const activeCampaigns = campaigns.filter(c => c.statut === "actif");
  const avgOpenRate = activeCampaigns.length === 0 ? 0
    : Math.round(activeCampaigns.filter(c => c.envoyes > 0).reduce((s, c) => s + c.ouverts / c.envoyes, 0)
      / activeCampaigns.filter(c => c.envoyes > 0).length * 100) || 0;
  const avgNote = avis.length === 0 ? 0
    : Math.round(avis.reduce((s, a) => s + a.note, 0) / avis.length * 10) / 10;
  const totalClics = campaigns.reduce((s, c) => s + c.clics, 0);

  const perfData = [
    { sem: "S-4", leads: Math.round(totalClics * 0.18) },
    { sem: "S-3", leads: Math.round(totalClics * 0.24) },
    { sem: "S-2", leads: Math.round(totalClics * 0.31) },
    { sem: "S-1", leads: Math.round(totalClics * 0.27) },
  ];

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/marketing/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) { toast("error", "Erreur lors de la création"); return; }
      const newCampaign: Campaign = await res.json();
      setCampaigns(prev => [newCampaign, ...prev]);
      setShowModal(false);
      setForm({ nom: "", canal: "Email", cible: "" });
      toast("success", `Campagne "${newCampaign.nom}" créée`);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLancer(c: Campaign) {
    const res = await fetch(`/api/marketing/campaigns/${c.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ statut: "actif", cible: c.cible, canal: c.canal }),
    });
    if (!res.ok) { toast("error", "Erreur lors du lancement"); return; }
    const updated: Campaign = await res.json();
    setCampaigns(prev => prev.map(x => x.id === c.id ? updated : x));
    toast("success", `"${c.nom}" lancée — ${updated.envoyes} destinataires`);
  }

  async function handleTerminer(c: Campaign) {
    const res = await fetch(`/api/marketing/campaigns/${c.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ statut: "termine" }),
    });
    if (!res.ok) { toast("error", "Erreur"); return; }
    const updated: Campaign = await res.json();
    setCampaigns(prev => prev.map(x => x.id === c.id ? updated : x));
    toast("info", `Campagne "${c.nom}" terminée`);
  }

  async function handleSupprimer(c: Campaign) {
    const res = await fetch(`/api/marketing/campaigns/${c.id}`, { method: "DELETE" });
    if (!res.ok) { toast("error", "Erreur lors de la suppression"); return; }
    setCampaigns(prev => prev.filter(x => x.id !== c.id));
    toast("info", "Campagne supprimée");
  }

  async function handleReponse(e: React.FormEvent) {
    e.preventDefault();
    if (!repondreId) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/marketing/avis/${repondreId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reponse }),
      });
      if (!res.ok) { toast("error", "Erreur lors de l'envoi"); return; }
      const updated: Avis = await res.json();
      setAvis(prev => prev.map(a => a.id === repondreId ? updated : a));
      setRepondreId(null);
      setReponse("");
      toast("success", "Réponse publiée");
    } finally {
      setSubmitting(false);
    }
  }

  const avisSelected = avis.find(a => a.id === repondreId);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div>
      {showModal && (
        <Modal title="Nouvelle campagne" onClose={() => setShowModal(false)}>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Nom de la campagne *</label>
              <input required value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))}
                placeholder="Ex: Promotion été 2026"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Canal</label>
              <div className="flex gap-3">
                {["Email", "SMS"].map(c => (
                  <label key={c} className={cn("flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border-2 cursor-pointer transition-colors text-sm font-medium",
                    form.canal === c ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600 hover:border-slate-300")}>
                    <input type="radio" name="canal" value={c} checked={form.canal === c} onChange={() => setForm(f => ({ ...f, canal: c }))} className="sr-only" />
                    {c === "Email" ? <Mail size={15} /> : <Send size={15} />}
                    {c}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Cible clients</label>
              <select value={form.cible} onChange={e => setForm(f => ({ ...f, cible: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Tous les clients</option>
                <option value="prospect">Prospects uniquement</option>
                <option value="inactif">Clients inactifs</option>
                <option value="recent">Clients récents (30j)</option>
                <option value="peugeot">Propriétaires Peugeot</option>
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn-secondary">Annuler</button>
              <button type="submit" disabled={submitting} className="flex-1 btn-primary flex items-center justify-center gap-2">
                {submitting && <Loader2 size={14} className="animate-spin" />}
                Créer
              </button>
            </div>
          </form>
        </Modal>
      )}

      {repondreId && avisSelected && (
        <Modal title="Répondre à l'avis" onClose={() => { setRepondreId(null); setReponse(""); }}>
          <div className="mb-4 p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Stars note={avisSelected.note} />
              <span className="text-sm font-semibold text-slate-700">{avisSelected.auteur}</span>
            </div>
            <p className="text-sm text-slate-600 italic">"{avisSelected.texte}"</p>
          </div>
          <form onSubmit={handleReponse} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Votre réponse *</label>
              <textarea required value={reponse} onChange={e => setReponse(e.target.value)}
                rows={4} placeholder="Bonjour, merci pour votre avis..."
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => { setRepondreId(null); setReponse(""); }} className="flex-1 btn-secondary">Annuler</button>
              <button type="submit" disabled={submitting} className="flex-1 btn-primary flex items-center justify-center gap-2">
                {submitting && <Loader2 size={14} className="animate-spin" />}
                Publier
              </button>
            </div>
          </form>
        </Modal>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Marketing & Digital</h1>
          <p className="text-sm text-slate-500 mt-0.5">Campagnes, avis clients et performance</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Send size={16} />
          Nouvelle campagne
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-slate-500">Campagnes actives</p>
            <Megaphone size={16} className="text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{activeCampaigns.length}</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-slate-500">Taux d'ouverture moy.</p>
            <Eye size={16} className="text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {activeCampaigns.some(c => c.envoyes > 0) ? `${avgOpenRate}%` : "—"}
          </p>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-slate-500">Note moyenne</p>
            <Star size={16} className="text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{avis.length > 0 ? `${avgNote} / 5` : "—"}</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-slate-500">Leads (clics cumulés)</p>
            <TrendingUp size={16} className="text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{totalClics > 0 ? totalClics : "—"}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Campaigns */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900">Campagnes</h2>
            <span className="text-xs text-slate-400">{campaigns.length} au total</span>
          </div>

          {campaigns.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <Megaphone size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Aucune campagne. Créez-en une pour commencer.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {campaigns.map(c => (
                <div key={c.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors group">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`badge ${CANAL_STYLES[c.canal]}`}>{c.canal}</span>
                      <span className={`badge ${STATUT_STYLES[c.statut]}`}>{STATUT_LABELS[c.statut]}</span>
                    </div>
                    <p className="text-sm font-medium text-slate-900 truncate">{c.nom}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{c.date}</p>
                  </div>

                  {c.envoyes > 0 && (
                    <div className="flex gap-3 text-center shrink-0">
                      <div>
                        <div className="flex items-center gap-1 text-xs font-semibold text-slate-700">
                          <Send size={10} />{c.envoyes}
                        </div>
                        <p className="text-xs text-slate-400">Envoyés</p>
                      </div>
                      <div>
                        <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
                          <Eye size={10} />{Math.round(c.ouverts / c.envoyes * 100)}%
                        </div>
                        <p className="text-xs text-slate-400">Ouvert</p>
                      </div>
                      <div>
                        <div className="flex items-center gap-1 text-xs font-semibold text-blue-600">
                          <MousePointerClick size={10} />{Math.round(c.clics / c.envoyes * 100)}%
                        </div>
                        <p className="text-xs text-slate-400">Clics</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    {c.statut === "planifie" && (
                      <button onClick={() => handleLancer(c)} title="Lancer"
                        className="p-1.5 rounded-lg hover:bg-emerald-100 text-emerald-600 transition-colors">
                        <Play size={14} />
                      </button>
                    )}
                    {c.statut === "actif" && (
                      <button onClick={() => handleTerminer(c)} title="Terminer"
                        className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 transition-colors">
                        <Square size={14} />
                      </button>
                    )}
                    {c.statut === "termine" && (
                      <button onClick={() => handleSupprimer(c)} title="Supprimer"
                        className="p-1.5 rounded-lg hover:bg-red-100 text-red-500 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Performance chart */}
        <div className="card p-5">
          <h2 className="font-semibold text-slate-900 mb-4">Leads / semaine</h2>
          {totalClics === 0 ? (
            <div className="flex items-center justify-center h-44 text-slate-300">
              <TrendingUp size={32} />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={perfData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="sem" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="leads" name="Leads" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Avis clients */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-900">Avis clients récents</h2>
          {avis.length > 0 && (
            <div className="flex items-center gap-2">
              <Stars note={Math.round(avgNote)} />
              <span className="text-sm font-semibold text-slate-700">{avgNote}/5</span>
              <span className="text-xs text-slate-400">({avis.length} avis)</span>
            </div>
          )}
        </div>

        {avis.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <Star size={28} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">Aucun avis client pour le moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {avis.map(a => (
              <div key={a.id} className="p-4 bg-slate-50 rounded-xl">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{a.auteur}</p>
                    <Stars note={a.note} />
                  </div>
                  <div className="text-right">
                    <span className="text-xs bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-500">{a.source}</span>
                    <p className="text-xs text-slate-400 mt-1">{a.date}</p>
                  </div>
                </div>
                <p className="text-sm text-slate-600 italic">"{a.texte}"</p>
                {a.reponse ? (
                  <div className="mt-3 pl-3 border-l-2 border-blue-200">
                    <div className="flex items-center gap-1 mb-1">
                      <CheckCircle size={11} className="text-blue-500" />
                      <span className="text-xs font-medium text-blue-600">Réponse publiée</span>
                    </div>
                    <p className="text-xs text-slate-600">{a.reponse}</p>
                  </div>
                ) : (
                  <button onClick={() => { setRepondreId(a.id); setReponse(""); }}
                    className="mt-2 flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium">
                    <MessageSquare size={11} /> Répondre
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
