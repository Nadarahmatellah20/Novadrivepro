import { Link, Redirect } from "wouter";
import { useStore } from "@/lib/store";
import { formatMAD } from "@/lib/money";
import { CalendarDays, ArrowRight, AlertCircle, CreditCard, ReceiptText } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const statusConfig = {
  confirmed: { label: "Confirmée", className: "bg-green-100 text-green-700 border border-green-200" },
  cancelled: { label: "Annulée", className: "bg-red-100 text-red-700 border border-red-200" },
  pending: { label: "En attente", className: "bg-amber-100 text-amber-700 border border-amber-200" },
};

export default function Bookings() {
  const { isAuthenticated, user, bookings, cars, cancelBooking } = useStore();

  if (!isAuthenticated) return <Redirect href="/login" />;

  const myBookings = bookings.filter((b) => b.userEmail === user?.email);

  const handleCancel = (id: number) => {
    if (confirm("Voulez-vous vraiment annuler cette réservation ?")) {
      cancelBooking(id);
    }
  };

  return (
    <div>
      <div className="ed-page-hero py-14">
        <div className="container relative z-10">
          <p className="text-accent font-bold text-sm uppercase tracking-widest mb-3">Espace client</p>
          <h1 className="text-4xl font-extrabold">Mes réservations</h1>
        </div>
      </div>

      <div className="container py-10">
        {myBookings.length === 0 ? (
          <div className="ed-card text-center py-24 border-dashed">
            <div className="w-16 h-16 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-6">
              <CalendarDays className="w-8 h-8 text-accent" />
            </div>
            <h2 className="text-xl font-bold mb-2">Aucune réservation</h2>
            <p className="text-muted-foreground mb-8">Vous n'avez pas encore effectué de réservation.</p>
            <Link href="/voitures" className="ed-primary-action px-6 py-3">
              Parcourir la flotte <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {myBookings.map((booking) => {
              const car = cars.find((c) => c.id === booking.carId);
              const status = statusConfig[booking.status] ?? statusConfig.pending;
              return (
                <div key={booking.id} className="ed-card ed-card-hover p-6 flex flex-col md:flex-row gap-6">
                  <div className="w-full md:w-56 h-40 shrink-0 rounded-lg overflow-hidden bg-muted">
                    {car && <img src={car.imageUrl} alt="Voiture" className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 flex flex-col justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap justify-between items-start gap-3 mb-3">
                        <h2 className="text-2xl font-extrabold">{car?.brand} {car?.model}</h2>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${status.className}`}>{status.label}</span>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1 font-medium">
                        <p>Du <strong className="text-foreground">{format(new Date(booking.startDate), "dd MMMM yyyy", { locale: fr })}</strong></p>
                        <p>Au <strong className="text-foreground">{format(new Date(booking.endDate), "dd MMMM yyyy", { locale: fr })}</strong></p>
                      </div>
                    </div>
                    <div className="flex flex-wrap justify-between items-end gap-4 pt-4 border-t">
                      <div>
                        <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider block mb-1">Total</span>
                        <p className="text-2xl font-extrabold text-accent">{formatMAD(booking.totalPrice)}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(booking.paymentStatus ?? "unpaid") === "unpaid" ? (
                          <Link href="/paiements" className="ed-primary-action px-4 py-2.5 text-sm">
                            <CreditCard className="w-4 h-4" /> Payer
                          </Link>
                        ) : (
                          <Link href="/factures" className="ed-secondary-action px-4 py-2.5 text-sm">
                            <ReceiptText className="w-4 h-4" /> Facture
                          </Link>
                        )}
                        {booking.status === "pending" && (
                          <button onClick={() => handleCancel(booking.id)} className="text-destructive hover:bg-destructive/5 px-4 py-2.5 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 border border-destructive/20 hover:border-destructive/40">
                            <AlertCircle className="w-4 h-4" /> Annuler
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
