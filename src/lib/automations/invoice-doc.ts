import { mailboxAddress } from "@/lib/mail-addresses";
import { plainTextPdf } from "@/lib/simple-pdf";
import { letterheadLines, renderLetterhead } from "@/lib/brand-comms";
import { formatNairobiDate } from "@/lib/time";
import { TRIAL_DAYS } from "@/lib/automations/trial";

export type InvoiceLine = { label: string; amountKes: number };

export type InvoiceView = {
  number: string;
  title: string;
  businessName: string;
  billTo: string;
  email: string;
  issued: string;
  due: string;
  lines: InvoiceLine[];
  totalKes: number;
  note: string;
  status: string;
};

const BRAND = "The Beacon Studio";

export function studioInvoice(input: {
  id: string;
  businessName: string;
  billTo: string;
  email: string;
  amountKes: number;
  tierName: string;
  status: string;
  due?: string;
  trial?: boolean;
  /** Founders price lock end date (ISO). Adds a line to the note. */
  priceLockUntil?: string;
}): InvoiceView {
  const lines: InvoiceLine[] = [{ label: input.tierName || "Automations", amountKes: input.amountKes }];
  if (input.trial) lines.push({ label: `Trial discount · ${TRIAL_DAYS} days free`, amountKes: 0 });
  const view: InvoiceView = {
    number: `BS-${input.id.replace(/-/g, "").slice(0, 8).toUpperCase()}`,
    title: input.status === "success" ? "Receipt" : "Invoice",
    businessName: input.businessName,
    billTo: input.billTo,
    email: input.email,
    issued: formatNairobiDate(),
    due: input.due ? formatNairobiDate(input.due) : "When the free month ends",
    lines,
    totalKes: input.status === "success" ? input.amountKes : input.trial ? 0 : input.amountKes,
    note: input.trial
      ? `Free for ${TRIAL_DAYS} days. This amount is due when the trial ends, not today.`
      : "Thank you.",
    status: input.status === "success" ? "Paid" : "Awaiting payment",
  };
  if (input.priceLockUntil) {
    view.note = `${view.note} Founders price lock: this price is kept until ${formatNairobiDate(input.priceLockUntil)}.`;
  }
  return view;
}

export function chargeInvoice(input: {
  id: string;
  businessName: string;
  customer: string;
  email?: string;
  amountKes: number;
  due?: string;
  status: string;
  note?: string;
}): InvoiceView {
  return {
    number: `BS-${input.id.replace(/-/g, "").slice(0, 8).toUpperCase()}`,
    title: input.status === "paid" ? "Receipt" : "Invoice",
    businessName: input.businessName,
    billTo: input.customer,
    email: input.email || "",
    issued: formatNairobiDate(),
    due: input.due || "On receipt",
    lines: [{ label: input.note || "Balance", amountKes: input.amountKes }],
    totalKes: input.amountKes,
    note: "Issued for the business above by The Beacon Studio.",
    status: input.status === "paid" ? "Paid" : "Unpaid",
  };
}

function money(amount: number): string {
  return `KES ${amount.toLocaleString("en-KE")}`;
}

export function invoiceText(view: InvoiceView): string[] {
  const head = letterheadLines();
  return [
    BRAND,
    head.contactStrip,
    `Billing: ${mailboxAddress("billing")}`,
    head.registration + (head.kraPin ? ` · ${head.kraPin}` : ""),
    "",
    view.title,
    `Number ${view.number}`,
    `Status ${view.status}`,
    `Issued ${view.issued}`,
    `Due ${view.due}`,
    "",
    `From ${BRAND}`,
    `To ${view.billTo}`,
    view.email,
    view.businessName,
    "",
    ...view.lines.map((line) => `${line.label}  ${money(line.amountKes)}`),
    "",
    `Total ${money(view.totalKes)}`,
    "",
    view.note,
    "",
    `Prepared by ${BRAND} · Billing`,
    head.footer(1, 1),
  ];
}

export function invoicePdf(view: InvoiceView): Buffer {
  return plainTextPdf(invoiceText(view));
}

export function invoiceHtml(view: InvoiceView, links: { pdf: string; self: string }): string {
  const rows = view.lines.map((line) => `<tr><td>${escape(line.label)}</td><td style="text-align:right">${escape(money(line.amountKes))}</td></tr>`).join("");
  return renderLetterhead({
    title: `${view.title} ${view.number}`,
    reference: view.number,
    date: `Issued ${view.issued} · Due ${view.due}`,
    preparedFor: [view.billTo, view.email, view.businessName].filter(Boolean).join(" · "),
    preparedBy: `${BRAND} · Billing (${mailboxAddress("billing")})`,
    logoSrc: "/email/beacon-mark.png",
    toolbarHtml: `<a href="${escape(links.pdf)}">Download PDF</a><button type="button" id="copy">Copy link</button><button type="button" onclick="print()">Print</button>`,
    bodyHtml: `<p><strong>Status:</strong> ${escape(view.status)}</p>
<table>${rows}<tr><td style="padding-top:14px"><strong>Total</strong></td><td style="padding-top:14px;text-align:right"><strong>${escape(money(view.totalKes))}</strong></td></tr></table>
<p>${escape(view.note)}</p>`,
    tailHtml: `<script>
    document.getElementById("copy").addEventListener("click", function () {
      navigator.clipboard.writeText(${JSON.stringify(links.self)});
      this.textContent = "Copied";
    });
  </script>`,
  });
}

function escape(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
