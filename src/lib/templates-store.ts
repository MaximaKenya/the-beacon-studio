import { leadTemplates, siteConfig, type LeadTemplate } from "@/data/site";

const BRAND = "The Beacon Studio";

function csv(rows: string[][]): string {
  return rows.map((row) => row.map((cell) => (/[",\n]/.test(cell) ? `"${cell.replace(/"/g, '""')}"` : cell)).join(",")).join("\n") + "\n";
}

function footer() {
  return `${BRAND} · ${siteConfig.email} · thebeaconstudio.co.ke`;
}

const BODIES: Record<string, () => string> = {
  "rent-tracker": () =>
    csv([
      [`${BRAND} — Rent collection tracker`],
      ["Unit", "Tenant", "Phone", "Rent (KES)", "Due date", "Paid (KES)", "Paid on", "Balance (KES)", "M-Pesa ref", "Notes"],
      ["A1", "", "", "", "", "", "", "", "", ""],
      ["A2", "", "", "", "", "", "", "", "", ""],
      [footer()],
    ]),
  "fee-tracker": () =>
    csv([
      [`${BRAND} — School fee balance sheet`],
      ["Learner", "Class", "Parent", "Parent phone", "Fees billed (KES)", "Paid (KES)", "Balance (KES)", "Last reminder", "Notes"],
      ["", "", "", "", "", "", "", "", ""],
      [footer()],
    ]),
  "lead-tracker": () =>
    csv([
      [`${BRAND} — WhatsApp lead tracker`],
      ["Date", "Name", "Phone", "Asked about", "Source", "Replied (Y/N)", "Next follow-up", "Status", "Value (KES)"],
      ["", "", "", "", "", "", "", "New", ""],
      [footer()],
    ]),
  "invoice-chaser": () =>
    [
      `# Invoice follow-up checklist`,
      `_${BRAND}_`,
      "",
      "- [ ] Send the invoice the day the work is done, with your paybill or till and account number.",
      "- [ ] Day 0: confirm the client received it.",
      "- [ ] Due date minus 3 days: friendly reminder.",
      "- [ ] Due date: reminder with the exact amount and how to pay.",
      "- [ ] 7 days late: call, then send a short written follow-up.",
      "- [ ] 14 days late: pause new work and agree a payment date.",
      "- [ ] Mark it paid and send a receipt the same day.",
      "",
      `Want this on autopilot? ${footer()}`,
      "",
    ].join("\n"),
  "automation-audit": () =>
    [
      `# Automation audit checklist`,
      `_${BRAND}_`,
      "",
      "List each task, then tick the boxes that apply. Three or more ticks = automate it first.",
      "",
      "| Task | Weekly? | Same steps each time? | Takes 30+ min/week? | Errors cost money? | Customers wait on it? |",
      "| --- | --- | --- | --- | --- | --- |",
      "| | | | | | |",
      "",
      "- [ ] Reminders (fees, rent, invoices, appointments)",
      "- [ ] Replying to new enquiries",
      "- [ ] Daily or weekly reports",
      "- [ ] Follow-ups after quotes",
      "- [ ] Review requests",
      "",
      footer(),
      "",
    ].join("\n"),
};

export function templateById(id: unknown): LeadTemplate | undefined {
  return typeof id === "string" ? leadTemplates.find((item) => item.id === id) : undefined;
}

/** Downloadable file for a lead-magnet template. Every file carries the studio name. */
export function templateFile(id: string): { body: string; contentType: string; filename: string } | null {
  const template = templateById(id);
  const build = template ? BODIES[template.id] : undefined;
  if (!template || !build) return null;
  return {
    body: build(),
    contentType: template.format === "csv" ? "text/csv; charset=utf-8" : "text/markdown; charset=utf-8",
    filename: template.filename,
  };
}
