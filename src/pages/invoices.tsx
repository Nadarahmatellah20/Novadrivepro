import { Redirect } from "wouter";
import { useStore } from "@/lib/store";
import { downloadInvoicePdf } from "@/lib/invoice-pdf";
import { BRAND } from "@/lib/brand";
import { formatMAD } from "@/lib/money";
import { Download, ReceiptText } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function Invoices() {
  const { isAuthenticated, user, bookings, cars } = useStore();

  if (!isAuthenticated) return <Redirect href="/login" />;

  const myInvoices = bookings
    .filter((b) => b.userEmail === user?.email && (b.paymentStatus ?? "unpaid") !== "unpaid")
    .sort((a, b) => b.id - a.id);

  return (
    <div>
      <div className="ed-page-hero py-14 print:hidden">
        <div className="container relative z-10">
          <p className="text-accent font-bold text-sm uppercase tracking-widest mb-3">Espace client</p>
          <h1 className="text-4xl font-extrabold">Mes factures</h1>
        </div>
      </div>

      <div className="container py-10">
        {myInvoices.length === 0 ? (
          <div className="ed-card text-center py-24 border-dashed">
            <ReceiptText className="w-12 h-12 text-accent mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Aucune facture</h2>
            <p className="text-muted-foreground">Une facture sera générée après paiement.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {myInvoices.map((invoice) => {
              const car = cars.find((c) => c.id === invoice.carId);
              const tax = Math.round(invoice.totalPrice * 0.2);
              const subtotal = invoice.totalPrice - tax;

              return (
                <article key={invoice.id} className="ed-card p-7 print:shadow-none print:border print:break-after-page">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5 border-b pb-6 mb-6">
                    <div>
                      <p className="text-sm font-bold uppercase tracking-widest text-accent mb-2">Facture</p>
                      <h2 className="text-3xl font-extrabold">#{invoice.id.toString().slice(-6)}</h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        Émise le {format(new Date(invoice.paidAt ?? invoice.id), "dd MMMM yyyy", { locale: fr })}
                      </p>
                    </div>
                    <button onClick={() => downloadInvoicePdf(invoice, car)} className="ed-secondary-action px-4 py-2.5 text-sm print:hidden">
                      <Download className="w-4 h-4" /> Télécharger PDF
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-sm">
                    <div>
                      <h3 className="font-bold mb-2">Client</h3>
                      <p>{invoice.userName}</p>
                      <p className="text-muted-foreground">{invoice.userEmail}</p>
                    </div>
                    <div>
                      <h3 className="font-bold mb-2">{BRAND.name}</h3>
                      <p>Location de véhicules premium</p>
                      <p className="text-muted-foreground">{BRAND.email}</p>
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-lg border">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50 text-muted-foreground">
                        <tr>
                          <th className="px-4 py-3 text-left font-bold">Description</th>
                          <th className="px-4 py-3 text-right font-bold">Montant</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-t">
                          <td className="px-4 py-4">
                            Location {car?.brand} {car?.model}
                            <span className="block text-muted-foreground">
                              Du {format(new Date(invoice.startDate), "dd/MM/yyyy")} au {format(new Date(invoice.endDate), "dd/MM/yyyy")}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-right font-bold">{formatMAD(invoice.totalPrice)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="ml-auto mt-6 w-full max-w-sm space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Sous-total</span><span>{formatMAD(subtotal)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">TVA estimée</span><span>{formatMAD(tax)}</span></div>
                    <div className="flex justify-between border-t pt-3 text-xl font-extrabold"><span>Total payé</span><span className="text-accent">{formatMAD(invoice.totalPrice)}</span></div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
