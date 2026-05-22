import { Redirect } from "wouter";
import { useStore } from "@/lib/store";
import { downloadInvoicePdf } from "@/lib/invoice-pdf";
import { formatMAD } from "@/lib/money";
import { Download, ReceiptText } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function AdminInvoices() {
  const { user, isAuthenticated, bookings, cars } = useStore();

  if (!isAuthenticated || !user?.isAdmin) return <Redirect href="/" />;

  const invoices = [...bookings]
    .filter((b) => (b.paymentStatus ?? "unpaid") !== "unpaid")
    .sort((a, b) => b.id - a.id);

  return (
    <div>
      <div className="ed-page-hero py-14 print:hidden">
        <div className="container relative z-10">
          <p className="text-accent font-bold text-sm uppercase tracking-widest mb-3">Administration</p>
          <h1 className="text-4xl font-extrabold">Factures clients</h1>
          <p className="text-white/60 mt-2">{invoices.length} facture{invoices.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      <div className="container py-10">
        <div className="ed-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  {["Facture", "Client", "Véhicule", "Date", "Montant", "Action"].map((h) => (
                    <th key={h} className="px-6 py-4 font-bold text-xs uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center text-muted-foreground">
                      <ReceiptText className="w-10 h-10 mx-auto mb-3 text-accent" />
                      Aucune facture générée
                    </td>
                  </tr>
                ) : invoices.map((invoice) => {
                  const car = cars.find((c) => c.id === invoice.carId);
                  return (
                    <tr key={invoice.id} className="hover:bg-muted/20">
                      <td className="px-6 py-4 font-mono text-xs text-muted-foreground">FAC-{invoice.id.toString().slice(-6)}</td>
                      <td className="px-6 py-4">
                        <div className="font-semibold">{invoice.userName}</div>
                        <div className="text-muted-foreground text-xs">{invoice.userEmail}</div>
                      </td>
                      <td className="px-6 py-4">{car?.brand} {car?.model}</td>
                      <td className="px-6 py-4">{format(new Date(invoice.paidAt ?? invoice.id), "dd MMM yyyy", { locale: fr })}</td>
                      <td className="px-6 py-4 font-extrabold text-accent">{formatMAD(invoice.totalPrice)}</td>
                      <td className="px-6 py-4">
                        <button onClick={() => downloadInvoicePdf(invoice, car)} className="ed-secondary-action px-3 py-2 text-xs">
                          <Download className="w-4 h-4" /> PDF
                        </button>
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
