import { siteConfig } from "@/data/site";
import { extractBeaconLead } from "@/lib/beacon-ai";
import { isValidEmail, normalizeEmail } from "@/lib/validation";

export type AiLeadHint = {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  budget?: string;
  services?: string[];
};

export type ExtractedContact = {
  name: string;
  email: string;
  emails: string[];
  phone: string;
  phones: string[];
  company: string;
  budget: string;
  services: string[];
};

const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;

/** Kenyan mobile: +254 7xx/1xx, 2547…, and local 07xx / 01xx. */
const KENYAN_PHONE_RE = /(?:\+?254|0)[\s.-]?[17]\d{2}[\s.-]?\d{3}[\s.-]?\d{3}\b/g;

/** International numbers with at least 9 digits. Money amounts are rejected separately. */
const INTL_PHONE_RE = /(?:\+\d{1,3}[\s.-]?)?\d(?:[\s().-]*\d){8,14}/g;

const COMPANY_RES = [
  /\b(?:company|business|organisation|organization|church|school|ngo|sacco)\s*(?:name\s*)?(?:is|:)\s+([A-Za-z0-9][\w&'’-]{1,40}(?:\s+[A-Za-z0-9][\w&'’-]{1,40}){0,4})/i,
  /\b(?:i work at|we work at|we(?:'re| are) (?:from|at|with)|calling from|writing from)\s+([A-Za-z0-9][\w&'’-]{1,40}(?:\s+[A-Za-z0-9][\w&'’-]{1,40}){0,3})/i,
  /\b([A-Z][\w&'’]+(?:\s+[A-Z][\w&'’]*){0,3}\s+(?:Ltd|Limited|Inc|LLC|PLC))\b/,
];

const PERSON_RES = [
  /\b(?:please\s+)?(?:reach|contact|speak to|talk to)\s+([A-Z][a-z'’.-]+(?:\s+[A-Z][a-z'’.-]+){1,2})\b/,
];

const BUDGET_RES = [
  /\b(?:budget|spend|quote|around|about|up to|under)\s*(?:of|is|:)?\s*((?:KES|KSh|Ksh|USD|US\$|\$|£|€)\s?[\d,]+(?:\.\d+)?(?:\s?[kKmM])?)/i,
  /\b((?:KES|KSh|Ksh|USD|\$|£|€)\s?[\d,]+(?:\.\d+)?(?:\s?[kKmM])?)\b/,
  /\b(\d{1,3}(?:,\d{3})+|\d{4,})\s*(?:KES|KSh|ksh|kes)\b/i,
];

const SERVICE_KEYWORDS: { id: string; pattern: RegExp }[] = [
  { id: "ai-automation", pattern: /\b(ai automation|automations?|chatbot|whatsapp bot)\b/i },
  { id: "custom-software", pattern: /\b(custom software|bespoke software)\b/i },
  { id: "business-site", pattern: /\b(website|web site|business site)\b/i },
  { id: "orders-app", pattern: /\b(ordering app|take orders|online orders)\b/i },
  { id: "courses", pattern: /\b(online courses?|school management|learning platform)\b/i },
  { id: "mvp", pattern: /\b(saas|mvp|new product)\b/i },
  { id: "rebuild", pattern: /\b(redesign|rebuild)\b/i },
  { id: "internal", pattern: /\b(internal tool|staff portal|team dashboard)\b/i },
  { id: "backup-dr", pattern: /\b(backup|disaster recovery)\b/i },
  { id: "endpoint", pattern: /\b(antivirus|endpoint protection)\b/i },
  { id: "firewall", pattern: /\bfirewall\b/i },
  { id: "microsoft-365", pattern: /\b(microsoft 365|office 365|m365)\b/i },
];

const COMPANY_STOP =
  /^(the|a|an|our|my|your|this|that|some|any|just|looking|interested|here|from|at)$/i;

function studioEmail(): string {
  return normalizeEmail(siteConfig.email);
}

function studioDigits(): string {
  return canonicalPhone(siteConfig.phone);
}

export function phoneDigits(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Comparable subscriber number. +254712…, 254712…, and 0712… share the same key.
 */
export function canonicalPhone(value: string): string {
  let digits = phoneDigits(value);
  if (!digits) return "";
  if (digits.startsWith("254") && digits.length >= 12) digits = digits.slice(3);
  else if (digits.startsWith("0") && (digits.length === 10 || digits.length === 11)) digits = digits.slice(1);
  return digits;
}

export function phonesMatch(a: string, b: string): boolean {
  const left = canonicalPhone(a);
  const right = canonicalPhone(b);
  if (left.length < 9 || right.length < 9) return false;
  if (left === right) return true;
  return left.slice(-9) === right.slice(-9);
}

/** Display form. Kenyan mobiles become +254… */
export function formatPhoneDisplay(value: string): string {
  const raw = value.trim();
  const digits = phoneDigits(raw);
  if (!digits) return "";
  const local = canonicalPhone(raw);
  if ((local.startsWith("7") || local.startsWith("1")) && local.length === 9) return `+254${local}`;
  if (raw.startsWith("+")) return `+${digits}`;
  if (digits.length >= 11 && digits.length <= 15) return `+${digits}`;
  return raw.replace(/\s+/g, " ");
}

export function telHref(phone: string): string {
  const display = formatPhoneDisplay(phone);
  const digits = phoneDigits(display);
  if (digits.length < 9) return "";
  return `tel:+${digits}`;
}

export function whatsappHrefFor(phone: string, message?: string): string {
  const digits = phoneDigits(formatPhoneDisplay(phone));
  if (digits.length < 9) return "";
  const url = `https://wa.me/${digits}`;
  if (!message) return url;
  return `${url}?text=${encodeURIComponent(message)}`;
}

function isMoneyContext(text: string, index: number): boolean {
  const before = text.slice(Math.max(0, index - 8), index);
  return /(?:\$|£|€|KES|KSh|USD)\s*$/i.test(before);
}

function pushPhone(target: string[], seen: Set<string>, raw: string): void {
  const display = formatPhoneDisplay(raw);
  const key = canonicalPhone(display);
  if (key.length < 9 || key.length > 15) return;
  if (key === studioDigits()) return;
  if (seen.has(key)) return;
  seen.add(key);
  target.push(display);
}

function collectPhones(text: string): string[] {
  const phones: string[] = [];
  const seen = new Set<string>();
  const withoutEmail = text.replace(EMAIL_RE, " ");
  for (const match of withoutEmail.matchAll(KENYAN_PHONE_RE)) {
    if (match.index != null && isMoneyContext(withoutEmail, match.index)) continue;
    pushPhone(phones, seen, match[0]);
  }
  for (const match of withoutEmail.matchAll(INTL_PHONE_RE)) {
    if (match.index != null && isMoneyContext(withoutEmail, match.index)) continue;
    const digits = phoneDigits(match[0]);
    if (digits.length < 9 || digits.length > 15) continue;
    pushPhone(phones, seen, match[0]);
  }
  return phones;
}

function collectEmails(text: string): string[] {
  const found: string[] = [];
  const seen = new Set<string>();
  const studio = studioEmail();
  for (const match of text.matchAll(EMAIL_RE)) {
    const email = normalizeEmail(match[0]);
    if (!isValidEmail(email) || email === studio || seen.has(email)) continue;
    seen.add(email);
    found.push(email);
  }
  return found;
}

function tidyName(value: string): string {
  const cut = value.split(/[.,!?;]/)[0] ?? "";
  return cut.replace(/\s+/g, " ").trim().slice(0, 80);
}

function cleanCompany(value: string): string {
  let tidy = value.replace(/\s+/g, " ").trim();
  tidy = (tidy.split(/[.!?;]/)[0] ?? "").trim();
  tidy = tidy.replace(/\s+\b(?:budget|please|phone|email|call|around|about)\b.*$/i, "").trim();
  tidy = tidy.replace(/[.,;:]+$/g, "").trim();
  const first = tidy.split(/\s+/)[0] ?? "";
  if (!tidy || tidy.length < 2 || tidy.length > 80 || COMPANY_STOP.test(first)) return "";
  return tidy;
}

function collectPersonName(text: string, seeded: string): string {
  const fromHelper = tidyName(seeded);
  if (fromHelper) return fromHelper;
  for (const pattern of PERSON_RES) {
    const match = text.match(pattern);
    const name = match?.[1] ? tidyName(match[1]) : "";
    if (name.split(/\s+/).length >= 2) return name;
  }
  return "";
}

function collectCompany(text: string): string {
  for (const pattern of COMPANY_RES) {
    const match = text.match(pattern);
    const company = match?.[1] ? cleanCompany(match[1]) : "";
    if (company) return company;
  }
  return "";
}

function collectBudget(text: string): string {
  for (const budget of siteConfig.intake.budgets) {
    if (text.toLowerCase().includes(budget.label.toLowerCase())) return budget.label;
  }
  for (const pattern of BUDGET_RES) {
    const match = text.match(pattern);
    const value = match?.[1]?.replace(/\s+/g, " ").trim();
    if (value) return value.slice(0, 80);
  }
  return "";
}

function addService(target: Set<string>, id: string): void {
  if (!id) return;
  target.add(id);
}

export function collectServices(text: string): string[] {
  const found = new Set<string>();
  const lower = text.toLowerCase();
  for (const rule of SERVICE_KEYWORDS) {
    if (rule.pattern.test(text)) addService(found, rule.id);
  }
  for (const service of siteConfig.intake.projectTypes) {
    if (service.label.length >= 8 && lower.includes(service.label.toLowerCase())) addService(found, service.id);
  }
  for (const topic of siteConfig.contactTopics) {
    if (topic.label.length >= 8 && lower.includes(topic.label.toLowerCase())) addService(found, topic.id);
  }
  for (const template of siteConfig.automationCatalog.templates) {
    if (template.name.length >= 8 && lower.includes(template.name.toLowerCase())) {
      addService(found, template.id);
      addService(found, `buffet:${template.category}`);
    }
  }
  for (const category of ["Sales", "Finance", "Customers", "Operations", "Education", "Health", "Property"] as const) {
    if (new RegExp(`\\b${category.toLowerCase()}\\s+automation`, "i").test(text)) {
      addService(found, `buffet:${category}`);
    }
  }
  return [...found];
}

export function emptyExtracted(): ExtractedContact {
  return { name: "", email: "", emails: [], phone: "", phones: [], company: "", budget: "", services: [] };
}

/**
 * Regex extraction, seeded by the existing Beacon lead helper (name, email, phone).
 * Explicit form fields are applied later and win when they are non-empty.
 */
export function extractContactDetailsSync(text: string): ExtractedContact {
  const source = text || "";
  const beacon = extractBeaconLead(source);
  const emails = collectEmails(source);
  if (beacon.email) {
    const email = normalizeEmail(beacon.email);
    if (isValidEmail(email) && !emails.includes(email)) emails.unshift(email);
  }
  const phones = collectPhones(source);
  if (beacon.phone) {
    const display = formatPhoneDisplay(beacon.phone);
    const key = canonicalPhone(display);
    if (key && key !== studioDigits() && !phones.some((phone) => phonesMatch(phone, display))) {
      phones.unshift(display);
    }
  }
  const services = collectServices(source);
  return {
    name: collectPersonName(source, beacon.name),
    email: emails[0] || "",
    emails,
    phone: phones[0] || "",
    phones,
    company: collectCompany(source),
    budget: collectBudget(source),
    services,
  };
}

export function applyAiHint(base: ExtractedContact, hint: AiLeadHint | null | undefined): ExtractedContact {
  if (!hint) return base;
  const next: ExtractedContact = {
    ...base,
    emails: [...base.emails],
    phones: [...base.phones],
    services: [...base.services],
  };
  const name = hint.name?.trim() || "";
  if (!next.name && name && name.length <= 80) next.name = name;
  const email = hint.email ? normalizeEmail(hint.email) : "";
  if (email && isValidEmail(email) && email !== studioEmail()) {
    if (!next.emails.includes(email)) next.emails.push(email);
    if (!next.email) next.email = email;
  }
  const phone = hint.phone ? formatPhoneDisplay(hint.phone) : "";
  if (phone && canonicalPhone(phone).length >= 9 && canonicalPhone(phone) !== studioDigits()) {
    if (!next.phones.some((item) => phonesMatch(item, phone))) next.phones.push(phone);
    if (!next.phone) next.phone = phone;
  }
  const company = hint.company ? cleanCompany(hint.company) : "";
  if (!next.company && company) next.company = company;
  const budget = hint.budget?.replace(/\s+/g, " ").trim().slice(0, 80) || "";
  if (!next.budget && budget) next.budget = budget;
  for (const service of hint.services ?? []) {
    const label = service.trim();
    if (!label) continue;
    for (const id of collectServices(label)) {
      if (!next.services.includes(id)) next.services.push(id);
    }
    const known = siteConfig.intake.projectTypes.find(
      (item) => item.id === label || item.label.toLowerCase() === label.toLowerCase()
    );
    if (known && !next.services.includes(known.id)) next.services.push(known.id);
  }
  return next;
}

