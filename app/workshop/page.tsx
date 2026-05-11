"use client";
import { useState } from "react";
import { Wrench, Clock, User, Car, CalendarPlus, ChevronDown } from "lucide-react";
import { rendezVous, type RendezVous } from "@/lib/data";
import { cn } from "@/lib/utils";

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

function RdvCard({ rv }: { rv: RendezVous }) {
  return (
    <div className="card p-4 border-l-4" style={{ borderLeftColor: TYPE_COLORS[rv.type].replace("bg-", "") }}>
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
        <div className="flex items-center gap-2">
          <Car size={13} />
          <span>{rv.vehicule}</span>
        </div>
        <div className="flex items-center gap-2">
          <User size={13} />
          <span>{rv.technicien}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock size={13} />
          <span>{rv.heure} · {rv.duree} min</span>
        </div>
      </div>
      {rv.notes && (
        <p className="mt-2 text-xs text-slate-400 italic border-t border-slate-50 pt-2">{rv.notes}</p>
      )}
      <div className="flex gap-2 mt-3">
        <button className="btn-secondary flex-1 text-center text-xs py-1.5">Modifier</button>
        {rv.statut === "planifie" && (
          <button className="btn-primary flex-1 text-center text-xs py-1.5">Démarrer</button>
        )}
        {rv.statut === "en_cours" && (
          <button className="flex-1 text-center text-xs py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors">Terminer</button>
        )}
      </div>
    </div>
  );
}

function PlanningView() {
  const [techFilter, setTechFilter] = useState("Tous");

  const filtered = techFilter === "Tous" ? rendezVous : rendezVous.filter(r => r.technicien === techFilter);
  const techniciens = ["Marc Lefebvre", "Paul Durand", "Anne Rousseau"];
  const dates = ["2026-05-10", "2026-05-12", "2026-05-13"];
  const dateLabels: Record<string, string> = {
    "2026-05-10": "Sam. 10 mai",
    "2026-05-12": "Lun. 12 mai",
    "2026-05-13": "Mar. 13 mai",
  };

  return (
    <div>
      <div className="flex gap-2 mb-4">
        {TECHNICIENS.map(t => (
          <button
            key={t}
            onClick={() => setTechFilter(t)}
            className={cn("px-3 py-1 rounded-lg text-sm font-medium transition-colors", techFilter === t ? "bg-blue-600 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50")}
          >
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
                  const rv = rendezVous.find(r => r.heure === heure && r.technicien === tech);
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
  const [view, setView] = useState<"liste" | "planning">("liste");
  const [statutFilter, setStatutFilter] = useState<"tous" | RendezVous["statut"]>("tous");

  const filtered = rendezVous.filter(rv => statutFilter === "tous" || rv.statut === statutFilter);

  const counts = {
    planifie: rendezVous.filter(r => r.statut === "planifie").length,
    en_cours: rendezVous.filter(r => r.statut === "en_cours").length,
    termine: rendezVous.filter(r => r.statut === "termine").length,
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Atelier & SAV</h1>
          <p className="text-sm text-slate-500 mt-0.5">{rendezVous.length} rendez-vous</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
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
              <button
                key={s}
                onClick={() => setStatutFilter(s)}
                className={cn("px-3 py-1 rounded text-xs font-medium transition-colors", statutFilter === s ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-50")}
              >
                {s === "tous" ? "Tous" : STATUT_LABELS[s as RendezVous["statut"]]}
              </button>
            ))}
          </div>
        )}
      </div>

      {view === "liste" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(rv => <RdvCard key={rv.id} rv={rv} />)}
        </div>
      ) : (
        <div className="card p-5">
          <PlanningView />
        </div>
      )}
    </div>
  );
}
