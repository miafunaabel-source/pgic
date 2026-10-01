"use client";
import { useState, useEffect, useRef } from "react";
import { Search, Car, Fuel, Gauge, Calendar, ExternalLink, Camera } from "lucide-react";
import type { Vehicule } from "@/lib/data";
import { formatCurrency, cn } from "@/lib/utils";
import Modal from "@/components/ui/Modal";
import { useToast } from "@/contexts/ToastContext";
import { useSession } from "next-auth/react";

const TOP_MARQUES = [
  "Alfa Romeo", "Audi", "BMW", "Citroën", "Dacia",
  "Fiat", "Ford", "Honda", "Hyundai", "Jaguar",
  "Kia", "Land Rover", "Lexus", "Mazda", "Mercedes-Benz",
  "Mini", "Mitsubishi", "Nissan", "Opel", "Peugeot",
  "Porsche", "Renault", "SEAT", "Skoda", "Subaru",
  "Suzuki", "Tesla", "Toyota", "Volkswagen", "Volvo",
];

const PORTAILS = [
  { name: "La Centrale", url: "https://www.lacentrale.fr/achat_vehicule_tout.php", bg: "bg-orange-500 hover:bg-orange-600" },
  { name: "Leboncoin", url: "https://www.leboncoin.fr/deposer-annonce/", bg: "bg-orange-400 hover:bg-orange-500" },
  { name: "Autoscout24", url: "https://www.autoscout24.fr/vendre/", bg: "bg-blue-600 hover:bg-blue-700" },
];

function StatutBadge({ statut }: { statut: Vehicule["statut"] }) {
  const styles = { disponible: "bg-emerald-100 text-emerald-700", reserve: "bg-amber-100 text-amber-700", transit: "bg-blue-100 text-blue-700", vendu: "bg-slate-100 text-slate-500" };
  const labels = { disponible: "Disponible", reserve: "Réservé", transit: "En transit", vendu: "Vendu" };
  return <span className={`badge ${styles[statut]}`}>{labels[statut]}</span>;
}

function TypeBadge({ type }: { type: Vehicule["type"] }) {
  return <span className={`badge ${type === "neuf" ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"}`}>{type === "neuf" ? "Neuf" : "Occasion"}</span>;
}

function compressPhoto(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxW = 800;
        const scale = img.width > maxW ? maxW / img.width : 1;
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.75));
      };
      img.onerror = reject;
      img.src = e.target!.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function VehiculeCard({ v, onClick }: { v: Vehicule; onClick: () => void }) {
  return (
    <div className="card p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <div className="flex items-start justify-between mb-3">
        <TypeBadge type={v.type} />
        <StatutBadge statut={v.statut} />
      </div>
      <div className="flex items-center justify-center bg-slate-50 rounded-lg h-28 mb-3 overflow-hidden relative">
        {v.photo ? (
          <img src={v.photo} alt={`${v.marque} ${v.modele}`} className="w-full h-full object-cover" />
        ) : (
          <Car size={48} className="text-slate-300" />
        )}
        {v.statut === "reserve" && (
          <div className="absolute inset-0 bg-amber-500/20 flex items-center justify-center">
            <span className="bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded rotate-[-10deg] shadow">RÉSERVÉ</span>
          </div>
        )}
      </div>
      <h3 className="font-semibold text-slate-900">{v.marque} {v.modele}</h3>
      <p className="text-xs text-slate-400 mb-3">{v.couleur}</p>
      <div className="grid grid-cols-3 gap-2 mb-3 text-xs text-slate-500">
        <div className="flex items-center gap-1"><Calendar size={11} />{v.annee}</div>
        <div className="flex items-center gap-1"><Gauge size={11} />{v.kilometrage > 0 ? `${v.kilometrage.toLocaleString("fr-FR")} km` : "Neuf"}</div>
        <div className="flex items-center gap-1"><Fuel size={11} />{v.carburant.split(" ")[0]}</div>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-lg font-bold text-blue-700">{formatCurrency(v.prix)}</p>
        <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">Détails →</button>
      </div>
    </div>
  );
}

function PublierModal({ v, onClose }: { v: Vehicule; onClose: () => void }) {
  return (
    <Modal title="Publier l'annonce" onClose={onClose}>
      <div className="bg-slate-50 rounded-xl p-3 mb-4">
        <p className="text-sm font-semibold text-slate-900">{v.marque} {v.modele} {v.annee}</p>
        <p className="text-xl font-bold text-blue-700">{formatCurrency(v.prix)}</p>
        <p className="text-xs text-slate-500 mt-0.5">{v.kilometrage > 0 ? `${v.kilometrage.toLocaleString("fr-FR")} km · ` : ""}{v.carburant} · {v.couleur}</p>
      </div>
      <p className="text-sm text-slate-600 mb-4">Choisissez le portail pour déposer votre annonce :</p>
      <div className="space-y-3">
        {PORTAILS.map(site => (
          <a
            key={site.name}
            href={site.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`${site.bg} text-white flex items-center justify-between px-4 py-3 rounded-xl transition-colors font-semibold text-sm`}
          >
            <span>{site.name}</span>
            <ExternalLink size={16} />
          </a>
        ))}
      </div>
      <p className="text-xs text-slate-400 mt-4 text-center">Vous serez redirigé vers le formulaire de dépôt d'annonce du site.</p>
    </Modal>
  );
}

function DevisModal({ v, garage, onClose, onSaved }: { v: Vehicule; garage: string; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ clientNom: "", financement: "En attente", nomGarage: garage });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputCls = "w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientNom: form.clientNom,
          vehicule: `${v.marque} ${v.modele} ${v.annee}`,
          montant: v.prix,
          financement: form.financement,
          garage: form.nomGarage,
        }),
      });
      if (!res.ok) { setError("Erreur lors de la création"); return; }
      onSaved();
      onClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal title="Créer un devis de vente" onClose={onClose}>
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-4">
        <p className="text-sm font-semibold text-slate-900">{v.marque} {v.modele} {v.annee}</p>
        <p className="text-2xl font-bold text-blue-700">{formatCurrency(v.prix)}</p>
        {v.kilometrage > 0 && <p className="text-xs text-slate-500 mt-0.5">{v.kilometrage.toLocaleString("fr-FR")} km · {v.carburant} · {v.couleur}</p>}
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Nom du garage *</label>
          <input required value={form.nomGarage} onChange={e => setForm(f => ({ ...f, nomGarage: e.target.value }))}
            placeholder="Garage Auto Services" className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Nom du client *</label>
          <input required value={form.clientNom} onChange={e => setForm(f => ({ ...f, clientNom: e.target.value }))}
            placeholder="Prénom Nom" className={inputCls} />
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
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 btn-secondary">Annuler</button>
          <button type="submit" disabled={loading} className="flex-1 btn-primary">
            {loading ? "Création…" : "Créer le devis"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function VehiculeDetail({ v, onClose, onUpdate, garage }: {
  v: Vehicule;
  onClose: () => void;
  onUpdate: (updated: Vehicule) => void;
  garage: string;
}) {
  const toast = useToast();
  const [reserving, setReserving] = useState(false);
  const [showPublier, setShowPublier] = useState(false);
  const [showDevis, setShowDevis] = useState(false);

  async function handleReserver() {
    setReserving(true);
    const newStatut = v.statut === "reserve" ? "disponible" : "reserve";
    try {
      const res = await fetch(`/api/inventory/${v.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statut: newStatut }),
      });
      if (!res.ok) { toast("error", "Erreur lors de la mise à jour"); return; }
      const updated: Vehicule = await res.json();
      onUpdate(updated);
      toast("success", newStatut === "reserve"
        ? `${v.marque} ${v.modele} marqué RÉSERVÉ`
        : `${v.marque} ${v.modele} de nouveau disponible`);
    } finally {
      setReserving(false);
    }
  }

  return (
    <>
      {showPublier && <PublierModal v={v} onClose={() => setShowPublier(false)} />}
      {showDevis && (
        <DevisModal
          v={v}
          garage={garage}
          onClose={() => setShowDevis(false)}
          onSaved={() => toast("success", "Devis créé — visible dans Ventes")}
        />
      )}
      <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-end">
        <div className="bg-white w-full max-w-md h-full shadow-2xl overflow-y-auto">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-sm">← Retour</button>
            <div className="flex gap-2">
              <button onClick={() => setShowPublier(true)} className="btn-secondary text-sm">Publier annonce</button>
              <button
                onClick={handleReserver}
                disabled={reserving}
                className={cn(
                  "btn-primary text-sm",
                  v.statut === "reserve" && "!bg-amber-500 hover:!bg-amber-600"
                )}
              >
                {reserving ? "…" : v.statut === "reserve" ? "Annuler réservation" : "Réserver"}
              </button>
            </div>
          </div>
          <div className="p-6 space-y-6">
            <div className="bg-slate-50 rounded-xl h-52 flex items-center justify-center overflow-hidden relative">
              {v.photo ? (
                <img src={v.photo} alt={`${v.marque} ${v.modele}`} className="w-full h-full object-cover" />
              ) : (
                <Car size={72} className="text-slate-300" />
              )}
              {v.statut === "reserve" && (
                <div className="absolute top-3 right-3 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                  RÉSERVÉ
                </div>
              )}
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
                  { label: "Année", value: String(v.annee) },
                  { label: "Kilométrage", value: v.kilometrage > 0 ? `${v.kilometrage.toLocaleString("fr-FR")} km` : "0 km (Neuf)" },
                  { label: "Carburant", value: v.carburant },
                  { label: "Couleur", value: v.couleur },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs text-slate-400">{label}</p>
                    <p className="text-sm font-semibold text-slate-800 mt-0.5">{value}</p>
                  </div>
                ))}
              </div>
              {v.vin && (
                <div className="mt-3 bg-slate-50 rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400">VIN</p>
                    <p className="text-sm font-mono font-semibold text-slate-800 mt-0.5 break-all">{v.vin}</p>
                  </div>
                  <a
                    href="https://histovec.interieur.gouv.fr/histovec/home"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-3 shrink-0 text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium"
                    title="Consulter l'historique HISTOVEC"
                  >
                    Historique <ExternalLink size={12} />
                  </a>
                </div>
              )}
            </div>
            <div>
              <h3 className="text-xs font-semibold text-slate-400 uppercase mb-3">Actions</h3>
              <div className="space-y-2">
                <button onClick={() => setShowDevis(true)} className="w-full btn-primary">Créer un devis de vente</button>
                <button onClick={() => setShowPublier(true)} className="w-full btn-secondary">Publier sur portails</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function InventoryPage() {
  const { data: session } = useSession();
  const toast = useToast();
  const [vehicules, setVehicules] = useState<Vehicule[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"tous" | "neuf" | "occasion">("tous");
  const [statutFilter, setStatutFilter] = useState<"tous" | Vehicule["statut"]>("tous");
  const [selected, setSelected] = useState<Vehicule | null>(null);
  const [showModal, setShowModal] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [form, setForm] = useState({
    marque: "", modele: "", annee: "", prix: "", carburant: "Essence",
    couleur: "", type: "neuf" as "neuf" | "occasion", kilometrage: "", vin: "", photo: "",
  });

  const garage = (session?.user as any)?.company?.concession ?? "Mon Garage";

  useEffect(() => {
    fetch("/api/inventory").then(r => r.json()).then(data => {
      setVehicules(Array.isArray(data) ? data : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

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

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressed = await compressPhoto(file);
      setPhotoPreview(compressed);
      setForm(f => ({ ...f, photo: compressed }));
    } catch {
      toast("error", "Erreur lors de la lecture de l'image");
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/inventory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        marque: form.marque,
        modele: form.modele,
        annee: Number(form.annee) || new Date().getFullYear(),
        prix: Number(form.prix),
        carburant: form.carburant,
        couleur: form.couleur,
        type: form.type,
        kilometrage: Number(form.kilometrage) || 0,
        vin: form.vin || undefined,
        photo: form.photo || undefined,
      }),
    });
    if (!res.ok) { toast("error", "Erreur lors de l'ajout"); return; }
    const newV: Vehicule = await res.json();
    setVehicules(prev => [newV, ...prev]);
    setShowModal(false);
    setForm({ marque: "", modele: "", annee: "", prix: "", carburant: "Essence", couleur: "", type: "neuf", kilometrage: "", vin: "", photo: "" });
    setPhotoPreview("");
    toast("success", `${form.marque} ${form.modele} ajouté au stock`);
  }

  const inputCls = "w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div>
      {selected && (
        <VehiculeDetail
          v={selected}
          garage={garage}
          onClose={() => setSelected(null)}
          onUpdate={updated => {
            setVehicules(prev => prev.map(v => v.id === updated.id ? updated : v));
            setSelected(updated);
          }}
        />
      )}

      {showModal && (
        <Modal title="Ajouter un véhicule" onClose={() => { setShowModal(false); setPhotoPreview(""); }}>
          <form onSubmit={handleCreate} className="space-y-4">
            {/* Photo */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Photo du véhicule</label>
              <input ref={photoInputRef} type="file" accept="image/*" onChange={handlePhotoChange} hidden />
              <div
                onClick={() => photoInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center cursor-pointer hover:border-blue-400 transition-colors overflow-hidden"
              >
                {photoPreview ? (
                  <img src={photoPreview} alt="preview" className="w-full h-32 object-cover rounded-lg" />
                ) : (
                  <>
                    <Camera size={24} className="text-slate-400 mx-auto mb-1" />
                    <p className="text-sm text-slate-500">Cliquer pour ajouter une photo</p>
                    <p className="text-xs text-slate-400">JPG, PNG — redimensionné automatiquement</p>
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Marque *</label>
                <select required value={form.marque} onChange={e => setForm(f => ({ ...f, marque: e.target.value }))} className={inputCls}>
                  <option value="">Sélectionner…</option>
                  {TOP_MARQUES.map(m => <option key={m} value={m}>{m}</option>)}
                  <option value="Autre">Autre marque</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Modèle *</label>
                <input required value={form.modele} onChange={e => setForm(f => ({ ...f, modele: e.target.value }))}
                  placeholder="308" className={inputCls} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Année</label>
                <input type="number" value={form.annee} onChange={e => setForm(f => ({ ...f, annee: e.target.value }))}
                  placeholder={String(new Date().getFullYear())} className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Prix (€) *</label>
                <input required type="number" value={form.prix} onChange={e => setForm(f => ({ ...f, prix: e.target.value }))}
                  placeholder="25000" className={inputCls} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Kilométrage</label>
                <input type="number" value={form.kilometrage} onChange={e => setForm(f => ({ ...f, kilometrage: e.target.value }))}
                  placeholder="0" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Carburant</label>
                <select value={form.carburant} onChange={e => setForm(f => ({ ...f, carburant: e.target.value }))} className={inputCls}>
                  {["Essence", "Diesel", "Électrique", "Hybride", "Plug-in Hybride", "GPL"].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Couleur</label>
                <input value={form.couleur} onChange={e => setForm(f => ({ ...f, couleur: e.target.value }))}
                  placeholder="Blanc Nacré" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Type</label>
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as "neuf" | "occasion" }))} className={inputCls}>
                  <option value="neuf">Neuf</option>
                  <option value="occasion">Occasion</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">VIN (Numéro d'identification)</label>
              <input value={form.vin} onChange={e => setForm(f => ({ ...f, vin: e.target.value }))}
                placeholder="VF3LCYHZPNS012345" className={`${inputCls} font-mono`} />
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => { setShowModal(false); setPhotoPreview(""); }} className="flex-1 btn-secondary">Annuler</button>
              <button type="submit" className="flex-1 btn-primary">Ajouter au stock</button>
            </div>
          </form>
        </Modal>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Stocks Véhicules</h1>
          <p className="text-sm text-slate-500 mt-0.5">{vehicules.length} véhicules en base</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">+ Ajouter véhicule</button>
      </div>

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

      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Marque, modèle, couleur..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="flex gap-1 bg-white border border-slate-200 rounded-lg p-1">
          {(["tous", "neuf", "occasion"] as const).map(f => (
            <button key={f} onClick={() => setTypeFilter(f)}
              className={cn("px-3 py-1 rounded text-sm font-medium transition-colors", typeFilter === f ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-50")}>
              {f === "tous" ? "Tous" : f === "neuf" ? "Neufs" : "Occasions"}
            </button>
          ))}
        </div>
        <div className="flex gap-1 bg-white border border-slate-200 rounded-lg p-1">
          {(["tous", "disponible", "reserve", "transit"] as const).map(f => (
            <button key={f} onClick={() => setStatutFilter(f)}
              className={cn("px-3 py-1 rounded text-xs font-medium transition-colors", statutFilter === f ? "bg-blue-600 text-white" : "text-slate-600 hover:bg-slate-50")}>
              {f === "tous" ? "Tous statuts" : f === "disponible" ? "Dispo" : f === "reserve" ? "Réservé" : "Transit"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map(v => <VehiculeCard key={v.id} v={v} onClick={() => setSelected(v)} />)}
      </div>
      {loading && <div className="text-center py-16 text-slate-400">Chargement…</div>}
      {!loading && filtered.length === 0 && search && <div className="text-center py-16 text-slate-400">Aucun véhicule trouvé</div>}
      {!loading && vehicules.length === 0 && !search && (
        <div className="text-center py-16 text-slate-400">
          <Car size={40} className="mx-auto mb-3 text-slate-300" />
          <p className="font-medium text-slate-500">Aucun véhicule en stock</p>
          <p className="text-sm mt-1">Ajoutez votre premier véhicule avec le bouton ci-dessus</p>
        </div>
      )}
    </div>
  );
}
