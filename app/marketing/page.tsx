"use client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Megaphone, Mail, MessageSquare, Star, TrendingUp, Send, Eye, MousePointerClick } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const campaigns = [
  { id: 1, nom: "Révision été - Clients Peugeot", canal: "Email", envoyes: 145, ouverts: 89, clics: 23, statut: "actif", date: "2026-05-05" },
  { id: 2, nom: "Rappel entretien +30k km", canal: "SMS", envoyes: 78, ouverts: 71, clics: 45, statut: "actif", date: "2026-05-03" },
  { id: 3, nom: "Offre reprise VE – Tesla owners", canal: "Email", envoyes: 42, ouverts: 31, clics: 12, statut: "termine", date: "2026-04-20" },
  { id: 4, nom: "Newsletter mai 2026", canal: "Email", envoyes: 312, ouverts: 198, clics: 67, statut: "planifie", date: "2026-05-15" },
];

const avis = [
  { auteur: "Jean D.", note: 5, texte: "Équipe très professionnelle, livraison dans les délais.", date: "2026-05-08", source: "Google" },
  { auteur: "Marie P.", note: 5, texte: "Super expérience d'achat, je recommande vivement !", date: "2026-05-06", source: "Google" },
  { auteur: "Thomas L.", note: 4, texte: "Bon service, juste un peu d'attente pour la livraison.", date: "2026-05-02", source: "Facebook" },
  { auteur: "Sophie M.", note: 3, texte: "SAV correct mais délai de réponse perfectible.", date: "2026-04-28", source: "Google" },
];

const perfData = [
  { sem: "S18", impressions: 1240, leads: 8 },
  { sem: "S19", impressions: 1580, leads: 12 },
  { sem: "S20", impressions: 2100, leads: 18 },
];

const CANAL_STYLES: Record<string, string> = {
  Email: "bg-blue-100 text-blue-700",
  SMS: "bg-emerald-100 text-emerald-700",
};

const STATUT_STYLES: Record<string, string> = {
  actif: "bg-emerald-100 text-emerald-700",
  planifie: "bg-amber-100 text-amber-700",
  termine: "bg-slate-100 text-slate-500",
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
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Marketing & Digital</h1>
          <p className="text-sm text-slate-500 mt-0.5">Campagnes, avis clients et performance</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
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
          <p className="text-2xl font-bold text-slate-900">2</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-slate-500">Taux d'ouverture moy.</p>
            <Eye size={16} className="text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900">61%</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-slate-500">Note moyenne</p>
            <Star size={16} className="text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900">4.4 / 5</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-slate-500">Leads générés (mai)</p>
            <TrendingUp size={16} className="text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900">18</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Campaigns */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900">Campagnes récentes</h2>
          </div>
          <div className="space-y-3">
            {campaigns.map(c => (
              <div key={c.id} className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`badge ${CANAL_STYLES[c.canal]}`}>{c.canal}</span>
                    <span className={`badge ${STATUT_STYLES[c.statut]}`}>{c.statut === "actif" ? "Actif" : c.statut === "planifie" ? "Planifié" : "Terminé"}</span>
                  </div>
                  <p className="text-sm font-medium text-slate-900 truncate">{c.nom}</p>
                </div>
                <div className="flex gap-4 text-center shrink-0">
                  <div>
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <Send size={10} />
                      <span>{c.envoyes}</span>
                    </div>
                    <p className="text-xs text-slate-400">Envoyés</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                      <Eye size={10} />
                      <span>{Math.round(c.ouverts / c.envoyes * 100)}%</span>
                    </div>
                    <p className="text-xs text-slate-400">Ouvert</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-xs text-blue-600 font-semibold">
                      <MousePointerClick size={10} />
                      <span>{Math.round(c.clics / c.envoyes * 100)}%</span>
                    </div>
                    <p className="text-xs text-slate-400">Clics</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance chart */}
        <div className="card p-5">
          <h2 className="font-semibold text-slate-900 mb-4">Leads / semaine</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={perfData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="sem" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="leads" name="Leads" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Avis clients */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-900">Avis clients récents</h2>
          <div className="flex items-center gap-2">
            <Stars note={4} />
            <span className="text-sm font-semibold text-slate-700">4.4/5</span>
            <span className="text-xs text-slate-400">({avis.length} avis)</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {avis.map((a, i) => (
            <div key={i} className="p-4 bg-slate-50 rounded-xl">
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
              <button className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium">Répondre →</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
