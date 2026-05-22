import { Link, Redirect } from "wouter";
import { useStore } from "@/lib/store";
import { formatMAD } from "@/lib/money";
import { ArrowRight, CalendarCheck, Car, CreditCard, FileText, ReceiptText, WalletCards } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const statusConfig = {
  confirmed: { label: "Confirmée", className: "bg-green-100 text-green-700 border border-green-200" },
  cancelled: { label: "Annulée", className: "bg-red-100 text-red-700 border border-red-200" },
  pending: { label: "En attente", className: "bg-amber-100 text-amber-700 border border-amber-200" },
};

export default function ClientDashboard() {
  const { isAuthenticated, user, bookings, cars } = useStore();

  if (!isAuthenticated) return <Redirect href="/login" />;

  const myBookings = bookings.filter((booking) => booking.userEmail === user?.email).sort((a, b) => b.id - a.id);
  const activeBookings = myBookings.filter((booking) => booking.status !== "cancelled");
  const unpaidBookings = myBookings.filter((booking) => booking.status !== "cancelled" && (booking.paymentStatus ?? "unpaid") === "unpaid");
  const paidBookings = myBookings.filter((booking) => (booking.paymentStatus ?? "unpaid") === "paid");
  const totalSpent = paidBookings.reduce((sum, booking) => sum + booking.totalPrice, 0);
  const latest = myBookings[0];
  const latestCar = latest ? cars.find((car) => car.id === latest.carId) : null;

  const stats = [
    { icon: CalendarCheck, label: "Réservations", value: myBookings.length, sub: `${activeBookings.length} active${activeBookings.length !== 1 ? "s" : ""}` },
    { icon: WalletCards, label: "À payer", value: formatMAD(unpaidBookings.reduce((sum, booking) => sum + booking.totalPrice, 0)), sub: `${unpaidBookings.length} paiement${unpaidBookings.length !== 1 ? "s" : ""}` },
    { icon: ReceiptText, label: "Factures", value: paidBookings.length, sub: "documents disponibles" },
    { icon: CreditCard, label: "Dépenses", value: formatMAD(totalSpent), sub: "total payé" },
  ];

  return (
    <div>
      <div className="ed-page-hero py-14">
        <div className="container relative z-10">
          <p className="mb-3 text-sm font-extrabold uppercase tracking-widest text-accent">Espace client</p>
          <h1 className="text-4xl font-extrabold">Bonjour, {user?.name}</h1>
          <p className="mt-2 max-w-2xl text-white/65">Suivez vos réservations, paiements et factures depuis un seul tableau de bord.</p>
        </div>
      </div>

      <div className="container py-10">
        <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          {stats.map(({ icon: Icon, label, value, sub }) => (
            <div key={label} className="ed-card p-6">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-muted-foreground">{label}</p>
                  <p className="mt-1 text-3xl font-extrabold">{value}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-accent">
                  <Icon className="h-6 w-6" />
                </div>
              </div>
              <p className="text-sm font-medium text-muted-foreground">{sub}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="ed-card p-7">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-extrabold uppercase tracking-widest text-accent">Dernière activité</p>
                <h2 className="mt-1 text-2xl font-extrabold">Réservation récente</h2>
              </div>
              <Link href="/mes-reservations" className="ed-secondary-action px-4 py-2.5 text-sm">
                Voir tout <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {latest ? (
              <div className="flex flex-col gap-5 md:flex-row">
                <div className="h-48 overflow-hidden rounded-lg bg-muted md:w-72 md:shrink-0">
                  {latestCar && <img src={latestCar.imageUrl} alt={`${latestCar.brand} ${latestCar.model}`} className="h-full w-full object-cover" />}
                </div>
                <div className="flex flex-1 flex-col justify-between gap-5">
                  <div>
                    <div className="mb-3 flex flex-wrap items-center gap-3">
                      <h3 className="text-2xl font-extrabold">{latestCar?.brand} {latestCar?.model}</h3>
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusConfig[latest.status].className}`}>
                        {statusConfig[latest.status].label}
                      </span>
                    </div>
                    <p className="font-medium text-muted-foreground">
                      Du <strong className="text-foreground">{format(new Date(latest.startDate), "dd MMM yyyy", { locale: fr })}</strong> au <strong className="text-foreground">{format(new Date(latest.endDate), "dd MMM yyyy", { locale: fr })}</strong>
                    </p>
                  </div>
                  <div className="flex flex-wrap items-end justify-between gap-4 border-t pt-5">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total</p>
                      <p className="text-3xl font-extrabold text-accent">{formatMAD(latest.totalPrice)}</p>
                    </div>
                    {(latest.paymentStatus ?? "unpaid") === "unpaid" ? (
                      <Link href="/paiements" className="ed-primary-action px-5 py-3 text-sm">
                        Payer maintenant <CreditCard className="h-4 w-4" />
                      </Link>
                    ) : (
                      <Link href="/factures" className="ed-secondary-action px-5 py-3 text-sm">
                        Voir facture <FileText className="h-4 w-4" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-border p-10 text-center">
                <Car className="mx-auto mb-4 h-12 w-12 text-accent" />
                <h3 className="mb-2 text-xl font-extrabold">Aucune réservation pour le moment</h3>
                <p className="mb-6 text-muted-foreground">Choisissez votre premier véhicule et retrouvez le suivi ici.</p>
                <Link href="/voitures" className="ed-primary-action px-6 py-3">
                  Explorer la flotte <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>

          <div className="grid gap-5">
            {[
              { icon: CalendarCheck, title: "Mes réservations", desc: "Voir les dates, statuts et annulations.", href: "/mes-reservations" },
              { icon: CreditCard, title: "Paiements", desc: "Payer les réservations en attente.", href: "/paiements" },
              { icon: ReceiptText, title: "Factures", desc: "Consulter et imprimer vos factures.", href: "/factures" },
            ].map(({ icon: Icon, title, desc, href }) => (
              <Link key={title} href={href} className="ed-card ed-card-hover flex items-center gap-4 p-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
                  <Icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-extrabold">{title}</h3>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
