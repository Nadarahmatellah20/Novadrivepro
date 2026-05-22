import { Redirect } from "wouter";
import { useStore } from "@/lib/store";
import { formatMAD } from "@/lib/money";
import { Car, Calendar, DollarSign, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const statusConfig = {
  confirmed: { label: "Confirmée", className: "bg-green-100 text-green-800" },
  cancelled: { label: "Annulée", className: "bg-red-100 text-red-800" },
  pending: { label: "En attente", className: "bg-yellow-100 text-yellow-800" },
};

export default function AdminDashboard() {
  const { user, isAuthenticated, cars, bookings } = useStore();

  if (!isAuthenticated || !user?.isAdmin) return <Redirect href="/" />;

  const totalRevenue = bookings.filter((b) => b.status !== "cancelled").reduce((s, b) => s + b.totalPrice, 0);
  const now = new Date();
  const monthlyRevenue = bookings
    .filter((b) => b.status !== "cancelled" && new Date(b.startDate).getMonth() === now.getMonth())
    .reduce((s, b) => s + b.totalPrice, 0);

  const stats = [
    { icon: Car, label: "Véhicules", value: cars.length, sub: `${cars.filter((c) => c.available).length} disponibles`, color: "bg-blue-50 text-blue-600" },
    { icon: Calendar, label: "Réservations", value: bookings.length, sub: `${bookings.filter((b) => b.status === "pending").length} en attente`, color: "bg-purple-50 text-purple-600" },
    { icon: DollarSign, label: "Revenus Total", value: formatMAD(totalRevenue), sub: "", color: "bg-green-50 text-green-600" },
    { icon: TrendingUp, label: "Revenus du mois", value: formatMAD(monthlyRevenue), sub: "", color: "bg-orange-50 text-orange-600" },
  ];

  const recent = [...bookings].sort((a, b) => b.id - a.id).slice(0, 10);

  return (
    <div>
      <div className="ed-page-hero py-14">
        <div className="container relative z-10">
          <p className="text-accent font-bold text-sm uppercase tracking-widest mb-3">Administration</p>
          <h1 className="text-4xl font-extrabold">Tableau de bord</h1>
        </div>
      </div>

      <div className="container py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map(({ icon: Icon, label, value, sub, color }) => (
            <div key={label} className="ed-card p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className={`p-3 rounded-lg ${color}`}><Icon className="w-6 h-6" /></div>
                <h3 className="font-semibold text-muted-foreground">{label}</h3>
              </div>
              <p className="text-3xl font-extrabold">{value}</p>
              {sub && <p className="text-sm text-muted-foreground mt-1">{sub}</p>}
            </div>
          ))}
        </div>

        <h2 className="text-2xl font-extrabold mb-6">Réservations récentes</h2>
        <div className="ed-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  {["Client", "E-mail", "Véhicule", "Dates", "Montant", "Statut"].map((h) => (
                    <th key={h} className="px-6 py-4 font-bold text-xs uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {recent.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">Aucune réservation</td></tr>
                ) : recent.map((b) => {
                  const car = cars.find((c) => c.id === b.carId);
                  const s = statusConfig[b.status] ?? statusConfig.pending;
                  return (
                    <tr key={b.id} className="hover:bg-muted/20">
                      <td className="px-6 py-4 font-semibold">{b.userName}</td>
                      <td className="px-6 py-4 text-muted-foreground">{b.userEmail}</td>
                      <td className="px-6 py-4">{car?.brand} {car?.model}</td>
                      <td className="px-6 py-4">
                        <div>{format(new Date(b.startDate), "dd MMM yyyy", { locale: fr })}</div>
                        <div className="text-muted-foreground">{format(new Date(b.endDate), "dd MMM yyyy", { locale: fr })}</div>
                      </td>
                      <td className="px-6 py-4 font-bold text-accent">{formatMAD(b.totalPrice)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${s.className}`}>{s.label}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
