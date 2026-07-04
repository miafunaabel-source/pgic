"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Euro, Car, CalendarCheck, TrendingUp, Clock, ChevronRight, Users, ShoppingCart, Wrench } from "lucide-react";
import StatCard from "@/components/ui/StatCard";
import Modal from "@/components/ui/Modal";
import { useToast } from "@/contexts/ToastContext";
import type { Client, Vehicule, Vente, RendezVous } from "@/lib/data";
import { formatCurrency, formatDate } from "@/lib/utils";
import { loadSettings, DEFAULT_SETTINGS } from "@/lib/settings";

const MOIS_LABELS = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Aoû", "Sep", "Oct", "Nov", "Déc"];

function StatusBadge({ statut }: { statut: string }) {
  const map: Record<string, string> = {
    planifie: "bg-blue-100 text-blue-700", en_cours: "bg-amber-100 text-amber-700",
    termine: "bg-emerald-100 text-emerald-700", annule: "bg-red-100 text-red-700",
    devis: "bg-slate-100 text-slate-700", commande: "bg-blue-100 text-blue-700",
    finance: "bg-purple-100 text-purple-700", livre: "bg-emerald-100 text-emerald-700",
  };
  const labels: Record<string, string> = {
    planifie: "Planifié", en_cours: "En cours", termine: "Terminé", annule: "Annulé",
    devis: "Devis", commande: "Commandé", finance: "Financé", livre: "Livré",
  };
  return <span className={`badge ${map[statut] || "bg-gray-100 text-gray-600"}`}>{labels[statut] || statut}</span>;
}

function ProgressBar({ value, max, color = "bg-blue-500" }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.min(Math.round((value / max) * 100), 100) : 0;
  return (
    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function EmptyCard({ icon: Icon, label, cta, onClick }: { icon: React.ElementType; label: string; cta: string; onClick: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <Icon size={32} className="text-slate-200 mb-3" />
      <p className="text-sm text-slate-400">{label}</p>
      <button onClick={onClick} className="mt-3 text-sm text-blue-600 font-medium hover:text-blue-700">{cta}</button>
    </div>
  );
}

type ModalType = "ca" | "stock" | "rdv" | null;

export default function Dashboard() {
  const router = useRouter();
  const toast = useToast();
  const [showNouveauClient, setShowNouveauClient] = useState(false);
  const [clientForm, setClientForm] = useState({ prenom: "", nom: "", email: "", telephone: "" });
  const [creatingClient, setCreatingClient] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  const [clients, setClients] = useState<Client[]>([]);
  const [vehicules, setVehicules] = useState<Vehicule[]>([]);
  const [ventes, setVentes] = useState<Vente[]>([]);
  const [rendezVous, setRendezVous] = useState<RendezVous[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSettings(loadSettings());
    Promise.all([
      fetch("/api/clients").then(r => r.json()).catch(() => []),
      fetch("/api/inventory").then(r => r.json()).catch(() => []),
      fetch("/api/sales").then(r => r.json()).catch(() => []),
      fetch("/api/appointments").then(r => r.json()).catch(() => []),
    ]).then(([c, v, s, rv]) => {
      setClients(Array.isArray(c) ? c : []);
      setVehicules(Array.isArray(v) ? v : []);
      setVentes(Array.isArray(s) ? s : []);
      setRendezVous(Array.isArray(rv) ? rv : []);
      setLoading(false);
    });
  }, []);

  const isNewUser = !loading && clients.length === 0 && vehicules.length === 0 && ventes.length === 0 && rendezVous.length === 0;

  // KPIs computed from real data
  const caVentes = ventes.reduce((s, v) => s + v.montant, 0);
  const stockCount = vehicules.filter(v => v.statut !== "vendu").length;
  const rdvCount = rendezVous.filter(rv => rv.statut !== "annule").length;
  const prospects = clients.filter(c => c.statut === "prospect");

  const caParMois = (() => {
    const acc: Record<string, number> = {};
    ventes.forEach(v => {
      const m = MOIS_LABELS[new Date(v.date).getMonth()];
      acc[m] = (acc[m] ?? 0) + v.montant;
    });
    return MOIS_LABELS.filter(m => acc[m]).map(m => ({ mois: m, ventes: acc[m] }));
  })();

  const stockParType = [
    { name: "Neufs", value: vehicules.filter(v => v.type === "neuf" && v.statut !== "vendu").length, color: "#3b82f6" },
    { name: "Occasions", value: vehicules.filter(v => v.type === "occasion" && v.statut !== "vendu").length, color: "#10b981" },
  ].filter(t => t.value > 0);

  const pctCaMois = settings.caObjectifMensuel > 0 ? Math.round((caVentes / settings.caObjectifMensuel) * 100) : 0;

  const fieldCls = "w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500";

  async function handleNouveauClient(e: React.FormEvent) {
    e.preventDefault();
    setCreatingClient(true);
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clientForm),
      });
      if (!res.ok) { toast("error", "Erreur lors de la création"); return; }
      const newClient: Client = await res.json();
      setClients(prev => [newClient, ...prev]);
      setShowNouveauClient(false);
      setClientForm({ prenom: "", nom: "", email: "", telephone: "" });
      toast("success", `Client ${clientForm.prenom} ${clientForm.nom} créé`);
      setTimeout(() => router.push("/clients"), 800);
    } finally {
      setCreatingClient(false);
    }
  }

  const NouveauClientModal = () => (
    <Modal title="Nouveau client" onClose={() => setShowNouveauClient(false)}>
      <form onSubmit={handleNouveauClient} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Prénom *</label>
            <input required value={clientForm.prenom} onChange={e => setClientForm(f => ({ ...f, prenom: e.target.value }))} className={fieldCls} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Nom *</label>
            <input required value={clientForm.nom} onChange={e => setClientForm(f => ({ ...f, nom: e.target.value }))} className={fieldCls} />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Email *</label>
          <input required type="email" value={clientForm.email} onChange={e => setClientForm(f => ({ ...f, email: e.target.value }))} className={fieldCls} />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Téléphone</label>
          <input value={clientForm.telephone} onChange={e => setClientForm(f => ({ ...f, telephone: e.target.value }))} className={fieldCls} />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => setShowNouveauClient(false)} className="flex-1 btn-secondary">Annuler</button>
          <button type="submit" disabled={creatingClient} className="flex-1 btn-primary">Créer le client</button>
        </div>
      </form>
    </Modal>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isNewUser) {
    return (
      <div>
        {showNouveauClient && <NouveauClientModal />}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-slate-900">Tableau de bord</h1>
          <p className="text-sm text-slate-500 mt-0.5">{settings.nom}</p>
        </div>
        <div className="card p-10 text-center">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Car size={40} className="text-blue-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Votre espace est prêt !</h2>
          <p className="text-slate-500 text-sm max-w-md mx-auto mb-8">
            Commencez par ajouter vos premiers clients, véhicules ou rendez-vous pour voir votre tableau de bord s'animer.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
            <button onClick={() => setShowNouveauClient(true)}
              className="card p-5 text-left hover:shadow-md transition-shadow border-2 border-transparent hover:border-blue-200">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
                <Users size={20} className="text-blue-600" />
              </div>
              <p className="font-semibold text-slate-900">Ajouter un client</p>
              <p className="text-xs text-slate-400 mt-1">Créez votre première fiche client</p>
            </button>
            <button onClick={() => router.push("/inventory")}
              className="card p-5 text-left hover:shadow-md transition-shadow border-2 border-transparent hover:border-emerald-200">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center mb-3">
                <Car size={20} className="text-emerald-600" />
              </div>
              <p className="font-semibold text-slate-900">Ajouter un véhicule</p>
              <p className="text-xs text-slate-400 mt-1">Commencez votre stock</p>
            </button>
            <button onClick={() => router.push("/workshop")}
              className="card p-5 text-left hover:shadow-md transition-shadow border-2 border-transparent hover:border-purple-200">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mb-3">
                <Wrench size={20} className="text-purple-600" />
              </div>
              <p className="font-semibold text-slate-900">Planifier un RDV</p>
              <p className="text-xs text-slate-400 mt-1">Ouvrez votre premier créneau atelier</p>
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-8">Toutes vos données sont privées et accessibles uniquement par votre équipe.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {showNouveauClient && <NouveauClientModal />}

      {/* ── Modal CA ── */}
      {activeModal === "ca" && (
        <Modal title="Chiffre d'Affaires" onClose={() => setActiveModal(null)}>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600">CA total ventes</span>
                <span className="font-semibold">{formatCurrency(caVentes)}</span>
              </div>
              <ProgressBar value={caVentes} max={settings.caObjectifMensuel} color={pctCaMois >= 100 ? "bg-emerald-500" : "bg-blue-500"} />
              <p className="text-xs text-right mt-0.5 text-slate-500">{pctCaMois}% de l'objectif ({formatCurrency(settings.caObjectifMensuel)})</p>
            </div>
            {caParMois.length > 0 ? (
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Par mois</p>
                {caParMois.map(m => (
                  <div key={m.mois} className="flex items-center gap-2 text-sm py-1 border-b border-slate-50 last:border-0">
                    <span className="w-7 font-semibold text-slate-500 shrink-0">{m.mois}</span>
                    <div className="flex-1 h-1.5 bg-blue-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-400 rounded-full" style={{ width: `${Math.min(m.ventes / settings.caObjectifMensuel * 100, 100)}%` }} />
                    </div>
                    <span className="font-bold text-slate-900 w-24 text-right shrink-0">{formatCurrency(m.ventes)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400 text-center py-2">Aucune vente enregistrée</p>
            )}
            <button onClick={() => { setActiveModal(null); router.push("/sales"); }} className="w-full btn-secondary text-sm flex items-center justify-center gap-1">
              Voir toutes les ventes <ChevronRight size={14} />
            </button>
          </div>
        </Modal>
      )}

      {/* ── Modal Stock ── */}
      {activeModal === "stock" && (
        <Modal title="Stock Véhicules" onClose={() => setActiveModal(null)}>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Total", value: stockCount, color: "text-slate-900 bg-slate-50" },
                { label: "Neufs", value: vehicules.filter(v => v.type === "neuf" && v.statut !== "vendu").length, color: "text-blue-700 bg-blue-50" },
                { label: "Occasions", value: vehicules.filter(v => v.type === "occasion" && v.statut !== "vendu").length, color: "text-purple-700 bg-purple-50" },
              ].map(s => (
                <div key={s.label} className={`rounded-xl p-3 text-center ${s.color}`}>
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-xs mt-0.5 opacity-70">{s.label}</p>
                </div>
              ))}
            </div>
            {(["disponible", "reserve", "transit", "vendu"] as Vehicule["statut"][]).map(s => {
              const count = vehicules.filter(v => v.statut === s).length;
              if (count === 0) return null;
              const style: Record<string, string> = { disponible: "bg-emerald-100 text-emerald-700", reserve: "bg-amber-100 text-amber-700", transit: "bg-blue-100 text-blue-700", vendu: "bg-slate-100 text-slate-500" };
              const label: Record<string, string> = { disponible: "Disponibles", reserve: "Réservés", transit: "En transit", vendu: "Vendus" };
              return (
                <div key={s} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                  <span className="text-sm text-slate-700">{label[s]}</span>
                  <span className={`badge ${style[s]}`}>{count} véh.</span>
                </div>
              );
            })}
            {stockCount > 0 && (
              <div className="bg-emerald-50 rounded-lg p-3">
                <p className="text-xs text-slate-500 mb-1">Valeur estimée du stock</p>
                <p className="text-xl font-bold text-emerald-700">{formatCurrency(vehicules.filter(v => v.statut !== "vendu").reduce((s, v) => s + v.prix, 0))}</p>
              </div>
            )}
            <button onClick={() => { setActiveModal(null); router.push("/inventory"); }} className="w-full btn-secondary text-sm flex items-center justify-center gap-1">
              Gérer le stock <ChevronRight size={14} />
            </button>
          </div>
        </Modal>
      )}

      {/* ── Modal RDV ── */}
      {activeModal === "rdv" && (
        <Modal title="Rendez-vous" onClose={() => setActiveModal(null)}>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600">RDV actifs</span>
                <span className="font-semibold">{rdvCount} / {settings.objectifRdvSemaine} objectif</span>
              </div>
              <ProgressBar value={rdvCount} max={settings.objectifRdvSemaine}
                color={rdvCount >= settings.objectifRdvSemaine ? "bg-emerald-500" : "bg-blue-500"} />
            </div>
            {rendezVous.filter(rv => rv.statut !== "annule").length > 0 ? (
              <div className="max-h-48 overflow-y-auto space-y-0">
                {rendezVous.filter(rv => rv.statut !== "annule").slice(0, 8).map(rv => (
                  <div key={rv.id} className="flex items-start gap-3 py-2 border-b border-slate-50 last:border-0">
                    <div className="text-center w-10 shrink-0">
                      <p className="text-xs font-bold text-blue-600">{rv.heure}</p>
                      <p className="text-xs text-slate-400">{rv.date.slice(5).replace("-", "/")}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900">{rv.clientNom}</p>
                      <p className="text-xs text-slate-400 truncate">{rv.vehicule}</p>
                    </div>
                    <StatusBadge statut={rv.statut} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400 text-center py-2">Aucun rendez-vous actif</p>
            )}
            <button onClick={() => { setActiveModal(null); router.push("/workshop"); }} className="w-full btn-secondary text-sm flex items-center justify-center gap-1">
              Planning atelier <ChevronRight size={14} />
            </button>
          </div>
        </Modal>
      )}

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Tableau de bord</h1>
          <p className="text-sm text-slate-500 mt-0.5">{settings.nom}</p>
        </div>
        <button onClick={() => setShowNouveauClient(true)} className="btn-primary">+ Nouveau client</button>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="CA total ventes" value={formatCurrency(caVentes)} change={0}
          icon={Euro} iconColor="text-blue-600" iconBg="bg-blue-50"
          onClick={() => setActiveModal("ca")} />
        <StatCard title="Véhicules en stock" value={`${stockCount} véh.`} change={0}
          icon={Car} iconColor="text-emerald-600" iconBg="bg-emerald-50"
          onClick={() => setActiveModal("stock")} />
        <StatCard title="RDV planifiés" value={`${rdvCount} RDV`} change={0}
          icon={CalendarCheck} iconColor="text-purple-600" iconBg="bg-purple-50"
          onClick={() => setActiveModal("rdv")} />
        <StatCard title="Clients & prospects" value={`${clients.length}`} change={0}
          icon={Users} iconColor="text-amber-600" iconBg="bg-amber-50"
          onClick={() => router.push("/clients")} />
      </div>

      {/* ── Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900">Chiffre d'affaires</h2>
            <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">Ventes par mois</span>
          </div>
          {caParMois.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={caParMois} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="mois" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `${(v / 1000).toFixed(0)}k€`} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Bar dataKey="ventes" name="Ventes" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex flex-col items-center justify-center">
              <TrendingUp size={36} className="text-slate-200 mb-3" />
              <p className="text-sm text-slate-400">Les données CA apparaîtront dès la première vente</p>
              <button onClick={() => router.push("/sales")} className="mt-3 text-sm text-blue-600 font-medium hover:text-blue-700">Créer un devis →</button>
            </div>
          )}
        </div>

        <div className="card p-5">
          <h2 className="font-semibold text-slate-900 mb-4">Répartition stock</h2>
          {stockParType.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={stockParType} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                    {stockParType.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-3">
                {stockParType.map(item => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ background: item.color }} />
                      <span className="text-slate-600">{item.name}</span>
                    </div>
                    <span className="font-semibold text-slate-900">{item.value} véh.</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-[180px] flex flex-col items-center justify-center">
              <Car size={32} className="text-slate-200 mb-3" />
              <p className="text-sm text-slate-400 text-center">Ajoutez des véhicules pour voir la répartition</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900">Leads récents</h2>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">{prospects.length} prospects</span>
          </div>
          {prospects.length > 0 ? (
            <div className="space-y-3">
              {prospects.slice(0, 5).map(c => (
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
          ) : (
            <EmptyCard icon={Users} label="Aucun prospect pour le moment" cta="+ Ajouter un client" onClick={() => setShowNouveauClient(true)} />
          )}
          <button onClick={() => router.push("/clients")} className="w-full mt-3 text-sm text-blue-600 font-medium hover:text-blue-700 text-center">
            Voir tous les clients →
          </button>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900">Derniers RDV</h2>
            <Clock size={16} className="text-slate-400" />
          </div>
          {rendezVous.length > 0 ? (
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
          ) : (
            <EmptyCard icon={CalendarCheck} label="Aucun rendez-vous planifié" cta="→ Planifier un RDV" onClick={() => router.push("/workshop")} />
          )}
          <button onClick={() => router.push("/workshop")} className="w-full mt-3 text-sm text-blue-600 font-medium hover:text-blue-700 text-center">
            Planning complet →
          </button>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900">Ventes en cours</h2>
            <TrendingUp size={16} className="text-emerald-500" />
          </div>
          {ventes.length > 0 ? (
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
          ) : (
            <EmptyCard icon={ShoppingCart} label="Aucune vente en cours" cta="→ Créer un devis" onClick={() => router.push("/sales")} />
          )}
          <button onClick={() => router.push("/sales")} className="w-full mt-3 text-sm text-blue-600 font-medium hover:text-blue-700 text-center">
            Toutes les ventes →
          </button>
        </div>
      </div>
    </div>
  );
}
