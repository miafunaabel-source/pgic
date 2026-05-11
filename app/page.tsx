"use client";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Euro, Car, CalendarCheck, Star, Users, TrendingUp, AlertCircle, Clock } from "lucide-react";
import StatCard from "@/components/ui/StatCard";
import { kpiData, clients, vehicules, rendezVous, ventes } from "@/lib/data";
import { formatCurrency, formatDate } from "@/lib/utils";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

function StatusBadge({ statut }: { statut: string }) {
  const map: Record<string, string> = {
    planifie: "bg-blue-100 text-blue-700",
    en_cours: "bg-amber-100 text-amber-700",
    termine: "bg-emerald-100 text-emerald-700",
    annule: "bg-red-100 text-red-700",
    devis: "bg-slate-100 text-slate-700",
    commande: "bg-blue-100 text-blue-700",
    finance: "bg-purple-100 text-purple-700",
    livre: "bg-emerald-100 text-emerald-700",
    disponible: "bg-emerald-100 text-emerald-700",
    reserve: "bg-amber-100 text-amber-700",
    transit: "bg-blue-100 text-blue-700",
    vendu: "bg-slate-100 text-slate-600",
  };
  const labels: Record<string, string> = {
    planifie: "Planifié", en_cours: "En cours", termine: "Terminé", annule: "Annulé",
    devis: "Devis", commande: "Commandé", finance: "Financé", livre: "Livré",
    disponible: "Disponible", reserve: "Réservé", transit: "En transit", vendu: "Vendu",
  };
  return (
    <span className={`badge ${map[statut] || "bg-gray-100 text-gray-600"}`}>
      {labels[statut] || statut}
    </span>
  );
}

export default function Dashboard() {
  const variation = Math.round(((kpiData.venteMois - kpiData.venteMoisPrev) / kpiData.venteMoisPrev) * 100);
  const rdvAujourdhui = rendezVous.filter(r => r.date === "2026-05-10");
  const alertesStock = vehicules.filter(v => v.statut === "disponible" && v.type === "neuf").length;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Tableau de bord</h1>
          <p className="text-sm text-slate-500 mt-0.5">Samedi 10 mai 2026 — Concession Lyon Centre</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary flex items-center gap-2">
            <AlertCircle size={15} />
            5 alertes
          </button>
          <button className="btn-primary">+ Nouveau client</button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="CA Ventes (mai)"
          value={formatCurrency(kpiData.venteMois)}
          change={variation}
          icon={Euro}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
        />
        <StatCard
          title="Véhicules en stock"
          value={`${kpiData.vehiculesStock} véh.`}
          change={-4}
          icon={Car}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
        />
        <StatCard
          title="RDV cette semaine"
          value={`${kpiData.rdvSemaine} RDV`}
          change={8}
          icon={CalendarCheck}
          iconColor="text-purple-600"
          iconBg="bg-purple-50"
        />
        <StatCard
          title="Satisfaction client"
          value={`${kpiData.tauxSatisfaction}%`}
          change={2}
          icon={Star}
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Revenue chart */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900">Chiffre d'affaires 2026</h2>
            <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">Ventes + Atelier</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={kpiData.chiffreAffaireAnnuel} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="mois" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k€`} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Legend />
              <Bar dataKey="ventes" name="Ventes" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="atelier" name="Atelier" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Stock donut */}
        <div className="card p-5">
          <h2 className="font-semibold text-slate-900 mb-4">Répartition stock</h2>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={kpiData.stockParType} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                {kpiData.stockParType.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-3">
            {kpiData.stockParType.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ background: item.color }} />
                  <span className="text-slate-600">{item.name}</span>
                </div>
                <span className="font-semibold text-slate-900">{item.value} véh.</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent leads */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900">Leads récents</h2>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">{kpiData.leadsNouveaux} nouveaux</span>
          </div>
          <div className="space-y-3">
            {clients.filter(c => c.statut === "prospect").map(c => (
              <div key={c.id} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
                <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-xs font-bold text-slate-600">
                  {c.prenom[0]}{c.nom[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900">{c.prenom} {c.nom}</p>
                  <p className="text-xs text-slate-400">{c.ville} · {formatDate(c.derniereVisite)}</p>
                </div>
                <div className={`w-2 h-2 rounded-full ${c.score > 50 ? "bg-emerald-400" : "bg-amber-400"}`} />
              </div>
            ))}
          </div>
          <button className="w-full mt-3 text-sm text-blue-600 font-medium hover:text-blue-700 text-center">Voir tous les leads →</button>
        </div>

        {/* Today's appointments */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900">RDV aujourd'hui</h2>
            <Clock size={16} className="text-slate-400" />
          </div>
          <div className="space-y-3">
            {rendezVous.slice(0, 4).map(rv => (
              <div key={rv.id} className="flex items-start gap-3">
                <div className="text-center min-w-[40px]">
                  <p className="text-xs font-bold text-blue-600">{rv.heure}</p>
                </div>
                <div className="flex-1 border-l-2 border-slate-100 pl-3">
                  <p className="text-sm font-medium text-slate-900">{rv.clientNom}</p>
                  <p className="text-xs text-slate-400">{rv.vehicule}</p>
                  <StatusBadge statut={rv.statut} />
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-3 text-sm text-blue-600 font-medium hover:text-blue-700 text-center">Planning complet →</button>
        </div>

        {/* Recent sales */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900">Ventes en cours</h2>
            <TrendingUp size={16} className="text-emerald-500" />
          </div>
          <div className="space-y-3">
            {ventes.slice(0, 4).map(v => (
              <div key={v.id} className="flex items-start gap-3 py-2 border-b border-slate-50 last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900">{v.clientNom}</p>
                  <p className="text-xs text-slate-400 truncate">{v.vehicule}</p>
                  <p className="text-xs font-semibold text-slate-700 mt-0.5">{formatCurrency(v.montant)}</p>
                </div>
                <StatusBadge statut={v.statut} />
              </div>
            ))}
          </div>
          <button className="w-full mt-3 text-sm text-blue-600 font-medium hover:text-blue-700 text-center">Toutes les ventes →</button>
        </div>
      </div>
    </div>
  );
}
