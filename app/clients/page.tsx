"use client";
import { useState } from "react";
import { Search, Filter, Phone, Mail, ChevronRight, Star, Users, UserCheck, UserX } from "lucide-react";
import { clients, type Client } from "@/lib/data";
import { formatDate, formatCurrency, cn } from "@/lib/utils";

function StatutBadge({ statut }: { statut: Client["statut"] }) {
  const styles = {
    client: "bg-emerald-100 text-emerald-700",
    prospect: "bg-blue-100 text-blue-700",
    inactif: "bg-slate-100 text-slate-500",
  };
  const labels = { client: "Client", prospect: "Prospect", inactif: "Inactif" };
  return <span className={`badge ${styles[statut]}`}>{labels[statut]}</span>;
}

function ScoreBar({ score }: { score: number }) {
  const color = score >= 80 ? "bg-emerald-500" : score >= 50 ? "bg-amber-500" : "bg-red-400";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-slate-100 rounded-full h-1.5 w-16">
        <div className={`${color} h-1.5 rounded-full`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs text-slate-500">{score}</span>
    </div>
  );
}

function ClientDetail({ client, onClose }: { client: Client; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-end">
      <div className="bg-white w-full max-w-md h-full shadow-2xl overflow-y-auto">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-sm">← Retour</button>
            <button className="btn-primary">Modifier</button>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center text-xl font-bold text-blue-700">
              {client.prenom[0]}{client.nom[0]}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">{client.prenom} {client.nom}</h2>
              <StatutBadge statut={client.statut} />
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase mb-3">Coordonnées</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-sm">
                <Mail size={14} className="text-slate-400" />
                <span>{client.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone size={14} className="text-slate-400" />
                <span>{client.telephone}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase mb-3">Véhicule actuel</h3>
            <p className="text-sm text-slate-700">{client.vehicule || "Aucun"}</p>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase mb-3">Statistiques</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-500">Valeur totale</p>
                <p className="text-base font-bold text-slate-900">{formatCurrency(client.valeurTotale)}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-500">Score fidélité</p>
                <p className="text-base font-bold text-slate-900">{client.score}/100</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-500">Dernière visite</p>
                <p className="text-sm font-semibold text-slate-900">{formatDate(client.derniereVisite)}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-500">Ville</p>
                <p className="text-sm font-semibold text-slate-900">{client.ville}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase mb-3">Actions rapides</h3>
            <div className="grid grid-cols-2 gap-2">
              <button className="btn-secondary text-center justify-center flex items-center gap-2">
                <Mail size={14} /> Envoyer email
              </button>
              <button className="btn-secondary text-center justify-center flex items-center gap-2">
                <Phone size={14} /> Appeler
              </button>
              <button className="btn-primary text-center justify-center flex items-center gap-2 col-span-2">
                + Nouveau RDV
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ClientsPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"tous" | Client["statut"]>("tous");
  const [selected, setSelected] = useState<Client | null>(null);

  const filtered = clients.filter(c => {
    const matchSearch = `${c.prenom} ${c.nom} ${c.email} ${c.ville}`.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "tous" || c.statut === filter;
    return matchSearch && matchFilter;
  });

  const counts = {
    tous: clients.length,
    client: clients.filter(c => c.statut === "client").length,
    prospect: clients.filter(c => c.statut === "prospect").length,
    inactif: clients.filter(c => c.statut === "inactif").length,
  };

  return (
    <div>
      {selected && <ClientDetail client={selected} onClose={() => setSelected(null)} />}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Clients & CRM</h1>
          <p className="text-sm text-slate-500 mt-0.5">{clients.length} contacts dans la base</p>
        </div>
        <button className="btn-primary">+ Nouveau client</button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un client..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-1 bg-white border border-slate-200 rounded-lg p-1">
          {(["tous", "client", "prospect", "inactif"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-3 py-1 rounded text-sm font-medium capitalize transition-colors",
                filter === f ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-50"
              )}
            >
              {f === "tous" ? "Tous" : f.charAt(0).toUpperCase() + f.slice(1)} ({counts[f]})
            </button>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="card p-4 flex items-center gap-3">
          <Users size={20} className="text-blue-600" />
          <div>
            <p className="text-xs text-slate-500">Total clients</p>
            <p className="text-lg font-bold">{counts.client}</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <UserCheck size={20} className="text-emerald-600" />
          <div>
            <p className="text-xs text-slate-500">Prospects actifs</p>
            <p className="text-lg font-bold">{counts.prospect}</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <UserX size={20} className="text-slate-400" />
          <div>
            <p className="text-xs text-slate-500">Inactifs à relancer</p>
            <p className="text-lg font-bold">{counts.inactif}</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="text-left text-xs font-semibold text-slate-500 uppercase px-5 py-3">Client</th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase px-4 py-3 hidden md:table-cell">Contact</th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase px-4 py-3 hidden lg:table-cell">Véhicule</th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase px-4 py-3">Statut</th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase px-4 py-3 hidden lg:table-cell">Score</th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase px-4 py-3 hidden md:table-cell">Valeur</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.map(client => (
              <tr
                key={client.id}
                className="border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors"
                onClick={() => setSelected(client)}
              >
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-700 shrink-0">
                      {client.prenom[0]}{client.nom[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{client.prenom} {client.nom}</p>
                      <p className="text-xs text-slate-400">{client.ville}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3.5 hidden md:table-cell">
                  <p className="text-xs text-slate-600">{client.email}</p>
                  <p className="text-xs text-slate-400">{client.telephone}</p>
                </td>
                <td className="px-4 py-3.5 hidden lg:table-cell">
                  <p className="text-sm text-slate-600">{client.vehicule}</p>
                  <p className="text-xs text-slate-400">Dernière visite: {formatDate(client.derniereVisite)}</p>
                </td>
                <td className="px-4 py-3.5"><StatutBadge statut={client.statut} /></td>
                <td className="px-4 py-3.5 hidden lg:table-cell"><ScoreBar score={client.score} /></td>
                <td className="px-4 py-3.5 hidden md:table-cell">
                  <p className="text-sm font-semibold text-slate-900">{formatCurrency(client.valeurTotale)}</p>
                </td>
                <td className="px-4 py-3.5">
                  <ChevronRight size={16} className="text-slate-300" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-400">Aucun résultat pour "{search}"</div>
        )}
      </div>
    </div>
  );
}
