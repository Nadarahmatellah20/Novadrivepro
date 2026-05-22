import { useState } from "react";
import { useParams, Link, useLocation } from "wouter";
import { useStore } from "@/lib/store";
import { formatMAD } from "@/lib/money";
import { ArrowLeft, Users, Fuel, Settings, Calendar as CalendarIcon, CheckCircle } from "lucide-react";
import { differenceInDays } from "date-fns";

export default function CarDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { cars, addBooking, isAuthenticated } = useStore();
  const car = cars.find((c) => c.id === Number(id));

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!car) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground text-lg">Véhicule introuvable.</p>
        <Link href="/voitures" className="text-accent font-bold hover:underline">← Retour à la flotte</Link>
      </div>
    );
  }

  let days = 0;
  let totalPrice = 0;
  if (startDate && endDate) {
    const s = new Date(startDate), e = new Date(endDate);
    if (e >= s) { days = differenceInDays(e, s) + 1; totalPrice = days * car.pricePerDay; }
  }

  const handleBooking = () => {
    if (!isAuthenticated) { setLocation("/login"); return; }
    if (!startDate || !endDate) { alert("Veuillez sélectionner vos dates."); return; }
    if (new Date(endDate) < new Date(startDate)) { alert("La date de fin doit être après la date de début."); return; }
    setLoading(true);
    setTimeout(() => {
      addBooking({ carId: car.id, startDate, endDate });
      setLoading(false);
      setDone(true);
      setTimeout(() => setLocation("/mes-reservations"), 1500);
    }, 600);
  };

  return (
    <div>
      <div className="border-b bg-white/70 backdrop-blur">
        <div className="container py-4">
          <Link href="/voitures" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-accent transition-colors">
            <ArrowLeft className="w-4 h-4" /> Retour aux véhicules
          </Link>
        </div>
      </div>

      <div className="container py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
            <div className="ed-card overflow-hidden aspect-[16/9]">
              <img src={car.imageUrl} alt={`${car.brand} ${car.model}`} className="w-full h-full object-cover" />
            </div>

            <div>
              <span className="ed-pill mb-3 border-accent/20 bg-accent/10 text-accent">{car.category}</span>
              <h1 className="text-4xl font-extrabold mb-1">{car.brand} {car.model}</h1>
              <p className="text-muted-foreground font-medium">{car.year}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-8 border-y">
              {[
                { icon: Users, label: "Places", value: `${car.seats} places` },
                { icon: Settings, label: "Boîte", value: car.transmission },
                { icon: Fuel, label: "Énergie", value: car.fuel },
                { icon: CalendarIcon, label: "Année", value: String(car.year) },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex min-h-[6.5rem] flex-col gap-2 p-4 bg-white/75 border border-border/70 rounded-lg">
                  <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5" /> {label}
                  </span>
                  <span className="font-bold capitalize">{value}</span>
                </div>
              ))}
            </div>

            <div>
              <h3 className="text-2xl font-extrabold mb-4">À propos de ce véhicule</h3>
              <p className="text-muted-foreground leading-relaxed">{car.description || "Aucune description disponible."}</p>
            </div>

            <div className="ed-card p-6">
              <h3 className="font-bold mb-4">Inclus dans votre location</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {["Assurance tous risques", "Kilométrage illimité", "Assistance 24h/7j", "Première pleine de carburant"].map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm font-medium text-foreground/80">
                    <CheckCircle className="w-4 h-4 text-accent shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="ed-card sticky top-28 p-8">
              <div className="mb-6 pb-6 border-b">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-accent">{formatMAD(car.pricePerDay)}</span>
                  <span className="text-muted-foreground font-medium"> / jour</span>
                </div>
                {car.available
                  ? <p className="text-sm text-green-600 font-semibold mt-1 flex items-center gap-1.5"><span className="w-2 h-2 bg-green-500 rounded-full" />Disponible à la réservation</p>
                  : <p className="text-sm text-destructive font-semibold mt-1">Indisponible actuellement</p>}
              </div>

              {done ? (
                <div className="text-center py-6">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <p className="font-extrabold text-lg text-green-700">Réservation confirmée !</p>
                  <p className="text-sm text-muted-foreground mt-1">Redirection en cours...</p>
                </div>
              ) : car.available ? (
                <div className="space-y-5">
                  <div className="space-y-4">
                    {[
                      { label: "Date de début", value: startDate, min: new Date().toISOString().split("T")[0], onChange: setStartDate },
                      { label: "Date de fin", value: endDate, min: startDate || new Date().toISOString().split("T")[0], onChange: setEndDate },
                    ].map(({ label, value, min, onChange }) => (
                      <div key={label}>
                        <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-muted-foreground">{label}</label>
                        <input type="date" className="ed-input" value={value} min={min} onChange={(e) => onChange(e.target.value)} />
                      </div>
                    ))}
                  </div>

                  {totalPrice > 0 && (
                    <div className="bg-accent/5 border border-accent/20 p-4 rounded-lg space-y-2">
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{formatMAD(car.pricePerDay)} × {days} jour{days > 1 ? "s" : ""}</span>
                        <span>{formatMAD(totalPrice)}</span>
                      </div>
                      <div className="flex justify-between font-extrabold text-lg border-t pt-2">
                        <span>Total</span><span className="text-accent">{formatMAD(totalPrice)}</span>
                      </div>
                    </div>
                  )}

                  <button onClick={handleBooking} disabled={loading} className="ed-primary-action w-full py-4 text-lg disabled:opacity-60">
                    {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                    {isAuthenticated ? "Confirmer la réservation" : "Se connecter pour réserver"}
                  </button>
                  <p className="text-xs text-center text-muted-foreground">Annulation gratuite avant le début de la location</p>
                </div>
              ) : (
                <div className="bg-destructive/5 border border-destructive/20 text-destructive p-5 rounded-lg text-center font-bold">
                  Véhicule actuellement indisponible
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
