import { useMemo, useState } from "react";
import { Redirect } from "wouter";
import { useStore, type PaymentCard } from "@/lib/store";
import { downloadInvoicePdf } from "@/lib/invoice-pdf";
import { formatMAD } from "@/lib/money";
import { CheckCircle, CreditCard, Download, Plus, ReceiptText, Star, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const paymentConfig = {
  paid: { label: "Payé", className: "bg-green-100 text-green-700 border border-green-200" },
  refunded: { label: "Remboursé", className: "bg-blue-100 text-blue-700 border border-blue-200" },
  unpaid: { label: "Non payé", className: "bg-amber-100 text-amber-700 border border-amber-200" },
};

export default function Payments() {
  const {
    isAuthenticated,
    user,
    bookings,
    cars,
    paymentCards,
    addPaymentCard,
    setDefaultPaymentCard,
    deletePaymentCard,
    updatePaymentStatus,
  } = useStore();
  const [selectedCardId, setSelectedCardId] = useState("");
  const [brand, setBrand] = useState<PaymentCard["brand"]>("Visa");
  const [holder, setHolder] = useState(user?.name ?? "");
  const [number, setNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [message, setMessage] = useState("");

  const defaultCardId = useMemo(() => paymentCards.find((card) => card.isDefault)?.id ?? paymentCards[0]?.id ?? "", [paymentCards]);
  const activeCardId = selectedCardId || defaultCardId;

  if (!isAuthenticated) return <Redirect href="/login" />;

  const myBookings = bookings.filter((b) => b.userEmail === user?.email).sort((a, b) => b.id - a.id);

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    const result = addPaymentCard({ brand, holder, number, expiry });
    if (!result.ok) {
      setMessage(result.error || "Carte invalide.");
      return;
    }
    setSelectedCardId(result.card?.id ?? "");
    setNumber("");
    setExpiry("");
    setMessage("Carte ajoutée. Vous pouvez maintenant payer avec cette carte.");
  };

  const handlePay = (bookingId: number) => {
    const card = paymentCards.find((item) => item.id === activeCardId);
    if (!card) {
      setMessage("Ajoutez ou sélectionnez une carte avant de payer.");
      return;
    }
    updatePaymentStatus(bookingId, "paid", `${card.brand} •••• ${card.last4}`);
    setDefaultPaymentCard(card.id);
    setMessage("Paiement confirmé. La facture PDF est disponible.");
  };

  return (
    <div>
      <div className="ed-page-hero py-14">
        <div className="container relative z-10">
          <p className="text-accent font-bold text-sm uppercase tracking-widest mb-3">Espace client</p>
          <h1 className="text-4xl font-extrabold">Mes paiements</h1>
        </div>
      </div>

      <div className="container grid grid-cols-1 gap-6 py-10 lg:grid-cols-[360px_1fr]">
        <aside className="space-y-6">
          <section className="ed-card p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-accent">Cartes</p>
                <h2 className="text-xl font-extrabold">Moyens de paiement</h2>
              </div>
              <CreditCard className="h-6 w-6 text-accent" />
            </div>

            {paymentCards.length === 0 ? (
              <p className="rounded-lg border border-dashed p-4 text-sm font-medium text-muted-foreground">Aucune carte enregistrée.</p>
            ) : (
              <div className="space-y-3">
                {paymentCards.map((card) => (
                  <div key={card.id} className={`rounded-lg border p-4 ${activeCardId === card.id ? "border-accent bg-accent/5" : "border-border bg-white"}`}>
                    <label className="flex cursor-pointer items-start gap-3">
                      <input
                        type="radio"
                        name="payment-card"
                        className="mt-1 accent-[hsl(var(--accent))]"
                        checked={activeCardId === card.id}
                        onChange={() => setSelectedCardId(card.id)}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block font-extrabold">{card.brand} •••• {card.last4}</span>
                        <span className="block text-xs font-medium text-muted-foreground">{card.holder} · Exp. {card.expiry}</span>
                      </span>
                    </label>
                    <div className="mt-3 flex gap-2">
                      <button type="button" onClick={() => setDefaultPaymentCard(card.id)} className="ed-secondary-action px-3 py-2 text-xs">
                        <Star className="h-3.5 w-3.5" /> {card.isDefault ? "Par défaut" : "Définir"}
                      </button>
                      <button type="button" onClick={() => deletePaymentCard(card.id)} className="ed-secondary-action px-3 py-2 text-xs text-destructive">
                        <Trash2 className="h-3.5 w-3.5" /> Retirer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <form onSubmit={handleAddCard} className="ed-card p-6">
            <div className="mb-5 flex items-center gap-2">
              <Plus className="h-5 w-5 text-accent" />
              <h2 className="text-lg font-extrabold">Ajouter une carte</h2>
            </div>
            <div className="space-y-4">
              <input className="ed-input" placeholder="Titulaire" value={holder} onChange={(e) => setHolder(e.target.value)} />
              <select className="ed-input" value={brand} onChange={(e) => setBrand(e.target.value as PaymentCard["brand"])}>
                <option value="Visa">Visa</option>
                <option value="Mastercard">Mastercard</option>
                <option value="Amex">American Express</option>
                <option value="Carte">Autre carte</option>
              </select>
              <input className="ed-input" inputMode="numeric" placeholder="4242 4242 4242 4242" value={number} onChange={(e) => setNumber(e.target.value)} />
              <input className="ed-input" inputMode="numeric" placeholder="MM/AA" value={expiry} onChange={(e) => setExpiry(e.target.value)} />
              <button type="submit" className="ed-primary-action w-full px-4 py-3">
                <Plus className="h-4 w-4" /> Enregistrer
              </button>
            </div>
          </form>
        </aside>

        <section>
          {message && (
            <div className="mb-5 rounded-lg border border-accent/20 bg-accent/5 p-3 text-sm font-semibold text-primary">
              {message}
            </div>
          )}

          {myBookings.length === 0 ? (
            <div className="ed-card text-center py-24 border-dashed">
              <CreditCard className="w-12 h-12 text-accent mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Aucun paiement</h2>
              <p className="text-muted-foreground">Vos paiements apparaîtront ici après une réservation.</p>
            </div>
          ) : (
            <div className="space-y-5">
              {myBookings.map((booking) => {
                const car = cars.find((c) => c.id === booking.carId);
                const paymentStatus = booking.paymentStatus ?? "unpaid";
                const payment = paymentConfig[paymentStatus];
                const canPay = booking.status !== "cancelled" && paymentStatus === "unpaid";

                return (
                  <div key={booking.id} className="ed-card p-6 flex flex-col md:flex-row md:items-center gap-5">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
                      {paymentStatus === "paid" ? <CheckCircle className="h-7 w-7" /> : <CreditCard className="h-7 w-7" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <h2 className="text-xl font-extrabold">{car?.brand} {car?.model}</h2>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${payment.className}`}>{payment.label}</span>
                      </div>
                      <p className="text-sm text-muted-foreground font-medium">
                        Réservation #{booking.id.toString().slice(-6)} · {format(new Date(booking.startDate), "dd MMM yyyy", { locale: fr })} au {format(new Date(booking.endDate), "dd MMM yyyy", { locale: fr })}
                      </p>
                      {booking.paidAt && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Payé le {format(new Date(booking.paidAt), "dd/MM/yyyy HH:mm")} · {booking.paymentMethod}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-start md:items-end gap-3">
                      <p className="text-2xl font-extrabold text-accent">{formatMAD(booking.totalPrice)}</p>
                      {canPay ? (
                        <button onClick={() => handlePay(booking.id)} className="ed-primary-action px-5 py-2.5 text-sm">
                          <CreditCard className="w-4 h-4" /> Payer avec la carte
                        </button>
                      ) : paymentStatus === "paid" ? (
                        <button onClick={() => downloadInvoicePdf(booking, car)} className="ed-secondary-action px-4 py-2.5 text-sm">
                          <Download className="w-4 h-4" /> Télécharger PDF
                        </button>
                      ) : (
                        <div className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                          <ReceiptText className="w-4 h-4" /> Facture non disponible
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
