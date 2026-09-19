/**
 * Client-side branded PDF helpers for quotations & receipts.
 * Uses jspdf; Beacon Dot mark drawn as vector shapes in the header.
 * Pages always start on a light branded background (no black flash).
 */

import { siteConfig } from "@/data/site";
import { formatNairobi, NAIROBI_TZ } from "@/lib/time";
import type { QuotationRecord, ReceiptRecord } from "@/lib/documents";

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

/** Draw Beacon Dot mark (rounded tile + geometric B + signal disc) at x,y */
export function drawBeaconMark(pdf: JsPdf, x: number, y: number, size = 22) {
  const s = size / 32;
  const px = (vx: number) => x + vx * s;
  const py = (vy: number) => y + vy * s;

  // Rounded studio tile
  pdf.setFillColor(INK.r, INK.g, INK.b);
  pdf.roundedRect(px(4), py(4), 24 * s, 24 * s, 7 * s, 7 * s, "F");

  // Accent stem
  pdf.setFillColor(ACCENT.r, ACCENT.g, ACCENT.b);
  pdf.rect(px(10.1), py(8.1), 3.7 * s, 15.8 * s, "F");

  // Accent lower bowl
  pdf.roundedRect(px(13.8), py(15.45), 9.1 * s, 9.8 * s, 3.2 * s, 3.2 * s, "F");

  // Signal disc
  pdf.circle(px(17.35), py(11.95), 4.45 * s, "F");

  // Lower counter punch (tile color)
  pdf.setFillColor(INK.r, INK.g, INK.b);
  pdf.roundedRect(px(13.8), py(18.2), 5.5 * s, 4.5 * s, 1.4 * s, 1.4 * s, "F");
}

function header(pdf: JsPdf, subtitle: string) {
  const pageW = pdf.internal.pageSize.getWidth();
  // Soft card strip behind brand
  pdf.setFillColor(CARD_BG.r, CARD_BG.g, CARD_BG.b);
  pdf.roundedRect(28, 20, pageW - 56, 48, 10, 10, "F");
  pdf.setDrawColor(226, 232, 240);
  pdf.setLineWidth(0.6);
  pdf.roundedRect(28, 20, pageW - 56, 48, 10, 10, "S");

  drawBeaconMark(pdf, 40, 28, 24);
  pdf.setTextColor(INK.r, INK.g, INK.b);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(16);
  pdf.text(siteConfig.brand.name, 72, 42);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.setTextColor(MUTED.r, MUTED.g, MUTED.b);
  pdf.text(siteConfig.brand.lockup, 72, 54);
  pdf.setTextColor(ACCENT.r, ACCENT.g, ACCENT.b);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.text(subtitle, pageW - 40, 44, { align: "right" });
}

function footer(pdf: JsPdf) {
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  pdf.setDrawColor(226, 232, 240);
  pdf.line(40, pageH - 40, pageW - 40, pageH - 40);
  pdf.setFontSize(8);
  pdf.setTextColor(MUTED.r, MUTED.g, MUTED.b);
  pdf.text(
    `${siteConfig.brand.name} · ${NAIROBI_TZ} · ${formatNairobi()}`,
    pageW / 2,
    pageH - 28,
    { align: "center" }
  );
}

function money(amount: number, currency = "USD") {
  return `${currency} ${amount.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

const PRINT_STYLES = `
  html,body{margin:0;padding:0;background:#f8fafc;color:#0f172a}
  body{font-family:system-ui,sans-serif;max-width:720px;margin:32px auto;padding:28px 28px 40px;
    background:#fff;border:1px solid #e2e8f0;border-radius:20px;box-shadow:0 12px 40px rgba(15,23,42,.06);line-height:1.5}
  .brand{display:flex;align-items:center;gap:14px;border-bottom:2px solid #0d9488;padding-bottom:16px;margin-bottom:24px}
  .mark{width:44px;height:44px;border-radius:14px;background:#f1f5f9;border:1px solid #e2e8f0;
    display:flex;align-items:center;justify-content:center}
  h1{font-size:13px;letter-spacing:.14em;color:#0d9488;margin:0}
  h2{font-size:18px;margin:0;color:#0f172a}
  .meta{color:#64748b;font-size:13px}
  table{width:100%;border-collapse:collapse;margin:16px 0}
  td{padding:10px 0;border-bottom:1px solid #e2e8f0;font-size:13px}
  .total{font-weight:700;color:#0d9488;font-size:15px}
  @media print{body{margin:12px;box-shadow:none;border-radius:12px}}
`;

function markSvg(): string {
  return `<svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M11 4H21A7 7 0 0 1 28 11V21A7 7 0 0 1 21 28H11A7 7 0 0 1 4 21V11A7 7 0 0 1 11 4Z" fill="#0f172a"/>
  <path fill-rule="evenodd" d="M16 7.6L24.4 24.2H7.6L16 7.6ZM14.15 24.2L16 20.55L17.85 24.2H14.15Z" fill="#0d9488"/>
  <circle cx="16" cy="22.75" r="1.9" fill="#0d9488"/>
</svg>`;
}

export async function downloadQuotationPdf(quote: QuotationRecord): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  const pageW = pdf.internal.pageSize.getWidth();
  paintPage(pdf);
  header(pdf, "QUOTATION");

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
  pdf.text("Estimated cost range", 40, y);
  pdf.text(
    `${money(quote.costFrom, quote.currency)} – ${money(quote.costTo, quote.currency)}`,
    pageW - 40,
    y,
    { align: "right" }
  );
  y += 20;
  pdf.setTextColor(ACCENT.r, ACCENT.g, ACCENT.b);
  pdf.text(`${quote.depositPercent}% deposit due to kick off`, 40, y);
  pdf.text(money(quote.depositAmount, quote.currency), pageW - 40, y, { align: "right" });

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
  return `<!DOCTYPE html><html><head><title>${quote.filename}</title>
<style>${PRINT_STYLES}</style></head><body>
<div class="brand"><div class="mark">${markSvg()}</div><div><h2>${siteConfig.brand.name}</h2><div class="meta">${siteConfig.brand.lockup}</div></div><div style="margin-left:auto;text-align:right"><h1>QUOTATION</h1></div></div>
<p><strong>${quote.clientName}</strong><br/>${quote.clientEmail}${quote.clientCompany ? `<br/>${quote.clientCompany}` : ""}</p>
<p class="meta">Issued ${formatNairobi(quote.createdAt)} · Valid until ${formatNairobi(quote.validUntil)} · ${NAIROBI_TZ}</p>
<p><strong>Scope</strong><br/>${escapeHtml(quote.scopeSummary)}</p>
<p class="meta">${quote.projectTypeLabel} · ${quote.budgetLabel} · ${quote.timelineLabel}</p>
<table>${quote.lineItems
    .map(
      (i) =>
        `<tr><td><strong>${escapeHtml(i.label)}</strong><br/><span class="meta">${escapeHtml(i.detail || "")}</span></td><td style="text-align:right">${i.amountFrom != null ? `$${i.amountFrom}–$${i.amountTo}` : ""}</td></tr>`
    )
    .join("")}</table>
<p class="total">Cost range: $${quote.costFrom} – $${quote.costTo}<br/>${quote.depositPercent}% deposit: $${quote.depositAmount}</p>
<p class="meta">Generated for print · ${siteConfig.brand.name}</p>
</body></html>`;
}

export async function downloadReceiptPdf(receipt: ReceiptRecord): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  const pageW = pdf.internal.pageSize.getWidth();
  paintPage(pdf);
  header(pdf, "RECEIPT");

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

  footer(pdf);
  pdf.save(receipt.filename);
}

export function receiptHtml(receipt: ReceiptRecord): string {
  return `<!DOCTYPE html><html><head><title>${receipt.filename}</title>
<style>${PRINT_STYLES}</style></head><body>
<div class="brand"><div class="mark">${markSvg()}</div><div><strong>${siteConfig.brand.name}</strong><div class="meta">${siteConfig.brand.lockup}</div></div><h1 style="margin-left:auto">RECEIPT</h1></div>
<table>
<tr><td>Amount paid</td><td style="text-align:right"><strong>${receipt.currency} ${receipt.amountPaid}</strong></td></tr>
<tr><td>Method</td><td style="text-align:right">${escapeHtml(receipt.method)}</td></tr>
<tr><td>Reference</td><td style="text-align:right">${escapeHtml(receipt.reference)}</td></tr>
<tr><td>Remaining balance</td><td style="text-align:right">${receipt.currency} ${receipt.remainingBalance}</td></tr>
<tr><td>Timestamp</td><td style="text-align:right">${formatNairobi(receipt.createdAt)} (${NAIROBI_TZ})</td></tr>
</table>
<p class="meta">Thank you — ${siteConfig.brand.name}</p>
</body></html>`;
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
