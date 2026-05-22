import { useState } from "react";
import { Redirect } from "wouter";
import { useStore, type Car } from "@/lib/store";
import { formatMAD } from "@/lib/money";
import { Plus, Edit2, Trash2, X } from "lucide-react";

const emptyForm = {
  brand: "", model: "", year: new Date().getFullYear(), category: "SUV",
  pricePerDay: 100, imageUrl: "", seats: 5, transmission: "automatique",
  fuel: "essence", description: "", available: true, featured: false,
};

export default function AdminCars() {
  const { user, isAuthenticated, cars, addCar, updateCar, deleteCar } = useStore();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Car | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saved, setSaved] = useState(false);

  if (!isAuthenticated || !user?.isAdmin) return <Redirect href="/" />;

  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  const openNew = () => { setEditing(null); setForm({ ...emptyForm }); setOpen(true); setSaved(false); };
  const openEdit = (car: Car) => { setEditing(car); setForm({ ...car }); setOpen(true); setSaved(false); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) { updateCar(editing.id, form); }
    else { addCar(form); }
    setSaved(true);
    setTimeout(() => setOpen(false), 800);
  };

  const handleDelete = (id: number) => {
    if (confirm("Supprimer ce véhicule ?")) deleteCar(id);
  };

  const fields = [
    { label: "Marque", key: "brand", type: "text" },
    { label: "Modèle", key: "model", type: "text" },
    { label: "Année", key: "year", type: "number" },
    { label: "Catégorie", key: "category", type: "text" },
    { label: "Prix / jour (DH)", key: "pricePerDay", type: "number" },
    { label: "URL de l'image", key: "imageUrl", type: "text" },
    { label: "Places", key: "seats", type: "number" },
  ];

  return (
    <div>
      <div className="ed-page-hero py-14">
        <div className="container relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-accent font-bold text-sm uppercase tracking-widest mb-3">Administration</p>
            <h1 className="text-4xl font-extrabold">Gestion des véhicules</h1>
          </div>
          <button onClick={openNew} className="ed-primary-action w-fit px-5 py-3">
            <Plus className="w-5 h-5" /> Ajouter
          </button>
        </div>
      </div>

      <div className="container py-10">
        <div className="ed-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  {["Véhicule", "Catégorie", "Prix/jour", "Statut", "Vedette", "Actions"].map((h) => (
                    <th key={h} className="px-6 py-4 font-bold text-xs uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {cars.map((car) => (
                  <tr key={car.id} className="hover:bg-muted/20">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-9 rounded-lg overflow-hidden bg-muted shrink-0">
                          <img src={car.imageUrl} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <div className="font-bold">{car.brand} {car.model}</div>
                          <div className="text-muted-foreground text-xs">{car.year}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">{car.category}</td>
                    <td className="px-6 py-4 font-bold text-accent">{formatMAD(car.pricePerDay)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${car.available ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                        {car.available ? "Disponible" : "Indisponible"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${car.featured ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"}`}>
                        {car.featured ? "Oui" : "Non"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(car)} className="p-2 text-primary hover:bg-primary/5 rounded-lg transition-colors" aria-label={`Modifier ${car.brand} ${car.model}`}><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(car.id)} className="p-2 text-destructive hover:bg-destructive/5 rounded-lg transition-colors" aria-label={`Supprimer ${car.brand} ${car.model}`}><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-extrabold">{editing ? "Modifier le véhicule" : "Ajouter un véhicule"}</h2>
              <button onClick={() => setOpen(false)} className="p-2 hover:bg-muted rounded-lg transition-colors" aria-label="Fermer"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {fields.map(({ label, key, type }) => (
                  <div key={key} className={key === "imageUrl" ? "col-span-2" : ""}>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-muted-foreground">{label}</label>
                    <input required type={type} className="ed-input" value={(form as Record<string, unknown>)[key] as string} onChange={(e) => set(key, type === "number" ? Number(e.target.value) : e.target.value)} />
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-muted-foreground">Transmission</label>
                  <select className="ed-input" value={form.transmission} onChange={(e) => set("transmission", e.target.value)}>
                    <option value="automatique">Automatique</option>
                    <option value="manuelle">Manuelle</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-muted-foreground">Carburant</label>
                  <select className="ed-input" value={form.fuel} onChange={(e) => set("fuel", e.target.value)}>
                    <option value="essence">Essence</option>
                    <option value="diesel">Diesel</option>
                    <option value="electrique">Électrique</option>
                    <option value="hybride">Hybride</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 text-muted-foreground">Description</label>
                <textarea className="ed-input h-24 resize-none" value={form.description} onChange={(e) => set("description", e.target.value)} />
              </div>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.available} onChange={(e) => set("available", e.target.checked)} className="w-4 h-4 accent-accent" />
                  <span className="text-sm font-semibold">Disponible</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} className="w-4 h-4 accent-accent" />
                  <span className="text-sm font-semibold">Afficher en vedette</span>
                </label>
              </div>
              <div className="flex justify-end pt-2">
                <button type="submit" className="ed-primary-action px-8 py-3">
                  {saved ? "✓ Enregistré !" : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
