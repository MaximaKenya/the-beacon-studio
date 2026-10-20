import { siteConfig } from "@/data/site";

export const CHECKLIST_TITLE = "Free AI automation checklist for Kenyan SMEs";

export const CHECKLIST_ITEMS: { title: string; detail: string }[] = [
  {
    title: "Name one repetitive job",
    detail:
      "Pick a single loop: WhatsApp replies, fee or rent reminders, invoice follow-up, or appointment reminders. Leave the rest for later.",
  },
  {
    title: "Write the steps as they happen today",
    detail:
      "Who receives the message, what they look up, what they send back, and where they record it. Five to eight steps is enough.",
  },
  {
    title: "List the tools you already pay for",
    detail:
      "WhatsApp, SMS, email, a spreadsheet, a CRM, or M-Pesa. The first automation should sit on those tools.",
  },
  {
    title: "Decide what done looks like",
    detail:
      "A reply within an hour, a reminder the day before, or a stop when Paystack marks the invoice paid. Write that sentence down before you buy anything.",
  },
  {
    title: "Check the data you already have",
    detail:
      "Names, phone numbers, amounts, and due dates. If that list is not in one place, gather it before you automate the message.",
  },
  {
    title: "Keep only the data you need",
    detail:
      "Kenya's Data Protection Act applies. Do not collect ID numbers, medical notes, or extra contacts for a reminder.",
  },
  {
    title: "Choose who approves a message",
    detail:
      "Draft-for-review is the safer start. Auto-send fits a reminder whose wording you have already approved.",
  },
  {
    title: "Plan the stop condition",
    detail:
      "A payment reminder should stop for that person once payment is confirmed. A booking reminder should stop if they cancel.",
  },
  {
    title: "Compare ready-made and custom",
    detail:
      "Ready-made automations are KES 2,500–6,500 a month each. A custom pilot for one workflow starts at $1,350. The 20-minute audit is free.",
  },
  {
    title: "Book the audit with one job in mind",
    detail:
      `Bring the steps, the tool list, and one example message. Call ${siteConfig.phoneDisplay} or use the booking page.`,
  },
];

export function checklistLines(): string[] {
  const lines = [
    siteConfig.brand.name,
    CHECKLIST_TITLE,
    "",
    "A planning list for one repetitive workflow. Not a quote and not a client result.",
    `${siteConfig.location}. ${siteConfig.phoneDisplay}.`,
    "",
  ];
  CHECKLIST_ITEMS.forEach((item, index) => {
    lines.push(`${index + 1}. ${item.title}`);
    lines.push(item.detail);
    lines.push("");
  });
  lines.push("Next step: book the free 20-minute audit and bring one job from this list.");
  return lines;
}

export function checklistHtml(): string {
  const items = CHECKLIST_ITEMS.map(
    (item, index) =>
      `<li><strong>${index + 1}. ${escapeHtml(item.title)}</strong><p>${escapeHtml(item.detail)}</p></li>`
  ).join("");
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(CHECKLIST_TITLE)}</title>
<style>
  body { font-family: Georgia, serif; color: #1b2430; background: #f6fbfa; margin: 0; }
  main { max-width: 40rem; margin: 0 auto; padding: 2.5rem 1.25rem 4rem; }
  h1 { font-size: 1.8rem; line-height: 1.2; margin-bottom: 0.5rem; }
  .note { color: #3d5c57; }
  ol { padding-left: 1.2rem; }
  li { margin: 1rem 0; }
  p { margin: 0.35rem 0 0; line-height: 1.5; }
  @media print { body { background: #fff; } }
</style>
</head>
<body>
<main>
  <p class="note">${escapeHtml(siteConfig.brand.name)} · ${escapeHtml(siteConfig.location)}</p>
  <h1>${escapeHtml(CHECKLIST_TITLE)}</h1>
  <p>A planning list for one repetitive workflow. It is not a quote and not a client result.</p>
  <ol>${items}</ol>
  <p>Next step: book the free 20-minute audit and bring one job from this list. ${escapeHtml(siteConfig.phoneDisplay)}.</p>
</main>
</body>
</html>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
