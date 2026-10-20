import { siteConfig, type CatalogTemplate } from "@/data/site";

export type FieldType =
  | "text"
  | "email"
  | "tel"
  | "url"
  | "textarea"
  | "number"
  | "date"
  | "select"
  | "entries"
  | "recipients"
  | "recurrence"
  | "channel"
  | "message"
  | "metrics"
  | "file";

export type EntryColumn = "name" | "email" | "phone" | "amountKes" | "date" | "note" | "qty" | "reorderAt" | "kind";

export type SetupField = {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  help?: string;
  placeholder?: string;
  options?: { value: string; label: string }[];
  columns?: EntryColumn[];
};

export type Behavior =
  | "lead-qualify"
  | "payment-cycle"
  | "booking"
  | "faq"
  | "review"
  | "digest"
  | "sequence"
  | "date-reminder"
  | "threshold-alert"
  | "groq-draft"
  | "inbox-triage"
  | "meeting-notes"
  | "intake"
  | "custom-reminder"
  | "custom-report";

export type HookKind = "lead" | "review" | "faq" | "intake" | "notes" | "inbox" | "rsvp" | "none";

export type TemplateDef = {
  id: string;
  behavior: Behavior;
  hook: HookKind;
  /** Public page under /a/[slug]/[page], when one exists. */
  page?: "book" | "review" | "rsvp" | "request";
  fields: SetupField[];
  demoConfig: Record<string, unknown>;
};

const moneyColumns: EntryColumn[] = ["name", "email", "phone", "amountKes", "date", "note"];
const dateColumns: EntryColumn[] = ["name", "email", "phone", "date", "kind", "note"];
const stockColumns: EntryColumn[] = ["name", "qty", "reorderAt", "note"];

const weekday = {
  key: "weekday",
  label: "Send on",
  type: "select" as const,
  options: [
    { value: "1", label: "Monday" },
    { value: "2", label: "Tuesday" },
    { value: "3", label: "Wednesday" },
    { value: "4", label: "Thursday" },
    { value: "5", label: "Friday" },
  ],
};

export const TEMPLATE_DEFS: TemplateDef[] = [
  {
    id: "lead-reply",
    behavior: "lead-qualify",
    hook: "lead",
    fields: [
      { key: "greeting", label: "Reply tone", type: "textarea", placeholder: "Warm and short. Ask one qualifying question.", help: "Groq uses this when it writes the reply." },
      { key: "qualifyNotes", label: "What a good lead looks like", type: "textarea", placeholder: "Budget, location, and a date they want to start." },
    ],
    demoConfig: { greeting: "Thanks for writing. We will reply shortly.", qualifyNotes: "They named a service and a way to reach them." },
  },
  {
    id: "abandoned-quote",
    behavior: "sequence",
    hook: "lead",
    fields: [
      { key: "steps", label: "Follow-up steps", type: "textarea", required: true, help: "One message per line. Sent a day apart.", placeholder: "Still thinking about the quote?\nHappy to adjust it.\nLast note from us on this quote." },
      { key: "entries", label: "Open quotes", type: "entries", columns: ["name", "email", "phone", "date", "note"], help: "Optional. You can also POST a quote to the webhook." },
    ],
    demoConfig: { steps: "Still thinking about the quote?\nHappy to adjust it.", entries: [{ name: "Amina", email: "demo@example.com", note: "Website quote", date: "2026-10-18" }] },
  },
  {
    id: "lead-nurture",
    behavior: "sequence",
    hook: "lead",
    fields: [
      { key: "steps", label: "Drip steps", type: "textarea", required: true, help: "One message per line. Sent every two days.", placeholder: "Welcome.\nA short story from a similar client.\nReady when you are." },
      { key: "entries", label: "Leads", type: "entries", columns: dateColumns },
    ],
    demoConfig: { steps: "Welcome.\nHere is how the first week usually goes.", entries: [] },
  },
  {
    id: "daily-sales",
    behavior: "digest",
    hook: "none",
    fields: [
      { key: "sendHour", label: "Hour to send (0–23, Nairobi)", type: "number", placeholder: "8" },
      { key: "note", label: "What to emphasise", type: "textarea", placeholder: "New leads and payments received." },
    ],
    demoConfig: { sendHour: 8, note: "New leads and payments." },
  },
  {
    id: "social-drafts",
    behavior: "groq-draft",
    hook: "none",
    fields: [
      weekday,
      { key: "topics", label: "Topics", type: "textarea", required: true, placeholder: "Monday: a customer question.\nWednesday: a tip.\nFriday: an offer." },
    ],
    demoConfig: { weekday: "1", topics: "A tip about paying on time.\nA short story about a tenant." },
  },
  {
    id: "invoice-reminders",
    behavior: "payment-cycle",
    hook: "none",
    fields: [
      { key: "entries", label: "Invoices", type: "entries", required: true, columns: moneyColumns, help: "Date is the due date. Amount is in KES." },
      { key: "csv", label: "Or paste a CSV", type: "file", help: "name,email,phone,amount,date — one invoice per line." },
    ],
    demoConfig: { entries: [{ name: "Juma Traders", email: "demo@example.com", phone: "254700000001", amountKes: 12000, date: "2026-11-02", note: "October invoice" }] },
  },
  {
    id: "subscription-renewal",
    behavior: "payment-cycle",
    hook: "none",
    fields: [
      { key: "entries", label: "Renewals", type: "entries", required: true, columns: moneyColumns, help: "Date is the renewal date." },
    ],
    demoConfig: { entries: [{ name: "Neema", email: "demo@example.com", amountKes: 3000, date: "2026-11-15", note: "Care plan" }] },
  },
  {
    id: "debt-collection",
    behavior: "payment-cycle",
    hook: "none",
    fields: [
      { key: "entries", label: "Balances", type: "entries", required: true, columns: moneyColumns, help: "Reminders escalate: polite, firm, then final. They stop when the balance is paid." },
    ],
    demoConfig: { entries: [{ name: "Ochieng", email: "demo@example.com", phone: "254700000002", amountKes: 8000, date: "2026-10-28", note: "Balance" }] },
  },
  {
    id: "sacco-repayments",
    behavior: "payment-cycle",
    hook: "none",
    fields: [
      { key: "entries", label: "Members", type: "entries", required: true, columns: moneyColumns, help: "Loan or SACCO repayment. Date is the due date." },
    ],
    demoConfig: { entries: [{ name: "Wanjiku", email: "demo@example.com", amountKes: 5000, date: "2026-11-05", note: "SACCO loan" }] },
  },
  {
    id: "appointments",
    behavior: "booking",
    hook: "none",
    page: "book",
    fields: [
      { key: "days", label: "Days", type: "text", placeholder: "1,2,3,4,5", help: "1 is Monday, 7 is Sunday." },
      { key: "start", label: "First slot", type: "text", placeholder: "09:00" },
      { key: "end", label: "Last slot starts before", type: "text", placeholder: "17:00" },
      { key: "slotMinutes", label: "Slot length (minutes)", type: "number", placeholder: "30" },
    ],
    demoConfig: { days: "1,2,3,4,5", start: "09:00", end: "16:00", slotMinutes: 30 },
  },
  {
    id: "faq-bot",
    behavior: "faq",
    hook: "faq",
    fields: [
      { key: "widgetTitle", label: "Widget title", type: "text", placeholder: "Ask us" },
      { key: "knowledge", label: "FAQ and docs", type: "textarea", required: true, help: "The bot may only use this text." },
    ],
    demoConfig: { widgetTitle: "Ask the studio", knowledge: "We reply on weekdays. A ready-made automation starts after payment. Custom work starts with a free audit." },
  },
  {
    id: "reviews",
    behavior: "review",
    hook: "review",
    page: "review",
    fields: [
      { key: "googleReviewUrl", label: "Google review link", type: "url", placeholder: "https://g.page/r/..." },
      { key: "lowScoreMax", label: "Alert you at or below", type: "number", placeholder: "3", help: "Scores are 1 to 5." },
    ],
    demoConfig: { googleReviewUrl: "https://g.page/r/demo", lowScoreMax: 3 },
  },
  {
    id: "onboarding",
    behavior: "sequence",
    hook: "lead",
    fields: [
      { key: "steps", label: "Welcome steps", type: "textarea", required: true, help: "One message per line.", placeholder: "Welcome.\nHere is how to pay.\nWe are here if you get stuck." },
      { key: "entries", label: "New customers", type: "entries", columns: dateColumns },
    ],
    demoConfig: { steps: "Welcome.\nHere is how to pay.", entries: [{ name: "Asha", email: "demo@example.com" }] },
  },
  {
    id: "greetings",
    behavior: "date-reminder",
    hook: "none",
    fields: [
      { key: "entries", label: "Dates to remember", type: "entries", required: true, columns: dateColumns, help: "Kind can be birthday or anniversary. Date is the next occurrence." },
      { key: "message", label: "Greeting", type: "message", placeholder: "Happy {{kind}}, {{name}}." },
    ],
    demoConfig: { message: "Happy {{kind}}, {{name}}.", entries: [{ name: "Asha", email: "demo@example.com", date: "2026-11-20", kind: "birthday" }] },
  },
  {
    id: "rsvp",
    behavior: "date-reminder",
    hook: "rsvp",
    page: "rsvp",
    fields: [
      { key: "eventName", label: "Event", type: "text", required: true },
      { key: "eventDate", label: "Event date", type: "date", required: true },
      { key: "entries", label: "Guests you already know", type: "entries", columns: dateColumns },
    ],
    demoConfig: { eventName: "Open day", eventDate: "2026-11-12", entries: [{ name: "Brian", email: "demo@example.com", date: "2026-11-12" }] },
  },
  {
    id: "nps",
    behavior: "review",
    hook: "review",
    page: "review",
    fields: [
      { key: "question", label: "Question", type: "text", placeholder: "How likely are you to recommend us, from 0 to 10?" },
      { key: "lowScoreMax", label: "Alert you at or below", type: "number", placeholder: "6" },
      { key: "googleReviewUrl", label: "Link for a high score", type: "url" },
    ],
    demoConfig: { question: "How likely are you to recommend us?", lowScoreMax: 6, googleReviewUrl: "https://g.page/r/demo" },
  },
  {
    id: "weekly-report",
    behavior: "digest",
    hook: "none",
    fields: [weekday, { key: "note", label: "Extra note to include", type: "textarea" }],
    demoConfig: { weekday: "1", note: "Include leads and payments." },
  },
  {
    id: "staff-shifts",
    behavior: "date-reminder",
    hook: "none",
    fields: [
      { key: "entries", label: "Shifts and tasks", type: "entries", required: true, columns: dateColumns, help: "Date is when the shift starts. Note can name the task." },
      { key: "message", label: "Reminder", type: "message", placeholder: "Hi {{name}}, you are on {{note}} at {{date}}." },
    ],
    demoConfig: { message: "Hi {{name}}, you are on {{note}} at {{date}}.", entries: [{ name: "Faith", email: "demo@example.com", date: "2026-10-27", note: "front desk" }] },
  },
  {
    id: "low-stock",
    behavior: "threshold-alert",
    hook: "none",
    fields: [
      { key: "entries", label: "Stock", type: "entries", required: true, columns: stockColumns, help: "Alert when quantity is at or below the reorder level." },
    ],
    demoConfig: { entries: [{ name: "Printer paper", qty: 2, reorderAt: 5 }] },
  },
  {
    id: "doc-expiry",
    behavior: "date-reminder",
    hook: "none",
    fields: [
      { key: "entries", label: "Documents", type: "entries", required: true, columns: dateColumns, help: "Date is the expiry. Note is the document name." },
      { key: "leadDays", label: "Days of notice", type: "number", placeholder: "14" },
    ],
    demoConfig: { leadDays: 14, entries: [{ name: "Landlord", email: "demo@example.com", date: "2026-12-01", note: "Lease" }] },
  },
  {
    id: "inbox-triage",
    behavior: "inbox-triage",
    hook: "inbox",
    fields: [
      { key: "instructions", label: "How to draft", type: "textarea", required: true, placeholder: "Be brief. Do not promise a refund. Offer a call." },
    ],
    demoConfig: { instructions: "Be brief. Do not promise a refund. Offer a call." },
  },
  {
    id: "meeting-notes",
    behavior: "meeting-notes",
    hook: "notes",
    fields: [
      { key: "instructions", label: "What to pull out", type: "textarea", placeholder: "Decisions, owners, and dates." },
    ],
    demoConfig: { instructions: "Decisions, owners, and dates." },
  },
  {
    id: "kpi-digest",
    behavior: "digest",
    hook: "none",
    fields: [
      weekday,
      { key: "metrics", label: "Metrics", type: "metrics", help: "leads, payments, messages, runs" },
      { key: "note", label: "How you read them", type: "textarea" },
    ],
    demoConfig: { weekday: "1", metrics: ["leads", "payments", "messages"], note: "Compare with last week in the note you add." },
  },
  {
    id: "school-fees",
    behavior: "payment-cycle",
    hook: "none",
    fields: [
      { key: "notice", label: "Parent notice", type: "textarea", placeholder: "Fees are due on the date below. Pay with the link." },
      { key: "entries", label: "Students", type: "entries", required: true, columns: moneyColumns },
      { key: "csv", label: "Or paste a CSV", type: "file", help: "name,email,phone,amount,date" },
    ],
    demoConfig: { notice: "School fees are due on the date in this note.", entries: [{ name: "Parent of Achieng", email: "demo@example.com", amountKes: 15000, date: "2026-11-08", note: "Term 1" }] },
  },
  {
    id: "clinic-recall",
    behavior: "date-reminder",
    hook: "none",
    fields: [
      { key: "recallDays", label: "Recall after (days)", type: "number", placeholder: "180" },
      { key: "entries", label: "Patients", type: "entries", required: true, columns: dateColumns, help: "Date is the last visit. The reminder goes out recallDays later." },
    ],
    demoConfig: { recallDays: 180, entries: [{ name: "Patient K", email: "demo@example.com", date: "2026-05-01", note: "review" }] },
  },
  {
    id: "rent-collection",
    behavior: "payment-cycle",
    hook: "none",
    fields: [
      { key: "entries", label: "Tenants", type: "entries", required: true, columns: moneyColumns, help: "Date is the rent due date." },
      { key: "csv", label: "Or paste a CSV", type: "file" },
    ],
    demoConfig: { entries: [{ name: "House 4B", email: "demo@example.com", phone: "254700000003", amountKes: 25000, date: "2026-11-05", note: "November rent" }] },
  },
  {
    id: "maintenance",
    behavior: "intake",
    hook: "intake",
    page: "request",
    fields: [
      { key: "categories", label: "Categories you accept", type: "text", placeholder: "Plumbing, power, locks" },
    ],
    demoConfig: { categories: "Plumbing, power, locks" },
  },
  {
    id: "custom-reminder",
    behavior: "custom-reminder",
    hook: "none",
    fields: [
      { key: "message", label: "Message", type: "message", required: true, help: "Use {{name}}, {{date}}, {{amount}}, {{note}}, and any custom field key.", placeholder: "Hi {{name}}, {{note}} is due on {{date}}." },
      { key: "recurrence", label: "Recurrence", type: "recurrence", required: true },
      { key: "recipients", label: "Recipients", type: "recipients", help: "Emails or phones, separated by commas. Record-level contacts are used when you add rows." },
      { key: "channel", label: "Channel", type: "channel" },
      { key: "entries", label: "Records", type: "entries", columns: moneyColumns },
      { key: "csv", label: "Or paste a CSV", type: "file" },
    ],
    demoConfig: { message: "Hi {{name}}, this is your reminder.", recurrence: "weekly", channel: "email", recipients: "demo@example.com", entries: [{ name: "Team", email: "demo@example.com", note: "weekly check" }] },
  },
  {
    id: "custom-report",
    behavior: "custom-report",
    hook: "none",
    fields: [
      { key: "metrics", label: "Metrics and sources", type: "metrics", required: true },
      { key: "recurrence", label: "Schedule", type: "recurrence", required: true },
      { key: "recipients", label: "Recipients", type: "recipients", required: true },
      { key: "note", label: "Notes to include", type: "textarea" },
      { key: "channel", label: "Channel", type: "channel" },
    ],
    demoConfig: { metrics: ["leads", "payments", "messages", "runs"], recurrence: "weekly", recipients: "demo@example.com", channel: "email", note: "Demo report" },
  },
];

export type PricedTemplate = TemplateDef & CatalogTemplate;

export function pricedTemplates(): PricedTemplate[] {
  return TEMPLATE_DEFS.map((def) => {
    const price = siteConfig.automationCatalog.templates.find((item) => item.id === def.id);
    if (!price) {
      throw new Error(`Missing site.ts price for automation ${def.id}`);
    }
    return { ...price, ...def, id: price.id };
  });
}

export function templateById(id: string): PricedTemplate | undefined {
  return pricedTemplates().find((item) => item.id === id);
}

export const AUTOMATION_CATEGORIES = [
  "Sales",
  "Finance",
  "Customers",
  "Operations",
  "Education",
  "Health",
  "Property",
  "Custom",
] as const;
