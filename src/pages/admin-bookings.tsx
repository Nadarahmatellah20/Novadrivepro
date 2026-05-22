import { useState } from "react";
import { Redirect } from "wouter";
import { useStore, type Booking } from "@/lib/store";
import { formatMAD } from "@/lib/money";
import { Edit2, Plus, Trash2, X } from "lucide-react";
import { format } from "date-fns";

const emptyBooking = {
  carId: 1,
  startDate: new Date().toISOString().slice(0, 10),
  endDate: new Date().toISOString().slice(0, 10),
  status: "pending" as Booking["status"],
  paymentStatus: "unpaid" as NonNullable<Booking["paymentStatus"]>,
  paymentMethod: "",
  userName: "",
  userEmail: "",
};

export default function AdminBookings() {
  const { user, isAuthenticated, bookings, cars, addAdminBooking, updateBooking, deleteBooking } = useStore();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Booking | null>(null);
  const [form, setForm] = useState({ ...emptyBooking });

  if (!isAuthenticated || !user?.isAdmin) return <Redirect href="/" />;

  const sorted = [...bookings].sort((a, b) => b.id - a.id);
  const set = (key: string, value: unknown) => setForm((prev) => ({ ...prev, [key]: value }));

  const openNew = () => {
    setEditing(null);
    setForm({ ...emptyBooking, carId: cars[0]?.id ?? 1 });
    setOpen(true);
  };

  const openEdit = (booking: Booking) => {
    setEditing(booking);
    setForm({
      carId: booking.carId,
      startDate: booking.startDate,
      endDate: booking.endDate,
      status: booking.status,
      paymentStatus: booking.paymentStatus ?? "unpaid",
      paymentMethod: booking.paymentMethod ?? "",
      userName: booking.userName,
      userEmail: booking.userEmail,
    });
    setOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      userEmail: form.userEmail.trim().toLowerCase(),
      paymentMethod: form.paymentStatus === "paid" ? form.paymentMethod || "Admin" : form.paymentMethod,
      paidAt: form.paymentStatus === "paid" ? editing?.paidAt ?? new Date().toISOString() : undefined,
    };

    if (editing) updateBooking(editing.id, payload);
    else addAdminBooking(payload);
    setOpen(false);
  };

  const handleDelete = (id: number) => {
    if (confirm("Supprimer cette réservation ?")) deleteBooking(id);
  };

  return (
    <div>
      <div className="ed-page-hero py-14">
        <div className="container relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-accent font-bold text-sm uppercase tracking-widest mb-3">Administration</p>
            <h1 className="text-4xl font-extrabold">Gestion des réservations</h1>
            <p className="text-white/60 mt-2">{bookings.length} réservation{bookings.length !== 1 ? "s" : ""} au total</p>
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
                  {["#", "Client", "Véhicule", "Dates", "Montant", "Statut", "Paiement", "Actions"].map((h) => (
                    <th key={h} className="px-6 py-4 font-bold text-xs uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {sorted.length === 0 ? (
                  <tr><td colSpan={8} className="px-6 py-12 text-center text-muted-foreground">Aucune réservation</td></tr>
                ) : sorted.map((booking) => {
                  const car = cars.find((c) => c.id === booking.carId);
                  const paymentStatus = booking.paymentStatus ?? "unpaid";
                  return (
                    <tr key={booking.id} className="hover:bg-muted/20">
                      <td className="px-6 py-4 text-muted-foreground font-mono text-xs">#{booking.id.toString().slice(-6)}</td>
                      <td className="px-6 py-4">
                        <div className="font-semibold">{booking.userName}</div>
                        <div className="text-muted-foreground text-xs">{booking.userEmail}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold">{car?.brand}</div>
                        <div className="text-muted-foreground text-xs">{car?.model}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div>{format(new Date(booking.startDate), "dd/MM/yyyy")}</div>
                        <div className="text-muted-foreground">{format(new Date(booking.endDate), "dd/MM/yyyy")}</div>
                      </td>
                      <td className="px-6 py-4 font-extrabold text-accent">{formatMAD(booking.totalPrice)}</td>
                      <td className="px-6 py-4">
                        <span className={`rounded-full px-2 py-1 text-xs font-bold ${
                          booking.status === "confirmed" ? "bg-green-100 text-green-800" :
                          booking.status === "cancelled" ? "bg-red-100 text-red-800" :
                          "bg-amber-100 text-amber-800"
                        }`}>
                          {booking.status === "confirmed" ? "Confirmée" : booking.status === "cancelled" ? "Annulée" : "En attente"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`rounded-full px-2 py-1 text-xs font-bold ${
                          paymentStatus === "paid" ? "bg-green-100 text-green-800" :
                          paymentStatus === "refunded" ? "bg-blue-100 text-blue-800" :
                          "bg-amber-100 text-amber-800"
                        }`}>
                          {paymentStatus === "paid" ? "Payé" : paymentStatus === "refunded" ? "Remboursé" : "Non payé"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <button onClick={() => openEdit(booking)} className="p-2 text-primary hover:bg-primary/5 rounded-lg transition-colors" aria-label="Modifier">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(booking.id)} className="p-2 text-destructive hover:bg-destructive/5 rounded-lg transition-colors" aria-label="Supprimer">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl overflow-hidden rounded-lg bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b p-6">
              <h2 className="text-xl font-extrabold">{editing ? "Modifier la réservation" : "Ajouter une réservation"}</h2>
              <button onClick={() => setOpen(false)} className="rounded-lg p-2 transition-colors hover:bg-muted" aria-label="Fermer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="grid max-h-[78vh] grid-cols-1 gap-4 overflow-y-auto p-6 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Client</label>
                <input required className="ed-input" value={form.userName} onChange={(e) => set("userName", e.target.value)} placeholder="Nom client" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">E-mail</label>
                <input required type="email" className="ed-input" value={form.userEmail} onChange={(e) => set("userEmail", e.target.value)} placeholder="client@email.com" />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Véhicule</label>
                <select className="ed-input" value={form.carId} onChange={(e) => set("carId", Number(e.target.value))}>
                  {cars.map((car) => <option key={car.id} value={car.id}>{car.brand} {car.model} - {formatMAD(car.pricePerDay)}/jour</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Début</label>
                <input required type="date" className="ed-input" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Fin</label>
                <input required type="date" className="ed-input" value={form.endDate} onChange={(e) => set("endDate", e.target.value)} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Statut</label>
                <select className="ed-input" value={form.status} onChange={(e) => set("status", e.target.value as Booking["status"])}>
                  <option value="pending">En attente</option>
                  <option value="confirmed">Confirmée</option>
                  <option value="cancelled">Annulée</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Paiement</label>
                <select className="ed-input" value={form.paymentStatus} onChange={(e) => set("paymentStatus", e.target.value as NonNullable<Booking["paymentStatus"]>)}>
                  <option value="unpaid">Non payé</option>
                  <option value="paid">Payé</option>
                  <option value="refunded">Remboursé</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Méthode de paiement</label>
                <input className="ed-input" value={form.paymentMethod} onChange={(e) => set("paymentMethod", e.target.value)} placeholder="Carte bancaire, Admin..." />
              </div>
              <div className="flex justify-end gap-3 border-t pt-4 md:col-span-2">
                <button type="button" onClick={() => setOpen(false)} className="ed-secondary-action px-5 py-3">Annuler</button>
                <button type="submit" className="ed-primary-action px-6 py-3">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
