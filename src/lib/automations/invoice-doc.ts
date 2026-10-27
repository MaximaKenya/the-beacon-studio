import { mailboxAddress } from "@/lib/mail-addresses";
import { plainTextPdf } from "@/lib/simple-pdf";
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
  return [
    BRAND,
    mailboxAddress("billing"),
    "thebeaconstudio.co.ke",
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
  ];
}

export function invoicePdf(view: InvoiceView): Buffer {
  return plainTextPdf(invoiceText(view));
}

export function invoiceHtml(view: InvoiceView, links: { pdf: string; self: string }): string {
  const rows = view.lines
    .map(
      (line) => `<tr><td style="padding:10px 0;border-bottom:1px solid rgba(12,110,100,.12)">${escape(line.label)}</td><td style="padding:10px 0;text-align:right;border-bottom:1px solid rgba(12,110,100,.12)">${escape(money(line.amountKes))}</td></tr>`
    )
    .join("");
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escape(view.number)} · ${BRAND}</title>
  <style>
    body { margin: 0; font-family: Georgia, "Iowan Old Style", serif; background: #f4fbfa; color: #14312e; }
    main { max-width: 720px; margin: 32px auto; padding: 28px; background: rgba(255,255,255,.86); border-radius: 28px; box-shadow: 0 24px 60px rgba(12, 110, 100, .12); }
    header { display: flex; gap: 16px; align-items: center; }
    img { width: 56px; height: 56px; }
    h1 { font-size: 28px; margin: 0; }
    p, td, th { font-family: "Avenir Next", "Segoe UI", sans-serif; }
    .muted { color: #4d6b66; }
    .actions { display: flex; flex-wrap: wrap; gap: 8px; margin: 18px 0; }
    a.btn, button.btn { border: 0; border-radius: 999px; padding: 10px 14px; background: #0c6e64; color: white; text-decoration: none; font-weight: 700; cursor: pointer; }
    table { width: 100%; border-collapse: collapse; }
    @media print { .actions { display: none; } body { background: white; } main { box-shadow: none; } }
  </style>
</head>
<body>
  <main>
    <header>
      <img src="/email/beacon-mark.png" alt="The Beacon Studio lighthouse" />
      <div>
        <h1>${BRAND}</h1>
        <p class="muted">${mailboxAddress("billing")} · thebeaconstudio.co.ke</p>
      </div>
    </header>
    <div class="actions">
      <a class="btn" href="${escape(links.pdf)}">Download PDF</a>
      <button class="btn" type="button" id="copy">Copy link</button>
      <button class="btn" type="button" onclick="print()">Print</button>
    </div>
    <p><strong>${escape(view.title)} ${escape(view.number)}</strong> · ${escape(view.status)}</p>
    <p class="muted">Issued ${escape(view.issued)} · Due ${escape(view.due)}</p>
    <p>To ${escape(view.billTo)}${view.email ? ` · ${escape(view.email)}` : ""}<br/>${escape(view.businessName)}</p>
    <table>${rows}<tr><td style="padding-top:12px"><strong>Total</strong></td><td style="padding-top:12px;text-align:right"><strong>${escape(money(view.totalKes))}</strong></td></tr></table>
    <p>${escape(view.note)}</p>
  </main>
  <script>
    document.getElementById("copy").addEventListener("click", function () {
      navigator.clipboard.writeText(${JSON.stringify(links.self)});
      this.textContent = "Copied";
    });
  </script>
</body>
</html>`;
}

function escape(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
