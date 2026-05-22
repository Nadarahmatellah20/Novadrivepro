import type { Booking, Car } from "@/lib/store";
import { BRAND } from "@/lib/brand";
import { formatMAD } from "@/lib/money";

function escapePdfText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)").replace(/[^\x20-\x7E]/g, "");
}

function line(text: string, x: number, y: number, size = 11) {
  return `BT /F1 ${size} Tf ${x} ${y} Td (${escapePdfText(text)}) Tj ET`;
}

function buildPdf(lines: string[]) {
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${lines.join("\n").length} >>\nstream\n${lines.join("\n")}\nendstream`,
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return pdf;
}

export function downloadInvoicePdf(invoice: Booking, car?: Car) {
  const invoiceNumber = `FAC-${invoice.id.toString().slice(-6)}`;
  const paidAt = invoice.paidAt ? new Date(invoice.paidAt) : new Date(invoice.id);
  const tax = Math.round(invoice.totalPrice * 0.2);
  const subtotal = invoice.totalPrice - tax;
  const vehicle = car ? `${car.brand} ${car.model}` : "Vehicule";
  const content = [
    line(BRAND.name, 48, 790, 22),
    line("Facture de location", 48, 762, 14),
    line(invoiceNumber, 430, 790, 16),
    line(`Emise le ${paidAt.toLocaleDateString("fr-FR")}`, 430, 766, 10),
    line("Client", 48, 710, 13),
    line(invoice.userName, 48, 690),
    line(invoice.userEmail, 48, 672),
    line(BRAND.name, 330, 710, 13),
    line("Location de vehicules premium", 330, 690),
    line(BRAND.email, 330, 672),
    line("Description", 48, 610, 12),
    line("Montant", 455, 610, 12),
    "48 596 m 545 596 l S",
    line(`Location ${vehicle}`, 48, 570),
    line(`Du ${new Date(invoice.startDate).toLocaleDateString("fr-FR")} au ${new Date(invoice.endDate).toLocaleDateString("fr-FR")}`, 48, 552, 10),
    line(formatMAD(invoice.totalPrice), 455, 570),
    line(`Methode: ${invoice.paymentMethod ?? "Carte bancaire"}`, 48, 520, 10),
    line(`Sous-total: ${formatMAD(subtotal)}`, 390, 470),
    line(`TVA estimee: ${formatMAD(tax)}`, 390, 448),
    "388 434 m 545 434 l S",
    line(`Total paye: ${formatMAD(invoice.totalPrice)}`, 390, 410, 14),
    line("Merci pour votre confiance.", 48, 92, 10),
  ];
  const blob = new Blob([buildPdf(content)], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${invoiceNumber}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
