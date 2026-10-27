/**
 * Client-side branded PDF helpers for quotations & receipts.
 * Uses jspdf; the header places the lighthouse tile from /email/beacon-mark.png.
 * Pages always start on a light branded background (no black flash).
 */

import { siteConfig } from "@/data/site";
import { formatNairobi, NAIROBI_TZ } from "@/lib/time";
import type { QuotationRecord, ReceiptRecord } from "@/lib/documents";
import { letterheadLines, renderLetterhead } from "@/lib/brand-comms";

type JsPdf = import("jspdf").jsPDF;

const ACCENT = { r: 13, g: 148, b: 136 }; // teal
const INK = { r: 15, g: 23, b: 42 };
const MUTED = { r: 100, g: 116, b: 139 };
const PAGE_BG = { r: 248, g: 250, b: 252 }; // slate-50
const CARD_BG = { r: 255, g: 255, b: 255 };

function paintPage(pdf: JsPdf) {
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  pdf.setFillColor(PAGE_BG.r, PAGE_BG.g, PAGE_BG.b);
  pdf.rect(0, 0, pageW, pageH, "F");
}

async function logoDataUrl(): Promise<string | null> {
  try {
    const res = await fetch("/email/beacon-mark.png");
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

async function header(pdf: JsPdf, subtitle: string) {
  const pageW = pdf.internal.pageSize.getWidth();
  // Soft card strip behind brand
  pdf.setFillColor(CARD_BG.r, CARD_BG.g, CARD_BG.b);
  pdf.roundedRect(28, 20, pageW - 56, 56, 12, 12, "F");

  const logo = await logoDataUrl();
  if (logo) pdf.addImage(logo, "PNG", 40, 26, 32, 32);
  pdf.setTextColor(INK.r, INK.g, INK.b);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(16);
  pdf.text(siteConfig.brand.name, 72, 42);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.setTextColor(MUTED.r, MUTED.g, MUTED.b);
  pdf.text(siteConfig.brand.lockup, 72, 54);
  pdf.setFontSize(7.5);
  pdf.text(letterheadLines().contactStrip, 72, 66);
  pdf.setTextColor(ACCENT.r, ACCENT.g, ACCENT.b);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.text(subtitle, pageW - 40, 44, { align: "right" });
}

/** Letterhead footer on every page: prepared by, registration, page X of Y. */
function footer(pdf: JsPdf, preparedBy = `${siteConfig.brand.name} team`) {
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const head = letterheadLines();
  const pages = pdf.getNumberOfPages();
  for (let page = 1; page <= pages; page += 1) {
    pdf.setPage(page);
    pdf.setFillColor(232, 246, 243);
    pdf.roundedRect(28, pageH - 50, pageW - 56, 32, 10, 10, "F");
    pdf.setFontSize(8);
    pdf.setTextColor(MUTED.r, MUTED.g, MUTED.b);
    pdf.text([`Prepared by ${preparedBy}`, head.registration, NAIROBI_TZ, formatNairobi()].filter(Boolean).join(" · "), 40, pageH - 30);
    pdf.text(`Page ${page} of ${pages}`, pageW - 40, pageH - 30, { align: "right" });
  }
}

function money(amount: number, currency = "USD") {
  return `${currency} ${amount.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function logoSrc(): string {
  const origin = typeof window !== "undefined" ? window.location.origin : siteConfig.seo.siteUrl;
  return `${origin}/email/beacon-mark.png`;
}

export async function downloadQuotationPdf(quote: QuotationRecord): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  const pageW = pdf.internal.pageSize.getWidth();
  paintPage(pdf);
  await header(pdf, "QUOTATION");

  let y = 92;
  pdf.setTextColor(INK.r, INK.g, INK.b);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.text("Prepared for", 40, y);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  y += 16;
  pdf.text(quote.clientName, 40, y);
  y += 14;
  pdf.text(quote.clientEmail, 40, y);
  if (quote.clientCompany) {
    y += 14;
    pdf.text(quote.clientCompany, 40, y);
  }

  pdf.setFont("helvetica", "bold");
  pdf.text("Issued", pageW - 40, 92, { align: "right" });
  pdf.setFont("helvetica", "normal");
  pdf.text(formatNairobi(quote.createdAt), pageW - 40, 108, { align: "right" });
  pdf.setFont("helvetica", "bold");
  pdf.text("Valid until", pageW - 40, 128, { align: "right" });
  pdf.setFont("helvetica", "normal");
  pdf.text(formatNairobi(quote.validUntil), pageW - 40, 144, { align: "right" });

  y = Math.max(y, 156) + 20;
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.text("Scope summary", 40, y);
  y += 14;
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.setTextColor(MUTED.r, MUTED.g, MUTED.b);
  const scopeLines = pdf.splitTextToSize(quote.scopeSummary, pageW - 80);
  pdf.text(scopeLines, 40, y);
  y += scopeLines.length * 12 + 16;

  pdf.setTextColor(INK.r, INK.g, INK.b);
  pdf.setFontSize(9);
  pdf.text(`Type: ${quote.projectTypeLabel}`, 40, y);
  y += 12;
  pdf.text(`Budget band: ${quote.budgetLabel}`, 40, y);
  y += 12;
  pdf.text(`Timeline preference: ${quote.timelineLabel}`, 40, y);
  y += 12;
  pdf.text(`Estimated delivery: ${quote.timelineEstimate}`, 40, y);
  y += 24;

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.text("Line items", 40, y);
  y += 8;
  pdf.setDrawColor(230, 234, 240);
  pdf.line(40, y, pageW - 40, y);
  y += 16;

  for (const item of quote.lineItems) {
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.setTextColor(INK.r, INK.g, INK.b);
    pdf.text(item.label, 40, y);
    const range =
      item.amountFrom != null && item.amountTo != null
        ? `${money(item.amountFrom)} – ${money(item.amountTo)}`
        : "";
    if (range) pdf.text(range, pageW - 40, y, { align: "right" });
    y += 12;
    if (item.detail) {
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.setTextColor(MUTED.r, MUTED.g, MUTED.b);
      pdf.text(item.detail, 40, y);
      y += 14;
    } else {
      y += 6;
    }
  }

  y += 10;
  pdf.setDrawColor(ACCENT.r, ACCENT.g, ACCENT.b);
  pdf.setLineWidth(0.6);
  pdf.line(40, y, pageW - 40, y);
  y += 20;

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(12);
  pdf.setTextColor(INK.r, INK.g, INK.b);
  const quoteOnly = quote.costFrom === 0 && quote.costTo === 0;
  pdf.text(quoteOnly ? "Price" : "Estimated cost range", 40, y);
  pdf.text(
    quoteOnly
      ? "Quoted after a free assessment"
      : `${money(quote.costFrom, quote.currency)} – ${money(quote.costTo, quote.currency)}`,
    pageW - 40,
    y,
    { align: "right" }
  );
  y += 20;
  if (!quoteOnly) {
    pdf.setTextColor(ACCENT.r, ACCENT.g, ACCENT.b);
    pdf.text(`${quote.depositPercent}% deposit due to kick off`, 40, y);
    pdf.text(money(quote.depositAmount, quote.currency), pageW - 40, y, { align: "right" });
  }

  y += 28;
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(MUTED.r, MUTED.g, MUTED.b);
  const note = pdf.splitTextToSize(
    "This quotation is an estimate based on your intake. Final scope and price are confirmed after discovery. Deposit reserves capacity and covers kickoff.",
    pageW - 80
  );
  pdf.text(note, 40, y);

  footer(pdf);
  pdf.save(quote.filename);
}

export async function printQuotationPdf(quote: QuotationRecord): Promise<void> {
  const w = window.open("", "_blank", "noopener,noreferrer");
  if (!w) {
    await downloadQuotationPdf(quote);
    return;
  }
  w.document.write(quotationHtml(quote));
  w.document.close();
  setTimeout(() => {
    w.focus();
    w.print();
  }, 400);
}

export function quotationHtml(quote: QuotationRecord): string {
  const rows = quote.lineItems
    .map(
      (i) =>
        `<tr><td><strong>${escapeHtml(i.label)}</strong><br/><span style="color:var(--muted)">${escapeHtml(i.detail || "")}</span></td><td style="text-align:right">${i.amountFrom != null ? `$${i.amountFrom}–$${i.amountTo}` : ""}</td></tr>`
    )
    .join("");
  return renderLetterhead({
    title: "Quotation",
    reference: quote.filename,
    date: `Issued ${formatNairobi(quote.createdAt)} · Valid until ${formatNairobi(quote.validUntil)} (${NAIROBI_TZ})`,
    preparedFor: [quote.clientName, quote.clientEmail, quote.clientCompany].filter(Boolean).join(" · "),
    logoSrc: logoSrc(),
    bodyHtml: `<p><strong>Scope</strong><br/>${escapeHtml(quote.scopeSummary)}</p>
<p style="color:var(--muted)">${escapeHtml(quote.projectTypeLabel)} · ${escapeHtml(quote.budgetLabel)} · ${escapeHtml(quote.timelineLabel)}</p>
<table>${rows}</table>
<p style="font-weight:700;color:var(--accent)">${quote.costFrom === 0 && quote.costTo === 0 ? "Quoted after a free assessment" : `Cost range: $${quote.costFrom} – $${quote.costTo}<br/>${quote.depositPercent}% deposit: $${quote.depositAmount}`}</p>`,
  });
}

export async function downloadReceiptPdf(receipt: ReceiptRecord): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  const pageW = pdf.internal.pageSize.getWidth();
  paintPage(pdf);
  await header(pdf, "RECEIPT");

  let y = 96;
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.setTextColor(INK.r, INK.g, INK.b);
  pdf.text("Payment received", 40, y);
  y += 22;
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  const rows: [string, string][] = [
    ["Amount paid", money(receipt.amountPaid, receipt.currency)],
    ["Method", receipt.method],
    ["Reference", receipt.reference],
    ["Remaining balance", money(receipt.remainingBalance, receipt.currency)],
    ["Timestamp", formatNairobi(receipt.createdAt)],
  ];
  if (receipt.clientName) rows.unshift(["Client", receipt.clientName]);
  if (receipt.tierName) rows.push(["Tier / package", receipt.tierName]);

  for (const [k, v] of rows) {
    pdf.setTextColor(MUTED.r, MUTED.g, MUTED.b);
    pdf.text(k, 40, y);
    pdf.setTextColor(INK.r, INK.g, INK.b);
    pdf.text(v, pageW - 40, y, { align: "right" });
    y += 18;
  }

  y += 16;
  pdf.setFontSize(8);
  pdf.setTextColor(MUTED.r, MUTED.g, MUTED.b);
  pdf.text("Thank you — The Beacon Studio. All times Africa/Nairobi (EAT).", 40, y);

  footer(pdf, `${siteConfig.brand.name} · Billing`);
  pdf.save(receipt.filename);
}

export function receiptHtml(receipt: ReceiptRecord): string {
  return renderLetterhead({
    title: "Receipt",
    reference: receipt.reference,
    date: `${formatNairobi(receipt.createdAt)} (${NAIROBI_TZ})`,
    ...(receipt.clientName ? { preparedFor: receipt.clientName } : {}),
    preparedBy: `${siteConfig.brand.name} · Billing`,
    logoSrc: logoSrc(),
    bodyHtml: `<table>
<tr><td>Amount paid</td><td style="text-align:right"><strong>${escapeHtml(receipt.currency)} ${receipt.amountPaid}</strong></td></tr>
<tr><td>Method</td><td style="text-align:right">${escapeHtml(receipt.method)}</td></tr>
<tr><td>Reference</td><td style="text-align:right">${escapeHtml(receipt.reference)}</td></tr>
<tr><td>Remaining balance</td><td style="text-align:right">${escapeHtml(receipt.currency)} ${receipt.remainingBalance}</td></tr>
</table>
<p>Thank you for your payment.</p>`,
  });
}

export async function printReceiptPdf(receipt: ReceiptRecord): Promise<void> {
  const w = window.open("", "_blank", "noopener,noreferrer");
  if (!w) {
    await downloadReceiptPdf(receipt);
    return;
  }
  w.document.write(receiptHtml(receipt));
  w.document.close();
  setTimeout(() => {
    w.focus();
    w.print();
  }, 400);
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
