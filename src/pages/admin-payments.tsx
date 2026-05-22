import { Redirect } from "wouter";
import { useStore, type Booking } from "@/lib/store";
import { formatMAD } from "@/lib/money";
import { CreditCard } from "lucide-react";
import { format } from "date-fns";

const paymentClass = {
  paid: "bg-green-50 border-green-200 text-green-800",
  refunded: "bg-blue-50 border-blue-200 text-blue-800",
  unpaid: "bg-amber-50 border-amber-200 text-amber-800",
};

export default function AdminPayments() {
  const { user, isAuthenticated, bookings, cars, updatePaymentStatus } = useStore();

  if (!isAuthenticated || !user?.isAdmin) return <Redirect href="/" />;

  const sorted = [...bookings].sort((a, b) => b.id - a.id);
  const paidTotal = bookings.filter((b) => (b.paymentStatus ?? "unpaid") === "paid").reduce((sum, b) => sum + b.totalPrice, 0);

  return (
    <div>
      <div className="ed-page-hero py-14">
        <div className="container relative z-10">
          <p className="text-accent font-bold text-sm uppercase tracking-widest mb-3">Administration</p>
          <h1 className="text-4xl font-extrabold">Gestion des paiements</h1>
          <p className="text-white/60 mt-2">{formatMAD(paidTotal)} encaissés</p>
        </div>
      </div>

      <div className="container py-10">
        <div className="ed-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  {["#", "Client", "Véhicule", "Montant", "Paiement", "Date"].map((h) => (
                    <th key={h} className="px-6 py-4 font-bold text-xs uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {sorted.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">Aucun paiement</td></tr>
                ) : sorted.map((b: Booking) => {
                  const car = cars.find((c) => c.id === b.carId);
                  const paymentStatus = b.paymentStatus ?? "unpaid";
                  return (
                    <tr key={b.id} className="hover:bg-muted/20">
                      <td className="px-6 py-4 text-muted-foreground font-mono text-xs">#{b.id.toString().slice(-6)}</td>
                      <td className="px-6 py-4">
                        <div className="font-semibold">{b.userName}</div>
                        <div className="text-muted-foreground text-xs">{b.userEmail}</div>
                      </td>
                      <td className="px-6 py-4">{car?.brand} {car?.model}</td>
                      <td className="px-6 py-4 font-extrabold text-accent">{formatMAD(b.totalPrice)}</td>
                      <td className="px-6 py-4">
                        <select
                          className={`text-sm border rounded-lg px-3 py-1.5 font-semibold outline-none focus:ring-2 focus:ring-accent/20 ${paymentClass[paymentStatus]}`}
                          value={paymentStatus}
                          onChange={(e) => updatePaymentStatus(b.id, e.target.value as NonNullable<Booking["paymentStatus"]>, "Admin")}
                        >
                          <option value="unpaid">Non payé</option>
                          <option value="paid">Payé</option>
                          <option value="refunded">Remboursé</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {b.paidAt ? format(new Date(b.paidAt), "dd/MM/yyyy HH:mm") : <span className="inline-flex items-center gap-1"><CreditCard className="w-4 h-4" /> En attente</span>}
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
