"use client";
import { useState } from "react";
import { Search, Car, Filter, Tag, ChevronRight, Fuel, Gauge, Calendar } from "lucide-react";
import { vehicules, type Vehicule } from "@/lib/data";
import { formatCurrency, cn } from "@/lib/utils";

function StatutBadge({ statut }: { statut: Vehicule["statut"] }) {
  const styles = {
    disponible: "bg-emerald-100 text-emerald-700",
    reserve: "bg-amber-100 text-amber-700",
    transit: "bg-blue-100 text-blue-700",
    vendu: "bg-slate-100 text-slate-500",
  };
  const labels = {
    disponible: "Disponible",
    reserve: "Réservé",
    transit: "En transit",
    vendu: "Vendu",
  };
  return <span className={`badge ${styles[statut]}`}>{labels[statut]}</span>;
}

function TypeBadge({ type }: { type: Vehicule["type"] }) {
  return (
    <span className={`badge ${type === "neuf" ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"}`}>
      {type === "neuf" ? "Neuf" : "Occasion"}
    </span>
  );
}

function VehiculeCard({ v, onClick }: { v: Vehicule; onClick: () => void }) {
  return (
    <div className="card p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <TypeBadge type={v.type} />
        </div>
        <StatutBadge statut={v.statut} />
      </div>
      <div className="flex items-center justify-center bg-slate-50 rounded-lg h-28 mb-3">
        <Car size={48} className="text-slate-300" />
      </div>
      <h3 className="font-semibold text-slate-900">{v.marque} {v.modele}</h3>
      <p className="text-xs text-slate-400 mb-3">{v.couleur}</p>
      <div className="grid grid-cols-3 gap-2 mb-3 text-xs text-slate-500">
        <div className="flex items-center gap-1">
          <Calendar size={11} />
          {v.annee}
        </div>
        <div className="flex items-center gap-1">
          <Gauge size={11} />
          {v.kilometrage > 0 ? `${v.kilometrage.toLocaleString("fr-FR")} km` : "0 km"}
        </div>
        <div className="flex items-center gap-1">
          <Fuel size={11} />
          {v.carburant.split(" ")[0]}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-lg font-bold text-blue-700">{formatCurrency(v.prix)}</p>
        <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">Détails →</button>
      </div>
    </div>
  );
}

function VehiculeDetail({ v, onClose }: { v: Vehicule; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-end">
      <div className="bg-white w-full max-w-md h-full shadow-2xl overflow-y-auto">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-sm">← Retour</button>
          <div className="flex gap-2">
            <button className="btn-secondary text-sm">Publier annonce</button>
            <button className="btn-primary text-sm">Réserver</button>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div className="bg-slate-50 rounded-xl h-44 flex items-center justify-center">
            <Car size={72} className="text-slate-300" />
          </div>
          <div>
            <div className="flex gap-2 mb-2">
              <TypeBadge type={v.type} />
              <StatutBadge statut={v.statut} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">{v.marque} {v.modele}</h2>
            <p className="text-2xl font-bold text-blue-700 mt-1">{formatCurrency(v.prix)}</p>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase mb-3">Caractéristiques</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Année", value: v.annee },
                { label: "Kilométrage", value: `${v.kilometrage.toLocaleString("fr-FR")} km` },
                { label: "Carburant", value: v.carburant },
                { label: "Couleur", value: v.couleur },
                { label: "VIN", value: v.vin },
                { label: "Ref.", value: v.id },
              ].map(({ label, value }) => (
                <div key={label} className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-slate-400">{label}</p>
                  <p className="text-sm font-semibold text-slate-800 mt-0.5">{value}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase mb-3">Actions</h3>
            <div className="space-y-2">
              <button className="w-full btn-primary">Créer un devis de vente</button>
              <button className="w-full btn-secondary">Publier sur portails</button>
              <button className="w-full btn-secondary">Voir historique véhicule</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InventoryPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"tous" | "neuf" | "occasion">("tous");
  const [statutFilter, setStatutFilter] = useState<"tous" | Vehicule["statut"]>("tous");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selected, setSelected] = useState<Vehicule | null>(null);

  const filtered = vehicules.filter(v => {
    const matchSearch = `${v.marque} ${v.modele} ${v.couleur} ${v.carburant}`.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "tous" || v.type === typeFilter;
    const matchStatut = statutFilter === "tous" || v.statut === statutFilter;
    return matchSearch && matchType && matchStatut;
  });

  const stats = {
    total: vehicules.length,
    disponible: vehicules.filter(v => v.statut === "disponible").length,
    reserve: vehicules.filter(v => v.statut === "reserve").length,
    transit: vehicules.filter(v => v.statut === "transit").length,
  };

  return (
    <div>
      {selected && <VehiculeDetail v={selected} onClose={() => setSelected(null)} />}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Stocks Véhicules</h1>
          <p className="text-sm text-slate-500 mt-0.5">{vehicules.length} véhicules en base</p>
        </div>
        <button className="btn-primary">+ Ajouter véhicule</button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { label: "Total stock", value: stats.total, color: "text-slate-900" },
          { label: "Disponibles", value: stats.disponible, color: "text-emerald-700" },
          { label: "Réservés", value: stats.reserve, color: "text-amber-700" },
          { label: "En transit", value: stats.transit, color: "text-blue-700" },
        ].map(({ label, value, color }) => (
          <div key={label} className="card p-4 text-center">
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Marque, modèle, couleur..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-1 bg-white border border-slate-200 rounded-lg p-1">
          {(["tous", "neuf", "occasion"] as const).map(f => (
            <button
              key={f}
              onClick={() => setTypeFilter(f)}
              className={cn("px-3 py-1 rounded text-sm font-medium capitalize transition-colors", typeFilter === f ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-50")}
            >
              {f === "tous" ? "Tous" : f === "neuf" ? "Neufs" : "Occasions"}
            </button>
          ))}
        </div>
        <div className="flex gap-1 bg-white border border-slate-200 rounded-lg p-1">
          {(["tous", "disponible", "reserve", "transit"] as const).map(f => (
            <button
              key={f}
              onClick={() => setStatutFilter(f)}
              className={cn("px-3 py-1 rounded text-xs font-medium transition-colors", statutFilter === f ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-50")}
            >
              {f === "tous" ? "Tous statuts" : f === "disponible" ? "Dispo" : f === "reserve" ? "Réservé" : "Transit"}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map(v => (
          <VehiculeCard key={v.id} v={v} onClick={() => setSelected(v)} />
        ))}
      </div>
      {filtered.length === 0 && (
        <div className="text-center py-16 text-slate-400">Aucun véhicule trouvé</div>
      )}
    </div>
  );
}
