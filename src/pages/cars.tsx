import { useState, useMemo } from "react";
import { Link } from "wouter";
import { useStore } from "@/lib/store";
import { formatMAD } from "@/lib/money";
import { Users, Fuel, Settings, SlidersHorizontal, ArrowRight, X } from "lucide-react";

export default function Cars() {
  const { cars } = useStore();
  const [category, setCategory] = useState("");
  const [maxPrice, setMaxPrice] = useState<number | "">("");
  const [transmission, setTransmission] = useState("");
  const [fuel, setFuel] = useState("");

  const filtered = useMemo(() => {
    return cars.filter((car) => {
      if (category && car.category !== category) return false;
      if (maxPrice !== "" && car.pricePerDay > maxPrice) return false;
      if (transmission && car.transmission.toLowerCase() !== transmission) return false;
      if (fuel && car.fuel.toLowerCase() !== fuel) return false;
      return true;
    });
  }, [cars, category, maxPrice, transmission, fuel]);

  const hasFilters = category || maxPrice !== "" || transmission || fuel;
  const clear = () => { setCategory(""); setMaxPrice(""); setTransmission(""); setFuel(""); };

  return (
    <div>
      <div className="ed-page-hero py-16">
        <div className="container relative z-10">
          <p className="text-accent font-bold text-sm uppercase tracking-widest mb-3">Notre collection</p>
          <h1 className="text-5xl font-extrabold mb-4">Notre Flotte</h1>
          <p className="text-white/70 text-lg max-w-xl">Découvrez une sélection de véhicules premium, filtrable en quelques secondes selon votre trajet.</p>
        </div>
      </div>

      <div className="container py-10">
        {/* Filters */}
        <div className="ed-card p-6 mb-10">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2 font-bold text-lg">
              <SlidersHorizontal className="w-5 h-5 text-accent" /> Filtres
            </div>
            {hasFilters && (
              <button onClick={clear} className="text-sm font-semibold text-muted-foreground hover:text-destructive flex items-center gap-1.5 transition-colors">
                <X className="w-4 h-4" /> Réinitialiser
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            {[
              { label: "Catégorie", value: category, onChange: setCategory, options: [["", "Toutes"], ["Citadine", "Citadine"], ["Berline", "Berline"], ["SUV", "SUV"], ["Sport", "Sport"], ["Cabriolet", "Cabriolet"]] },
              { label: "Transmission", value: transmission, onChange: setTransmission, options: [["", "Toutes"], ["automatique", "Automatique"], ["manuelle", "Manuelle"]] },
              { label: "Carburant", value: fuel, onChange: setFuel, options: [["", "Tous"], ["essence", "Essence"], ["diesel", "Diesel"], ["electrique", "Électrique"], ["hybride", "Hybride"]] },
            ].map(({ label, value, onChange, options }) => (
              <div key={label}>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-muted-foreground">{label}</label>
                <select className="ed-input" value={value} onChange={(e) => onChange(e.target.value)}>
                  {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
            ))}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-muted-foreground">Prix max / jour (DH)</label>
              <input type="number" className="ed-input" placeholder="Ex: 200" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value === "" ? "" : Number(e.target.value))} />
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground font-medium mb-6">{filtered.length} véhicule{filtered.length !== 1 ? "s" : ""} trouvé{filtered.length !== 1 ? "s" : ""}</p>

        {filtered.length === 0 ? (
          <div className="ed-card text-center py-24 border-dashed">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-lg bg-accent/10 text-accent">
              <SlidersHorizontal className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold mb-2">Aucun véhicule trouvé</h2>
            <p className="text-muted-foreground mb-6">Modifiez vos filtres pour voir plus de résultats.</p>
            <button onClick={clear} className="text-sm font-bold text-accent hover:underline">Réinitialiser les filtres</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((car) => (
              <div key={car.id} className="ed-card ed-card-hover overflow-hidden flex flex-col group">
                <div className="relative h-56 overflow-hidden">
                  <img src={car.imageUrl} alt={`${car.brand} ${car.model}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/55 via-transparent to-transparent" />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="ed-pill border-white/70 bg-white/90 text-primary backdrop-blur-sm">{car.category}</span>
                    {!car.available && <span className="ed-pill border-destructive bg-destructive text-destructive-foreground">Indisponible</span>}
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-5">
                    <div>
                      <p className="text-xs text-muted-foreground font-medium mb-0.5">{car.year}</p>
                      <h3 className="text-xl font-extrabold">{car.brand} {car.model}</h3>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-extrabold text-accent">{formatMAD(car.pricePerDay)}</span>
                      <span className="text-xs text-muted-foreground block font-medium">/ jour</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mb-6 text-sm text-muted-foreground">
                    <div className="flex min-h-[4.25rem] flex-col items-center justify-center p-2.5 bg-muted/60 rounded-lg gap-1 text-center">
                      <Users className="w-4 h-4" /><span className="text-xs font-semibold">{car.seats} pl.</span>
                    </div>
                    <div className="flex min-h-[4.25rem] flex-col items-center justify-center p-2.5 bg-muted/60 rounded-lg gap-1 text-center">
                      <Settings className="w-4 h-4" /><span className="text-xs font-semibold capitalize">{car.transmission}</span>
                    </div>
                    <div className="flex min-h-[4.25rem] flex-col items-center justify-center p-2.5 bg-muted/60 rounded-lg gap-1 text-center">
                      <Fuel className="w-4 h-4" /><span className="text-xs font-semibold capitalize">{car.fuel}</span>
                    </div>
                  </div>
                  <div className="mt-auto">
                    <Link href={`/voitures/${car.id}`} className={`flex items-center justify-center gap-2 w-full py-3.5 rounded-lg font-bold transition-all duration-200 ${car.available ? "bg-primary text-primary-foreground hover:bg-accent" : "bg-muted text-muted-foreground cursor-not-allowed pointer-events-none"}`}>
                      {car.available ? <><span>Réserver</span><ArrowRight className="w-4 h-4" /></> : "Indisponible"}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
