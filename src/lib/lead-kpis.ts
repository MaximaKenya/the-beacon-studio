import type { AnalyticsSummary } from "@/lib/analytics-store";
import { attributionNote, type LeadAttribution } from "@/lib/attribution";
import { loadAutomations } from "@/lib/automations/store";
import { normalizeServiceIds, serviceLabels } from "@/lib/intake-services";

export type LeadKind = "contact" | "intake" | "booking" | "subscriber";

export type UnifiedLead = LeadAttribution & {
  id: string;
  createdAt: string;
  kind: LeadKind;
  name: string;
  email: string;
  phone: string;
  source: string;
  detail: string;
};

type Loose = LeadAttribution & {
  id?: string;
  createdAt?: string;
  submittedAt?: string;
  subscribedAt?: string;
  name?: string;
  firstName?: string;
  email?: string;
  phone?: string;
  source?: string;
  message?: string;
  brief?: string;
  meetingType?: string;
  projectType?: string;
  projectTypes?: string[];
  date?: string;
  time?: string;
  topic?: string;
};

export type StudioKpis = {
  leadsBySource: { label: string; value: number }[];
  leadsByUtm: { label: string; value: number }[];
  funnel: { label: string; value: number }[];
  mrrKes: number;
  mrrUsd: number;
  activeAutomations: number;
  leadCount: number;
  auditBookings: number;
};

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function when(row: Loose): string {
  return text(row.createdAt) || text(row.submittedAt) || text(row.subscribedAt);
}

function isAudit(meetingType: string): boolean {
  const value = meetingType.toLowerCase();
  return value.includes("audit") || value === "automation-audit";
}

export function collectLeads(input: {
  contacts: Loose[];
  intakes: Loose[];
  bookings: Loose[];
  subscribers: Loose[];
}): UnifiedLead[] {
  const leads: UnifiedLead[] = [];

  for (const row of input.contacts) {
    leads.push({
      id: text(row.id),
      createdAt: when(row),
      kind: "contact",
      name: text(row.name),
      email: text(row.email),
      phone: text(row.phone),
      source: text(row.source) || "contact",
      detail: text(row.message) || text(row.topic),
      utmSource: row.utmSource,
      utmMedium: row.utmMedium,
      utmCampaign: row.utmCampaign,
      utmTerm: row.utmTerm,
      utmContent: row.utmContent,
      referrer: row.referrer,
      landingPath: row.landingPath,
    });
  }

  for (const row of input.intakes) {
    leads.push({
      id: text(row.id),
      createdAt: when(row),
      kind: "intake",
      name: text(row.name),
      email: text(row.email),
      phone: text(row.phone),
      source: text(row.source) || "intake",
      detail: text(row.brief) || serviceLabels(normalizeServiceIds(row)) || text(row.projectType),
      utmSource: row.utmSource,
      utmMedium: row.utmMedium,
      utmCampaign: row.utmCampaign,
      utmTerm: row.utmTerm,
      utmContent: row.utmContent,
      referrer: row.referrer,
      landingPath: row.landingPath,
    });
  }

  for (const row of input.bookings) {
    const meeting = text(row.meetingType);
    leads.push({
      id: text(row.id),
      createdAt: when(row),
      kind: "booking",
      name: text(row.name),
      email: text(row.email),
      phone: text(row.phone),
      source: text(row.source) || (isAudit(meeting) ? "audit-booking" : "booking"),
      detail: [meeting, text(row.date), text(row.time), text(row.message)].filter(Boolean).join(" · "),
      utmSource: row.utmSource,
      utmMedium: row.utmMedium,
      utmCampaign: row.utmCampaign,
      utmTerm: row.utmTerm,
      utmContent: row.utmContent,
      referrer: row.referrer,
      landingPath: row.landingPath,
    });
  }

  for (const row of input.subscribers) {
    leads.push({
      id: text(row.id) || text(row.email),
      createdAt: when(row),
      kind: "subscriber",
      name: text(row.firstName) || text(row.name),
      email: text(row.email),
      phone: "",
      source: text(row.source) || "newsletter",
      detail: "Newsletter",
      utmSource: row.utmSource,
      utmMedium: row.utmMedium,
      utmCampaign: row.utmCampaign,
      utmTerm: row.utmTerm,
      utmContent: row.utmContent,
      referrer: row.referrer,
      landingPath: row.landingPath,
    });
  }

  return leads.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function counts(leads: UnifiedLead[], pick: (lead: UnifiedLead) => string): { label: string; value: number }[] {
  const map = new Map<string, number>();
  for (const lead of leads) {
    const label = pick(lead);
    if (!label) continue;
    map.set(label, (map.get(label) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
}

export async function buildStudioKpis(leads: UnifiedLead[], summary: AnalyticsSummary): Promise<StudioKpis> {
  let mrrKes = 0;
  let mrrUsd = 0;
  let activeAutomations = 0;
  try {
    const doc = await loadAutomations();
    const active = doc.instances.filter((item) => !item.demo && item.status === "active");
    activeAutomations = active.length;
    mrrKes = active.reduce((sum, item) => sum + item.monthlyKes, 0);
    mrrUsd = active.reduce((sum, item) => sum + item.monthlyUsd, 0);
  } catch (error) {
    console.error("[kpis] automations", error instanceof Error ? error.message : "failed");
  }

  const auditBookings = leads.filter((lead) => lead.kind === "booking" && lead.source === "audit-booking").length;

  return {
    leadsBySource: counts(leads, (lead) => lead.source || lead.kind),
    leadsByUtm: counts(
      leads.filter((lead) => lead.utmSource),
      (lead) => lead.utmSource || ""
    ),
    funnel: [
      { label: "Visitors", value: summary.uniqueVisitors },
      { label: "Leads", value: leads.length },
      { label: "Audit booked", value: auditBookings },
      { label: "Automations live", value: activeAutomations },
    ],
    mrrKes,
    mrrUsd,
    activeAutomations,
    leadCount: leads.length,
    auditBookings,
  };
}

function csvCell(value: string): string {
  const safe = /^[=+\-@]/.test(value) ? `'${value}` : value;
  if (/[",\n]/.test(safe)) return `"${safe.replace(/"/g, '""')}"`;
  return safe;
}

export function leadsToCsv(leads: UnifiedLead[]): string {
  const headers = [
    "createdAt",
    "kind",
    "name",
    "email",
    "phone",
    "source",
    "utmSource",
    "utmMedium",
    "utmCampaign",
    "utmTerm",
    "utmContent",
    "referrer",
    "landingPath",
    "detail",
  ];
  const rows = leads.map((lead) =>
    [
      lead.createdAt,
      lead.kind,
      lead.name,
      lead.email,
      lead.phone,
      lead.source,
      lead.utmSource ?? "",
      lead.utmMedium ?? "",
      lead.utmCampaign ?? "",
      lead.utmTerm ?? "",
      lead.utmContent ?? "",
      lead.referrer ?? "",
      lead.landingPath ?? "",
      lead.detail,
    ]
      .map((value) => csvCell(value))
      .join(",")
  );
  return [headers.join(","), ...rows].join("\n");
}

export function leadAttributionLine(lead: LeadAttribution): string {
  return attributionNote(lead);
}
