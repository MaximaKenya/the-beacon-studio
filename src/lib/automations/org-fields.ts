/**
 * Organization inputs: the client's own business details for each automation
 * (commission %, discounts, late fees, reorder levels, SLA hours, hours of
 * work, contacts, tone, opt-out text, and their own custom fields).
 *
 * One data-driven definition for all 29 automations. Pure and client-safe:
 * the portal renders from it and the server validates with it.
 * Stored on the instance as `config.org = { values, custom, updatedAt }`.
 */

export type OrgFieldType =
  | "money"
  | "percent"
  | "integer"
  | "date"
  | "time"
  | "phone"
  | "email"
  | "url"
  | "select"
  | "multiselect"
  | "boolean"
  | "text"
  | "rows";

export type OrgSectionId =
  | "commissions"
  | "discounts"
  | "payment-terms"
  | "thresholds"
  | "hours"
  | "contacts"
  | "branding"
  | "compliance"
  | "custom";

export const ORG_SECTIONS: { id: OrgSectionId; title: string; blurb: string }[] = [
  { id: "commissions", title: "Commissions & rates", blurb: "Commission, interest and pay rates." },
  { id: "discounts", title: "Discounts & promotions", blurb: "Offers your messages can mention." },
  { id: "payment-terms", title: "Payment terms", blurb: "Due days, late fees and where to pay." },
  { id: "thresholds", title: "Thresholds & stock levels", blurb: "Targets, limits and response times." },
  { id: "hours", title: "Working hours & holidays", blurb: "When you work and when messages may go out." },
  { id: "contacts", title: "Contacts & recipients", blurb: "Who customers reach and who gets alerts." },
  { id: "branding", title: "Branding & tone", blurb: "How your messages sound and sign off." },
  { id: "compliance", title: "Compliance", blurb: "Opt-out text for texts and emails." },
  { id: "custom", title: "Custom fields", blurb: "Anything else this automation should know." },
];

export type OrgOption = { value: string; label: string };

export type OrgColumn = {
  key: string;
  label: string;
  type: Exclude<OrgFieldType, "rows" | "multiselect">;
  required?: boolean;
  options?: OrgOption[];
  min?: number;
  max?: number;
  maxLength?: number;
};

export type OrgField = {
  key: string;
  label: string;
  type: OrgFieldType;
  section: OrgSectionId;
  required?: boolean;
  help?: string;
  placeholder?: string;
  options?: OrgOption[];
  min?: number;
  max?: number;
  maxLength?: number;
  columns?: OrgColumn[];
  maxRows?: number;
  /** Existing instance.config key this field reads from and writes back to. */
  legacyKey?: string;
  /** Show this numeric value on the portal metrics chart. */
  metric?: boolean;
};

export type OrgCustomField = {
  id: string;
  label: string;
  type: Exclude<OrgFieldType, "rows">;
  options?: string[];
  value: unknown;
};

export type OrgInputs = {
  values: Record<string, unknown>;
  custom: OrgCustomField[];
  updatedAt?: string;
};

export const CUSTOM_FIELD_TYPES: Exclude<OrgFieldType, "rows">[] = [
  "text",
  "money",
  "percent",
  "integer",
  "date",
  "time",
  "phone",
  "email",
  "url",
  "boolean",
  "select",
  "multiselect",
];
export const MAX_CUSTOM_FIELDS = 20;
const DEFAULT_TEXT_MAX = 500;

/* ---------- building blocks ---------- */

const f = (field: OrgField): OrgField => field;
const money = (key: string, label: string, section: OrgSectionId, extra: Partial<OrgField> = {}) =>
  f({ key, label, type: "money", section, min: 0, max: 100_000_000, metric: true, ...extra });
const percent = (key: string, label: string, section: OrgSectionId, extra: Partial<OrgField> = {}) =>
  f({ key, label, type: "percent", section, min: 0, max: 100, metric: true, ...extra });
const int = (key: string, label: string, section: OrgSectionId, min: number, max: number, extra: Partial<OrgField> = {}) =>
  f({ key, label, type: "integer", section, min, max, metric: true, ...extra });
const text = (key: string, label: string, section: OrgSectionId, maxLength: number, extra: Partial<OrgField> = {}) =>
  f({ key, label, type: "text", section, maxLength, ...extra });

const DAYS: OrgOption[] = [
  { value: "mon", label: "Mon" },
  { value: "tue", label: "Tue" },
  { value: "wed", label: "Wed" },
  { value: "thu", label: "Thu" },
  { value: "fri", label: "Fri" },
  { value: "sat", label: "Sat" },
  { value: "sun", label: "Sun" },
];

const TONES: OrgOption[] = [
  { value: "friendly", label: "Friendly" },
  { value: "formal", label: "Formal" },
  { value: "brief", label: "Short and direct" },
];

const holidays = f({
  key: "holidays",
  label: "Holidays and closed days",
  type: "rows",
  section: "hours",
  maxRows: 40,
  columns: [
    { key: "date", label: "Date", type: "date", required: true },
    { key: "name", label: "Name", type: "text", maxLength: 60 },
  ],
});

const paybill = text("mpesaPaybill", "M-Pesa paybill or till", "payment-terms", 10, {
  help: "5 to 7 digits.",
  placeholder: "522522",
});
const accountRef = text("mpesaAccount", "Paybill account reference", "payment-terms", 30, { placeholder: "Your name or invoice number" });

/** Every automation gets these. */
const COMMON: OrgField[] = [
  text("displayName", "Business name in messages", "branding", 80, { placeholder: "Jamii Traders" }),
  f({ key: "tone", label: "Tone", type: "select", section: "branding", options: TONES }),
  text("signOff", "Sign-off", "branding", 160, { placeholder: "Asante, the Jamii team" }),
  f({ key: "contactPhone", label: "Customer contact phone", type: "phone", section: "contacts", placeholder: "0712 345 678" }),
  f({ key: "contactEmail", label: "Customer contact email", type: "email", section: "contacts" }),
  f({ key: "website", label: "Website", type: "url", section: "contacts", placeholder: "https://…" }),
  f({ key: "openTime", label: "Opens", type: "time", section: "hours", placeholder: "08:00" }),
  f({ key: "closeTime", label: "Closes", type: "time", section: "hours", placeholder: "17:00" }),
  f({ key: "workDays", label: "Working days", type: "multiselect", section: "hours", options: DAYS }),
];

/** Automations that text customers must carry opt-out text. */
const optOut = (required: boolean) =>
  text("optOutText", "Opt-out text", "compliance", 160, {
    required,
    placeholder: "Reply STOP to opt out.",
    help: "Added to every text and email this automation sends to customers.",
  });

/* ---------- per automation ---------- */

const SPECIFIC: Record<string, OrgField[]> = {
  "lead-reply": [
    int("responseSlaHours", "Reply to every lead within (hours)", "thresholds", 1, 168, { required: true }),
    money("minBudget", "Smallest budget worth a call", "thresholds"),
    percent("salesCommission", "Sales commission", "commissions"),
    f({ key: "alertEmail", label: "Send hot-lead alerts to", type: "email", section: "contacts", legacyKey: "notifyEmail" }),
    optOut(true),
  ],
  "abandoned-quote": [
    percent("followUpDiscount", "Discount to win the quote back", "discounts", { required: true, max: 90 }),
    int("offerValidDays", "Offer valid for (days)", "discounts", 1, 90),
    int("maxFollowUps", "Most follow-ups per quote", "thresholds", 1, 10),
    optOut(true),
  ],
  "lead-nurture": [
    percent("promoDiscount", "First-order discount", "discounts", { max: 90 }),
    text("promoCode", "Promo code", "discounts", 20, { placeholder: "KARIBU10" }),
    int("maxMessages", "Most drip messages per lead", "thresholds", 1, 20),
    optOut(true),
  ],
  "daily-sales": [
    money("dailyTarget", "Daily sales target", "thresholds", { required: true }),
    percent("salesCommission", "Sales commission", "commissions"),
    f({ key: "reportTime", label: "Send the summary at", type: "time", section: "hours" }),
  ],
  "social-drafts": [
    int("postsPerWeek", "Posts per week", "thresholds", 1, 21, { required: true }),
    text("hashtags", "Hashtags to use", "branding", 200, { placeholder: "#Nairobi #SmallBusiness" }),
    percent("weeklyOffer", "Offer to feature (discount)", "discounts", { max: 90 }),
  ],
  "invoice-reminders": [
    int("paymentTermsDays", "Payment terms (days after invoice)", "payment-terms", 0, 180, { required: true }),
    money("lateFee", "Late fee", "payment-terms"),
    percent("lateFeePercent", "Late fee (% of invoice)", "payment-terms", { max: 50 }),
    percent("earlyPayDiscount", "Early-payment discount", "discounts", { max: 50 }),
    paybill,
    accountRef,
    optOut(true),
  ],
  "subscription-renewal": [
    int("graceDays", "Grace period (days)", "payment-terms", 0, 60, { required: true }),
    money("lateFee", "Late fee", "payment-terms"),
    percent("annualDiscount", "Annual plan discount", "discounts", { max: 90 }),
    paybill,
    optOut(true),
  ],
  "debt-collection": [
    int("graceDays", "Grace period (days)", "payment-terms", 0, 90, { required: true }),
    percent("penaltyPercent", "Monthly penalty", "commissions", { max: 20 }),
    percent("settlementDiscount", "Settle-in-full discount", "discounts", { max: 90 }),
    int("maxReminders", "Most reminders per balance", "thresholds", 1, 10),
    f({ key: "escalationPhone", label: "Escalation contact phone", type: "phone", section: "contacts" }),
    paybill,
    optOut(true),
  ],
  "sacco-repayments": [
    percent("interestRate", "Loan interest rate (per month)", "commissions", { required: true, max: 20 }),
    money("lateFee", "Late repayment fee", "payment-terms"),
    percent("penaltyPercent", "Penalty on arrears", "payment-terms", { max: 20 }),
    f({ key: "notifyGuarantors", label: "Mention guarantors after the due date", type: "boolean", section: "compliance" }),
    paybill,
    accountRef,
    optOut(true),
  ],
  appointments: [
    int("slotMinutes", "Appointment length (minutes)", "hours", 5, 480, { required: true }),
    int("bufferMinutes", "Gap between appointments (minutes)", "hours", 0, 120),
    money("deposit", "Booking deposit", "payment-terms"),
    int("cancellationHours", "Free cancellation up to (hours before)", "payment-terms", 0, 168),
    holidays,
    optOut(true),
  ],
  "faq-bot": [
    f({ key: "escalationEmail", label: "Hand hard questions to", type: "email", section: "contacts", required: true }),
    int("handoffHours", "Promise a human reply within (hours)", "thresholds", 1, 168),
    f({
      key: "languages",
      label: "Languages",
      type: "multiselect",
      section: "branding",
      options: [
        { value: "en", label: "English" },
        { value: "sw", label: "Kiswahili" },
      ],
    }),
  ],
  reviews: [
    int("lowScoreMax", "Treat scores up to this as unhappy (1-5)", "thresholds", 1, 4, { required: true, legacyKey: "lowScoreMax" }),
    f({ key: "googleReviewUrl", label: "Google review link", type: "url", section: "contacts", legacyKey: "googleReviewUrl" }),
    percent("reviewThanksDiscount", "Thank-you discount", "discounts", { max: 50 }),
    optOut(true),
  ],
  onboarding: [
    percent("welcomeDiscount", "Welcome discount", "discounts", { max: 90 }),
    f({ key: "onboardingPhone", label: "Onboarding helpline", type: "phone", section: "contacts", required: true }),
    int("activationDays", "Expect customers active within (days)", "thresholds", 1, 90),
    optOut(true),
  ],
  greetings: [
    percent("giftDiscount", "Birthday or anniversary gift discount", "discounts", { max: 90 }),
    int("giftValidDays", "Gift valid for (days)", "discounts", 1, 90),
    f({ key: "sendTime", label: "Send greetings at", type: "time", section: "hours" }),
    optOut(true),
  ],
  rsvp: [
    int("capacity", "Seats available", "thresholds", 1, 100_000, { required: true }),
    text("venue", "Venue", "contacts", 120),
    money("ticketPrice", "Ticket price", "payment-terms"),
    f({ key: "rsvpDeadline", label: "RSVP by", type: "date", section: "hours" }),
    optOut(true),
  ],
  nps: [
    int("lowScoreMax", "Treat scores up to this as detractors (0-10)", "thresholds", 0, 9, { required: true, legacyKey: "lowScoreMax" }),
    f({ key: "alertEmail", label: "Send detractor alerts to", type: "email", section: "contacts" }),
    int("targetNps", "Target NPS", "thresholds", -100, 100),
    optOut(true),
  ],
  "weekly-report": [
    money("weeklyTarget", "Weekly revenue target", "thresholds", { required: true }),
    int("leadTarget", "Weekly lead target", "thresholds", 0, 100_000),
    f({
      key: "extraRecipients",
      label: "Also send to",
      type: "rows",
      section: "contacts",
      maxRows: 10,
      columns: [
        { key: "name", label: "Name", type: "text", maxLength: 60 },
        { key: "email", label: "Email", type: "email", required: true },
      ],
    }),
  ],
  "staff-shifts": [
    money("hourlyRate", "Hourly rate", "commissions", { required: true }),
    percent("overtimePercent", "Overtime premium", "commissions", { max: 200 }),
    int("reminderHours", "Remind staff this many hours before", "thresholds", 1, 72),
    holidays,
    optOut(false),
  ],
  "low-stock": [
    int("defaultReorderLevel", "Default reorder level", "thresholds", 0, 1_000_000, {
      required: true,
      help: "Used for any item that has no reorder level of its own.",
    }),
    int("leadTimeDays", "Supplier lead time (days)", "thresholds", 0, 120),
    percent("safetyStock", "Safety stock", "thresholds", { max: 100 }),
    f({ key: "supplierPhone", label: "Supplier phone", type: "phone", section: "contacts" }),
    f({ key: "supplierEmail", label: "Supplier email", type: "email", section: "contacts" }),
    f({
      key: "reorderLevels",
      label: "Reorder levels by item",
      type: "rows",
      section: "thresholds",
      maxRows: 200,
      columns: [
        { key: "item", label: "Item", type: "text", required: true, maxLength: 80 },
        { key: "level", label: "Reorder at", type: "integer", required: true, min: 0, max: 1_000_000 },
      ],
    }),
  ],
  "doc-expiry": [
    int("leadDays", "Remind this many days before expiry", "thresholds", 1, 365, { required: true, legacyKey: "leadDays" }),
    money("renewalFee", "Typical renewal fee", "payment-terms"),
    f({ key: "responsibleEmail", label: "Person responsible", type: "email", section: "contacts" }),
  ],
  "inbox-triage": [
    int("slaHours", "Reply to customers within (hours)", "thresholds", 1, 168, { required: true }),
    text("priorityKeywords", "Urgent keywords", "thresholds", 300, { placeholder: "refund, urgent, broken" }),
    f({ key: "escalationEmail", label: "Escalate urgent mail to", type: "email", section: "contacts" }),
  ],
  "meeting-notes": [
    f({ key: "actionOwnerEmail", label: "Send action items to", type: "email", section: "contacts", required: true }),
    int("followUpDays", "Follow up on actions after (days)", "thresholds", 1, 60),
  ],
  "kpi-digest": [
    money("revenueTarget", "Monthly revenue target", "thresholds", { required: true }),
    percent("conversionTarget", "Target lead conversion", "thresholds"),
    percent("churnAlert", "Alert when churn passes", "thresholds"),
  ],
  "school-fees": [
    money("termFee", "Fee per term", "payment-terms", { required: true }),
    money("latePenalty", "Late payment penalty", "payment-terms"),
    percent("siblingDiscount", "Sibling discount", "discounts", { max: 90 }),
    percent("bursaryPercent", "Bursary cover", "discounts"),
    f({ key: "termStart", label: "Term starts", type: "date", section: "hours" }),
    f({ key: "termEnd", label: "Term ends", type: "date", section: "hours" }),
    paybill,
    accountRef,
    optOut(true),
  ],
  "clinic-recall": [
    int("recallDays", "Recall after (days)", "thresholds", 1, 1095, { required: true, legacyKey: "recallDays" }),
    money("consultationFee", "Consultation fee", "payment-terms"),
    text("insurers", "Insurers you accept", "payment-terms", 200, { placeholder: "NHIF/SHA, Jubilee, AAR" }),
    optOut(true),
  ],
  "rent-collection": [
    int("rentDueDay", "Rent due on day of month", "payment-terms", 1, 28, { required: true }),
    int("graceDays", "Grace period (days)", "payment-terms", 0, 30),
    money("lateFee", "Late fee", "payment-terms"),
    percent("lateFeePercent", "Late fee (% of rent)", "payment-terms", { max: 50 }),
    percent("agentCommission", "Agent or caretaker commission", "commissions", { max: 50 }),
    f({ key: "caretakerPhone", label: "Caretaker phone", type: "phone", section: "contacts" }),
    paybill,
    accountRef,
    optOut(true),
  ],
  maintenance: [
    int("responseSlaHours", "Respond to requests within (hours)", "thresholds", 1, 336, { required: true }),
    money("approvalLimit", "Approve repairs up to", "thresholds"),
    f({ key: "emergencyPhone", label: "Emergency phone", type: "phone", section: "contacts" }),
  ],
  "custom-reminder": [
    f({ key: "quietStart", label: "No texts after", type: "time", section: "hours", placeholder: "20:00" }),
    f({ key: "quietEnd", label: "No texts before", type: "time", section: "hours", placeholder: "07:00" }),
    holidays,
    optOut(true),
  ],
  "custom-report": [
    money("reportTarget", "Target for this report", "thresholds", { required: true }),
    percent("kpiTarget", "KPI target", "thresholds"),
    f({
      key: "extraRecipients",
      label: "Also send to",
      type: "rows",
      section: "contacts",
      maxRows: 10,
      columns: [{ key: "email", label: "Email", type: "email", required: true }],
    }),
  ],
};

export const ORG_TEMPLATE_IDS = Object.keys(SPECIFIC);

/** Automations whose messages go to the owner or their team, not customers: no customer footer. */
export const ORG_INTERNAL_TEMPLATES = new Set([
  "daily-sales",
  "social-drafts",
  "weekly-report",
  "low-stock",
  "doc-expiry",
  "inbox-triage",
  "meeting-notes",
  "kpi-digest",
  "maintenance",
  "custom-report",
]);

/** The full field list for an automation. Specific fields override common ones with the same key. */
export function orgFieldsFor(templateId: string): OrgField[] {
  const specific = SPECIFIC[templateId] ?? [];
  const keys = new Set(specific.map((field) => field.key));
  return [...specific, ...COMMON.filter((field) => !keys.has(field.key))];
}

export function orgSectionsFor(templateId: string): { id: OrgSectionId; title: string; blurb: string; fields: OrgField[] }[] {
  const fields = orgFieldsFor(templateId);
  return ORG_SECTIONS.map((section) => ({ ...section, fields: fields.filter((field) => field.section === section.id) })).filter(
    (section) => section.fields.length > 0 || section.id === "custom"
  );
}

/* ---------- validation ---------- */

type Check = { ok: true; value: unknown } | { ok: false; error: string };

function blank(raw: unknown): boolean {
  return raw === undefined || raw === null || (typeof raw === "string" && raw.trim() === "") || (Array.isArray(raw) && raw.length === 0);
}

/** "07xx xxx xxx", "7xx…", "254…", "+254…" → "+2547…". Only 7xx and 1xx mobile ranges. */
export function strictKenyanPhone(raw: string): string | null {
  const compact = raw.replace(/[\s\-().]/g, "");
  const match = compact.match(/^(?:\+?254|0)?([17]\d{8})$/);
  return match ? `+254${match[1]}` : null;
}

function parseNumber(raw: unknown): number | null {
  if (typeof raw === "number") return Number.isFinite(raw) ? raw : null;
  if (typeof raw !== "string") return null;
  const clean = raw.trim().replace(/^(kes|ksh|kshs)\.?\s*/i, "").replace(/,/g, "").replace(/%$/, "").trim();
  if (!/^-?\d+(\.\d+)?$/.test(clean)) return null;
  return Number(clean);
}

function validDate(raw: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return false;
  const [y, m, d] = raw.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}

type Spec = Pick<OrgField, "label" | "type" | "options" | "min" | "max" | "maxLength" | "columns" | "maxRows"> & {
  key?: string;
};

/** Validate and normalise one value. Money becomes integer cents. */
export function checkValue(spec: Spec, raw: unknown): Check {
  const label = spec.label;
  switch (spec.type) {
    case "money": {
      const n = parseNumber(raw);
      if (n === null) return { ok: false, error: `${label}: enter an amount in KES, like 1500 or 1,500.50.` };
      if (Math.abs(n * 100 - Math.round(n * 100)) > 1e-6) return { ok: false, error: `${label}: at most 2 decimal places.` };
      if (n < (spec.min ?? 0)) return { ok: false, error: `${label}: cannot be negative.` };
      if (spec.max !== undefined && n > spec.max) return { ok: false, error: `${label}: at most KES ${spec.max.toLocaleString("en-KE")}.` };
      return { ok: true, value: Math.round(n * 100) };
    }
    case "percent": {
      const n = parseNumber(raw);
      if (n === null) return { ok: false, error: `${label}: enter a percentage, like 10 or 12.5.` };
      const min = spec.min ?? 0;
      const max = spec.max ?? 100;
      if (n < min || n > max) return { ok: false, error: `${label}: must be between ${min}% and ${max}%.` };
      return { ok: true, value: Math.round(n * 100) / 100 };
    }
    case "integer": {
      const n = parseNumber(raw);
      if (n === null || !Number.isInteger(n)) return { ok: false, error: `${label}: enter a whole number.` };
      if (spec.min !== undefined && n < spec.min) return { ok: false, error: `${label}: at least ${spec.min}.` };
      if (spec.max !== undefined && n > spec.max) return { ok: false, error: `${label}: at most ${spec.max}.` };
      return { ok: true, value: n };
    }
    case "date": {
      const value = String(raw).trim();
      if (!validDate(value)) return { ok: false, error: `${label}: use a real date as YYYY-MM-DD.` };
      return { ok: true, value };
    }
    case "time": {
      const value = String(raw).trim();
      const match = value.match(/^([01]?\d|2[0-3]):([0-5]\d)$/);
      if (!match) return { ok: false, error: `${label}: use 24-hour time like 08:30.` };
      return { ok: true, value: `${match[1].padStart(2, "0")}:${match[2]}` };
    }
    case "phone": {
      const phone = strictKenyanPhone(String(raw));
      if (!phone) return { ok: false, error: `${label}: use a Kenyan mobile number like 0712 345 678 or +254712345678.` };
      return { ok: true, value: phone };
    }
    case "email": {
      const value = String(raw).trim().toLowerCase();
      if (value.length > 254 || !/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(value)) return { ok: false, error: `${label}: enter an email like name@business.co.ke.` };
      return { ok: true, value };
    }
    case "url": {
      const value = String(raw).trim();
      try {
        const url = new URL(value);
        if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error("scheme");
        if (!url.hostname.includes(".")) throw new Error("host");
        if (value.length > 500) throw new Error("long");
        return { ok: true, value: url.toString() };
      } catch {
        return { ok: false, error: `${label}: enter a full link starting with https://.` };
      }
    }
    case "select": {
      const value = String(raw).trim();
      if (!(spec.options ?? []).some((option) => option.value === value)) return { ok: false, error: `${label}: pick one of the options.` };
      return { ok: true, value };
    }
    case "multiselect": {
      const list = Array.isArray(raw) ? raw.map(String) : String(raw).split(",").map((v) => v.trim()).filter(Boolean);
      const allowed = new Set((spec.options ?? []).map((option) => option.value));
      const bad = list.find((item) => !allowed.has(item));
      if (bad) return { ok: false, error: `${label}: "${bad.slice(0, 30)}" is not an option.` };
      return { ok: true, value: [...new Set(list)] };
    }
    case "boolean": {
      if (raw === true || raw === "true" || raw === "yes" || raw === "on" || raw === 1) return { ok: true, value: true };
      if (raw === false || raw === "false" || raw === "no" || raw === "off" || raw === 0) return { ok: true, value: false };
      return { ok: false, error: `${label}: choose yes or no.` };
    }
    case "text": {
      if (typeof raw !== "string" && typeof raw !== "number") return { ok: false, error: `${label}: enter text.` };
      const value = String(raw).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "").trim();
      const max = spec.maxLength ?? DEFAULT_TEXT_MAX;
      if (value.length > max) return { ok: false, error: `${label}: at most ${max} characters.` };
      if (spec.key === "mpesaPaybill" && !/^\d{5,7}$/.test(value)) return { ok: false, error: `${label}: 5 to 7 digits.` };
      return { ok: true, value };
    }
    case "rows": {
      if (!Array.isArray(raw)) return { ok: false, error: `${label}: expected a list of rows.` };
      const max = spec.maxRows ?? 50;
      if (raw.length > max) return { ok: false, error: `${label}: at most ${max} rows.` };
      const rows: Record<string, unknown>[] = [];
      for (let i = 0; i < raw.length; i += 1) {
        const row = raw[i];
        if (!row || typeof row !== "object") return { ok: false, error: `${label} row ${i + 1}: not a row.` };
        const next: Record<string, unknown> = {};
        let empty = true;
        for (const column of spec.columns ?? []) {
          const cell = (row as Record<string, unknown>)[column.key];
          if (blank(cell)) {
            if (column.required) return { ok: false, error: `${label} row ${i + 1}: ${column.label} is required.` };
            continue;
          }
          empty = false;
          const checked = checkValue({ ...column, label: `${label} row ${i + 1}: ${column.label}` }, cell);
          if (!checked.ok) return checked;
          next[column.key] = checked.value;
        }
        if (!empty) rows.push(next);
      }
      return { ok: true, value: rows };
    }
  }
}

export type OrgValidation =
  | { ok: true; org: OrgInputs; warnings: string[] }
  | { ok: false; errors: Record<string, string>; message: string };

function slugKey(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 40);
}

/**
 * Validate everything the client entered. Unknown keys are dropped; blank
 * optional fields are removed. Required fields may be blank on save (the
 * completeness meter shows them), unless `requireAll` is set.
 */
export function validateOrgInputs(templateId: string, input: unknown, opts: { requireAll?: boolean } = {}): OrgValidation {
  const body = input && typeof input === "object" ? (input as Record<string, unknown>) : {};
  const rawValues = body.values && typeof body.values === "object" ? (body.values as Record<string, unknown>) : {};
  const errors: Record<string, string> = {};
  const values: Record<string, unknown> = {};
  for (const field of orgFieldsFor(templateId)) {
    const raw = rawValues[field.key];
    if (blank(raw)) {
      if (opts.requireAll && field.required) errors[field.key] = `${field.label} is required.`;
      continue;
    }
    const checked = checkValue(field, raw);
    if (checked.ok) values[field.key] = checked.value;
    else errors[field.key] = checked.error;
  }

  const custom: OrgCustomField[] = [];
  const rawCustom = Array.isArray(body.custom) ? body.custom : [];
  if (rawCustom.length > MAX_CUSTOM_FIELDS) errors.custom = `At most ${MAX_CUSTOM_FIELDS} custom fields.`;
  const seen = new Set<string>();
  rawCustom.slice(0, MAX_CUSTOM_FIELDS).forEach((item, index) => {
    const where = `custom.${index}`;
    if (!item || typeof item !== "object") {
      errors[where] = `Custom field ${index + 1}: not a field.`;
      return;
    }
    const row = item as Record<string, unknown>;
    const label = typeof row.label === "string" ? row.label.trim() : "";
    if (!label || label.length > 60) {
      errors[where] = `Custom field ${index + 1}: give it a name of 1 to 60 characters.`;
      return;
    }
    const type = row.type as OrgCustomField["type"];
    if (!CUSTOM_FIELD_TYPES.includes(type)) {
      errors[where] = `${label}: pick a field type.`;
      return;
    }
    const id = slugKey(typeof row.id === "string" && row.id ? row.id : label) || `field_${index + 1}`;
    if (seen.has(id)) {
      errors[where] = `${label}: two custom fields share this name.`;
      return;
    }
    seen.add(id);
    const options =
      type === "select" || type === "multiselect"
        ? (Array.isArray(row.options) ? row.options : String(row.options || "").split(","))
            .map((option) => String(option).trim().slice(0, 40))
            .filter(Boolean)
            .slice(0, 30)
        : undefined;
    if (options && options.length === 0) {
      errors[where] = `${label}: add at least one option.`;
      return;
    }
    let value: unknown = null;
    if (!blank(row.value)) {
      const checked = checkValue(
        { label, type, maxLength: 500, options: options?.map((option) => ({ value: option, label: option })), min: type === "integer" ? -1_000_000_000 : undefined, max: type === "money" ? 100_000_000 : undefined },
        row.value
      );
      if (!checked.ok) {
        errors[where] = checked.error;
        return;
      }
      value = checked.value;
    }
    custom.push({ id, label, type, ...(options ? { options } : {}), value });
  });

  const keys = Object.keys(errors);
  if (keys.length) return { ok: false, errors, message: errors[keys[0]] };
  return { ok: true, org: { values, custom }, warnings: [] };
}

/* ---------- reading saved config (backward compatible) ---------- */

/** The org inputs saved on an instance, with legacy config keys filled in. */
export function readOrgInputs(templateId: string, config: Record<string, unknown> | undefined): OrgInputs {
  const saved = config?.org && typeof config.org === "object" ? (config.org as Partial<OrgInputs>) : {};
  const values: Record<string, unknown> = { ...(saved.values && typeof saved.values === "object" ? saved.values : {}) };
  for (const field of orgFieldsFor(templateId)) {
    if (!field.legacyKey || !blank(values[field.key])) continue;
    const legacy = config?.[field.legacyKey];
    if (blank(legacy)) continue;
    const checked = checkValue(field, legacy);
    if (checked.ok) values[field.key] = checked.value;
  }
  return {
    values,
    custom: Array.isArray(saved.custom) ? (saved.custom as OrgCustomField[]) : [],
    ...(saved.updatedAt ? { updatedAt: saved.updatedAt } : {}),
  };
}

/** Write org inputs onto a config, mirroring legacy keys so older engine paths see them. */
export function applyOrgInputs(templateId: string, config: Record<string, unknown>, org: OrgInputs, now = new Date()): Record<string, unknown> {
  const next: Record<string, unknown> = { ...config, org: { ...org, updatedAt: now.toISOString() } };
  for (const field of orgFieldsFor(templateId)) {
    if (!field.legacyKey) continue;
    const value = org.values[field.key];
    if (blank(value)) continue;
    next[field.legacyKey] = value;
  }
  return next;
}

export type OrgCompleteness = {
  filled: number;
  total: number;
  percent: number;
  requiredMissing: { key: string; label: string; section: OrgSectionId }[];
  ready: boolean;
};

export function orgCompleteness(templateId: string, org: OrgInputs): OrgCompleteness {
  const fields = orgFieldsFor(templateId);
  const filled = fields.filter((field) => !blank(org.values[field.key])).length;
  const requiredMissing = fields
    .filter((field) => field.required && blank(org.values[field.key]))
    .map((field) => ({ key: field.key, label: field.label, section: field.section }));
  const total = fields.length;
  return {
    filled,
    total,
    percent: total ? Math.round((filled / total) * 100) : 100,
    requiredMissing,
    ready: requiredMissing.length === 0,
  };
}

/* ---------- feeding the engine ---------- */

export function formatKesCents(cents: number): string {
  const kes = cents / 100;
  return `KES ${kes.toLocaleString("en-KE", { minimumFractionDigits: Number.isInteger(kes) ? 0 : 2, maximumFractionDigits: 2 })}`;
}

function display(type: OrgFieldType, value: unknown): string {
  if (value === undefined || value === null) return "";
  if (type === "money" && typeof value === "number") return formatKesCents(value);
  if (type === "percent" && typeof value === "number") return `${value}%`;
  if (type === "boolean") return value ? "yes" : "no";
  if (Array.isArray(value)) {
    return value.map((item) => (item && typeof item === "object" ? Object.values(item).join(" ") : String(item))).join(", ");
  }
  return String(value);
}

/**
 * Flat variables for message templates: `{{lateFee}}` → "KES 500",
 * `{{lateFeeKes}}` → 500, `{{commission}}` → "10%". Custom fields use their id.
 */
export function orgTemplateVars(templateId: string, config: Record<string, unknown> | undefined): Record<string, string | number> {
  const org = readOrgInputs(templateId, config);
  const vars: Record<string, string | number> = {};
  for (const field of orgFieldsFor(templateId)) {
    const value = org.values[field.key];
    if (blank(value)) continue;
    vars[field.key] = display(field.type, value);
    if (field.type === "money" && typeof value === "number") vars[`${field.key}Kes`] = value / 100;
  }
  for (const item of org.custom) {
    if (blank(item.value)) continue;
    vars[item.id] = display(item.type, item.value);
  }
  return vars;
}

/** Numbers the engine uses directly (KES not cents; percents as numbers). */
export function orgNumber(templateId: string, config: Record<string, unknown> | undefined, key: string): number | null {
  const field = orgFieldsFor(templateId).find((item) => item.key === key);
  const value = readOrgInputs(templateId, config).values[key];
  if (typeof value !== "number") return null;
  return field?.type === "money" ? value / 100 : value;
}

export function orgText(templateId: string, config: Record<string, unknown> | undefined, key: string): string {
  const value = readOrgInputs(templateId, config).values[key];
  return typeof value === "string" ? value : "";
}

/** Numeric org values for the portal chart. */
export function orgMetrics(templateId: string, config: Record<string, unknown> | undefined): { label: string; value: number; display: string }[] {
  const org = readOrgInputs(templateId, config);
  const out: { label: string; value: number; display: string }[] = [];
  for (const field of orgFieldsFor(templateId)) {
    const value = org.values[field.key];
    if (!field.metric || typeof value !== "number") continue;
    const shown = field.type === "money" ? value / 100 : value;
    out.push({ label: field.label, value: shown, display: display(field.type, value) });
  }
  for (const item of org.custom) {
    if (typeof item.value !== "number") continue;
    if (item.type !== "money" && item.type !== "percent" && item.type !== "integer") continue;
    out.push({ label: item.label, value: item.type === "money" ? item.value / 100 : item.value, display: display(item.type, item.value) });
  }
  return out;
}

/**
 * Lines added to customer messages: payment terms, offers, sign-off, contact
 * and opt-out text. Only fields the client filled appear.
 */
export function orgMessageFooter(templateId: string, config: Record<string, unknown> | undefined, audience: "customer" | "owner"): string {
  const vars = orgTemplateVars(templateId, config);
  const lines: string[] = [];
  if (audience === "customer") {
    if (vars.mpesaPaybill) lines.push(`Pay via M-Pesa paybill ${vars.mpesaPaybill}${vars.mpesaAccount ? `, account ${vars.mpesaAccount}` : ""}.`);
    if (vars.lateFee) lines.push(`A late fee of ${vars.lateFee} applies after the due date${vars.graceDays ? ` plus ${vars.graceDays} days` : ""}.`);
    else if (vars.lateFeePercent) lines.push(`A late fee of ${vars.lateFeePercent} applies after the due date.`);
    if (vars.earlyPayDiscount) lines.push(`Pay early and get ${vars.earlyPayDiscount} off.`);
    if (vars.settlementDiscount) lines.push(`Settle in full and get ${vars.settlementDiscount} off.`);
    if (vars.followUpDiscount) lines.push(`We can offer ${vars.followUpDiscount} off${vars.offerValidDays ? ` for the next ${vars.offerValidDays} days` : ""}.`);
    if (vars.promoDiscount) lines.push(`Enjoy ${vars.promoDiscount} off your first order${vars.promoCode ? ` with code ${vars.promoCode}` : ""}.`);
    if (vars.welcomeDiscount) lines.push(`Welcome offer: ${vars.welcomeDiscount} off.`);
    if (vars.giftDiscount) lines.push(`A gift from us: ${vars.giftDiscount} off${vars.giftValidDays ? ` for ${vars.giftValidDays} days` : ""}.`);
    if (vars.responseSlaHours) lines.push(`We reply within ${vars.responseSlaHours} hours.`);
    if (vars.signOff) lines.push(String(vars.signOff));
    const contact = [vars.contactPhone, vars.contactEmail, vars.website].filter(Boolean).join(" · ");
    if (contact) lines.push(contact);
    if (vars.optOutText) lines.push(String(vars.optOutText));
  }
  return lines.join("\n");
}
