import { randomUUID } from "crypto";
import { extractContactDetails } from "@/lib/lead-extract-ai";
import {
  applyAiHint,
  canonicalPhone,
  collectServices,
  extractContactDetailsSync,
  formatPhoneDisplay,
  phonesMatch,
  type AiLeadHint,
  type ExtractedContact,
} from "@/lib/lead-extract";
import {
  budgetLabel,
  categoryLabel,
  channelFor,
  isLeadStatus,
  scoreLead,
  type LeadStatus,
  type StudioLead,
} from "@/lib/lead-model";
import { readJsonFile, writeJsonFile } from "@/lib/storage";
import { isValidEmail, normalizeEmail } from "@/lib/validation";

export {
  LEAD_CHANNELS,
  LEAD_STATUSES,
  budgetLabel,
  categoryLabel,
  categoryOptions,
  channelFor,
  channelLabel,
  emptyLeadFilters,
  filterLeads,
  filtersFromSearchParams,
  isLeadStatus,
  leadCategoryLabel,
  matchesLeadFilters,
  scoreBand,
  scoreLead,
  sourceOptions,
  writeFiltersToParams,
} from "@/lib/lead-model";
export type { LeadFilters, LeadStatus, StudioLead } from "@/lib/lead-model";

export const LEADS_FILE = "leads.json";

export type LeadDraft = {
  kind: string;
  sourceId?: string;
  source?: string;
  channel?: string;
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  budget?: string;
  services?: string[];
  category?: string;
  message?: string;
  status?: LeadStatus;
  /** Tags or summary from the mailbox AI helper. */
  aiHint?: AiLeadHint | null;
};

const GENERIC_NAME = /^(unknown|guest|visitor|website|client|there)$/i;

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function refFor(kind: string, sourceId: string): string {
  return sourceId ? `${kind}:${sourceId}` : "";
}

function preferName(current: string, incoming: string): string {
  if (!incoming || GENERIC_NAME.test(incoming)) return current;
  if (!current || GENERIC_NAME.test(current)) return incoming;
  return current;
}

export function composeDraft(input: LeadDraft, extracted: ExtractedContact): LeadDraft & { email: string; phone: string } {
  const email = normalizeEmail(text(input.email) || extracted.email);
  const phoneRaw = text(input.phone) || extracted.phone;
  const phone = phoneRaw ? formatPhoneDisplay(phoneRaw) : "";
  const services = [...new Set([...(input.services ?? []).filter(Boolean), ...extracted.services])];
  const channel = input.channel || channelFor(text(input.source), input.kind);
  return {
    ...input,
    name: preferName(text(input.name), extracted.name),
    email: email && isValidEmail(email) ? email : "",
    phone: canonicalPhone(phone).length >= 9 ? phone : "",
    company: text(input.company) || extracted.company,
    budget: budgetLabel(text(input.budget) || extracted.budget),
    services,
    category: text(input.category) || services.map(categoryLabel).filter(Boolean).join(", "),
    message: text(input.message),
    source: text(input.source) || channel,
    channel,
  };
}

export function findMatchingLead(leads: StudioLead[], draft: { email?: string; phone?: string; kind?: string; sourceId?: string }): StudioLead | undefined {
  const ref = refFor(draft.kind || "", draft.sourceId || "");
  if (ref) {
    const byRef = leads.find((lead) => lead.refs.includes(ref) || (lead.kind === draft.kind && lead.sourceId === draft.sourceId));
    if (byRef) return byRef;
  }
  const email = draft.email ? normalizeEmail(draft.email) : "";
  if (email) {
    const byEmail = leads.find((lead) => lead.email && normalizeEmail(lead.email) === email);
    if (byEmail) return byEmail;
  }
  const phone = draft.phone || "";
  if (canonicalPhone(phone).length >= 9) {
    return leads.find((lead) => lead.phone && phonesMatch(lead.phone, phone));
  }
  return undefined;
}

function appendMessage(current: string, incoming: string): string {
  const next = incoming.trim();
  if (!next) return current;
  if (!current.trim()) return next.slice(0, 8000);
  const compact = (value: string) => value.replace(/\s+/g, " ").trim();
  if (compact(current).includes(compact(next))) return current;
  return `${current}\n---\n${next}`.slice(0, 8000);
}

export function mergeLead(existing: StudioLead, draft: ReturnType<typeof composeDraft>): { lead: StudioLead; changed: boolean } {
  const lead: StudioLead = {
    ...existing,
    services: [...existing.services],
    sources: [...existing.sources],
    refs: [...existing.refs],
  };
  let changed = false;
  const fill = (key: "email" | "phone" | "company" | "budget" | "category", value: string) => {
    if (!value || lead[key]) return;
    lead[key] = value;
    changed = true;
  };
  const name = preferName(lead.name, draft.name || "");
  if (name !== lead.name) {
    lead.name = name;
    changed = true;
  }
  fill("email", draft.email);
  fill("phone", draft.phone);
  fill("company", draft.company || "");
  fill("budget", draft.budget || "");
  for (const service of draft.services ?? []) {
    if (!lead.services.includes(service)) {
      lead.services.push(service);
      changed = true;
    }
  }
  const fromServices = lead.services.map(categoryLabel).filter(Boolean).join(", ");
  const explicit = (draft.category || "").trim();
  const category = explicit.length > fromServices.length ? explicit : fromServices;
  if (category && category !== lead.category) {
    lead.category = category;
    changed = true;
  }
  if (draft.channel && !lead.sources.includes(draft.channel)) {
    lead.sources.push(draft.channel);
    changed = true;
  }
  const ref = refFor(draft.kind, draft.sourceId || "");
  if (ref && !lead.refs.includes(ref)) {
    lead.refs.push(ref);
    changed = true;
  }
  const message = appendMessage(lead.message, draft.message || "");
  if (message !== lead.message) {
    lead.message = message;
    changed = true;
  }
  const score = scoreLead(lead);
  if (score !== lead.score) {
    lead.score = score;
    changed = true;
  }
  if (changed) lead.updatedAt = new Date().toISOString();
  return { lead, changed };
}

function draftToLead(draft: ReturnType<typeof composeDraft>): StudioLead | null {
  if (!draft.email && !draft.phone) return null;
  const now = new Date().toISOString();
  const channel = draft.channel || "other";
  const services = draft.services ?? [];
  const lead: StudioLead = {
    id: randomUUID(),
    createdAt: now,
    updatedAt: now,
    name: draft.name || "Unknown",
    email: draft.email,
    phone: draft.phone,
    company: draft.company || "",
    budget: draft.budget || "",
    services,
    category: draft.category || services.map(categoryLabel).filter(Boolean).join(", "),
    source: draft.source || channel,
    channel,
    sources: [channel],
    status: draft.status && isLeadStatus(draft.status) ? draft.status : "new",
    score: 0,
    message: (draft.message || "").slice(0, 8000),
    kind: draft.kind,
    sourceId: draft.sourceId || "",
    refs: refFor(draft.kind, draft.sourceId || "") ? [refFor(draft.kind, draft.sourceId || "")] : [],
  };
  lead.score = scoreLead(lead);
  return lead;
}

export function upsertLeadList(leads: StudioLead[], draft: ReturnType<typeof composeDraft>): { leads: StudioLead[]; lead: StudioLead | null; created: boolean; changed: boolean } {
  const existing = findMatchingLead(leads, draft);
  if (!existing) {
    const created = draftToLead(draft);
    if (!created) return { leads, lead: null, created: false, changed: false };
    return { leads: [created, ...leads], lead: created, created: true, changed: true };
  }
  const merged = mergeLead(existing, draft);
  if (!merged.changed) return { leads, lead: existing, created: false, changed: false };
  return {
    leads: leads.map((lead) => (lead.id === existing.id ? merged.lead : lead)),
    lead: merged.lead,
    created: false,
    changed: true,
  };
}

async function readLeads(): Promise<StudioLead[]> {
  const rows = await readJsonFile<StudioLead[]>(LEADS_FILE, []);
  return Array.isArray(rows) ? rows : [];
}

async function extractedFor(draft: LeadDraft, ai: boolean): Promise<ExtractedContact> {
  const message = draft.message || "";
  const base = applyAiHint(extractContactDetailsSync(message), draft.aiHint);
  if (!ai || !message.trim()) return base;
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const enriched = await Promise.race([
      extractContactDetails(message),
      new Promise<ExtractedContact>((resolve) => {
        timer = setTimeout(() => resolve(base), 3500);
      }),
    ]);
    return applyAiHint(enriched, draft.aiHint);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export async function captureLead(input: LeadDraft, options?: { ai?: boolean }): Promise<StudioLead | null> {
  const extracted = await extractedFor(input, options?.ai !== false);
  const draft = composeDraft(input, extracted);
  const leads = await readLeads();
  const result = upsertLeadList(leads, draft);
  if (result.changed) await writeJsonFile(LEADS_FILE, result.leads);
  return result.lead;
}

type LooseRow = {
  id?: string;
  createdAt?: string;
  submittedAt?: string;
  subscribedAt?: string;
  name?: string;
  firstName?: string;
  email?: string;
  phone?: string;
  company?: string;
  message?: string;
  brief?: string;
  topic?: string;
  source?: string;
  budget?: string;
  projectType?: string;
  projectTypes?: string[];
  meetingType?: string;
  date?: string;
  time?: string;
  status?: string;
};

function statusFromRow(status: string | undefined): LeadStatus {
  const value = (status || "").toLowerCase();
  if (value === "declined" || value === "cancelled" || value === "canceled") return "declined";
  if (value === "closed" || value === "archived") return "closed";
  if (value === "converted") return "converted";
  if (value === "qualified" || value === "confirmed") return "qualified";
  if (value === "contacted" || value === "replied" || value === "read") return "contacted";
  return "new";
}

function draftFromRow(kind: string, row: LooseRow, message: string, services: string[] = []): LeadDraft {
  const source = text(row.source) || (kind === "intake" ? "start-a-project" : kind === "booking" ? "booking" : kind);
  return {
    kind,
    sourceId: text(row.id),
    source,
    channel: channelFor(source, kind),
    name: text(row.name) || text(row.firstName),
    email: text(row.email),
    phone: text(row.phone),
    company: text(row.company),
    budget: budgetLabel(text(row.budget)),
    services,
    message,
    status: statusFromRow(row.status),
  };
}

/**
 * Fold existing contacts, intakes, bookings, and inbound mail into the lead store.
 * Existing lead status is left as the admin set it.
 */
export async function syncLeadsFromSources(): Promise<StudioLead[]> {
  const [contacts, intakes, bookings, mailbox] = await Promise.all([
    readJsonFile<LooseRow[]>("contacts.json", []),
    readJsonFile<LooseRow[]>("intakes.json", []),
    readJsonFile<LooseRow[]>("bookings.json", []),
    readJsonFile<{ threads?: { id?: string; subject?: string; leadId?: string; participants?: string[]; messages?: { direction?: string; from?: string; text?: string }[] }[] }>("mailbox.json", { threads: [] }),
  ]);

  let leads = await readLeads();
  let changed = false;
  const apply = (draftInput: LeadDraft) => {
    const extracted = applyAiHint(extractContactDetailsSync(draftInput.message || ""), draftInput.aiHint);
    const explicitServices = [
      ...(draftInput.services ?? []),
      ...collectServices(draftInput.message || ""),
    ];
    const draft = composeDraft({ ...draftInput, services: explicitServices }, extracted);
    if (draft.status && findMatchingLead(leads, draft)) {
      draft.status = undefined;
    }
    const result = upsertLeadList(leads, draft);
    leads = result.leads;
    if (result.changed) changed = true;
  };

  for (const row of contacts) {
    if (!row.id) continue;
    const topic = text(row.topic);
    apply(draftFromRow("contact", row, text(row.message), topic ? [topic] : []));
  }
  for (const row of intakes) {
    if (!row.id) continue;
    const services = Array.isArray(row.projectTypes)
      ? row.projectTypes.filter((id): id is string => typeof id === "string" && id.length > 0)
      : text(row.projectType)
        ? [text(row.projectType)]
        : [];
    apply(draftFromRow("intake", row, text(row.brief), services));
  }
  for (const row of bookings) {
    if (!row.id) continue;
    const when = [row.meetingType, row.date, row.time].filter(Boolean).join(" ");
    const message = [when, text(row.message)].filter(Boolean).join("\n");
    apply(draftFromRow("booking", row, message));
  }
  for (const thread of mailbox.threads ?? []) {
    if (!thread.id || thread.leadId) continue;
    const inbound = (thread.messages ?? []).find((message) => message.direction === "in");
    const from = text(inbound?.from);
    const emailMatch = from.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
    const name = from.replace(/<[^>]+>/g, "").replace(/"/g, "").trim();
    apply({
      kind: "email",
      sourceId: thread.id,
      source: "email",
      channel: "email",
      name,
      email: emailMatch?.[0] || thread.participants?.[0] || "",
      message: [text(thread.subject), text(inbound?.text)].filter(Boolean).join("\n"),
    });
  }

  if (changed) await writeJsonFile(LEADS_FILE, leads);
  return leads.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function listStudioLeads(): Promise<StudioLead[]> {
  const leads = await syncLeadsFromSources();
  return leads.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function setLeadStatus(id: string, status: LeadStatus): Promise<StudioLead | null> {
  const leads = await readLeads();
  const idx = leads.findIndex((lead) => lead.id === id);
  if (idx < 0) return null;
  if (leads[idx].status === status) return leads[idx];
  leads[idx] = { ...leads[idx], status, updatedAt: new Date().toISOString() };
  await writeJsonFile(LEADS_FILE, leads);
  return leads[idx];
}
