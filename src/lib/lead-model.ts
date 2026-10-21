import { siteConfig } from "@/data/site";
import { serviceLabel } from "@/lib/intake-services";
import { nairobiDateKey } from "@/lib/time";

export const LEAD_STATUSES = ["new", "contacted", "qualified", "converted", "closed", "declined"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const LEAD_CHANNELS = [
  { id: "contact-form", label: "Contact form" },
  { id: "booking", label: "Booking" },
  { id: "email", label: "Email" },
  { id: "start-a-project", label: "Start a Project" },
] as const;

export type StudioLead = {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  budget: string;
  services: string[];
  category: string;
  source: string;
  channel: string;
  sources: string[];
  status: LeadStatus;
  score: number;
  message: string;
  kind: string;
  sourceId: string;
  refs: string[];
};

export type LeadFilters = {
  q: string;
  source: string;
  status: string;
  category: string;
  score: string;
  from: string;
  to: string;
};

const FILTER_KEYS: (keyof LeadFilters)[] = ["q", "source", "status", "category", "score", "from", "to"];

const GENERIC_NAME = /^(unknown|guest|visitor|website|client|there)$/i;

export function emptyLeadFilters(): LeadFilters {
  return { q: "", source: "", status: "", category: "", score: "", from: "", to: "" };
}

export function filtersFromSearchParams(params: URLSearchParams): LeadFilters {
  const filters = emptyLeadFilters();
  for (const key of FILTER_KEYS) {
    filters[key] = (params.get(key) || "").trim();
  }
  return filters;
}

export function writeFiltersToParams(params: URLSearchParams, filters: LeadFilters): void {
  for (const key of FILTER_KEYS) {
    const value = filters[key].trim();
    if (value) params.set(key, value);
    else params.delete(key);
  }
}

export function channelFor(source: string, kind: string): string {
  const value = source.trim().toLowerCase();
  if (kind === "intake" || value === "intake" || value === "start-a-project") return "start-a-project";
  if (kind === "email" || value === "email") return "email";
  if (value === "audit-booking" || kind === "booking" || value === "booking" || value.includes("booking")) {
    return "booking";
  }
  if (value === "contact-form" || value === "contact" || value.startsWith("quick-lead") || (kind === "contact" && !value)) {
    return "contact-form";
  }
  if (value) return value;
  return kind || "other";
}

export function channelLabel(channel: string): string {
  const known = LEAD_CHANNELS.find((item) => item.id === channel);
  if (known) return known.label;
  if (channel === "beacon-ai") return "Beacon AI";
  if (channel === "lead-magnet") return "Checklist";
  if (channel === "newsletter") return "Newsletter";
  if (channel === "invoice-request") return "Invoice request";
  return channel || "Other";
}

export function sourceOptions(leads: StudioLead[]): { id: string; label: string }[] {
  const ids = new Set<string>(LEAD_CHANNELS.map((item) => item.id));
  for (const lead of leads) {
    if (lead.channel) ids.add(lead.channel);
    for (const source of lead.sources) if (source) ids.add(source);
  }
  return [...ids].map((id) => ({ id, label: channelLabel(id) }));
}

export function categoryLabel(id: string): string {
  if (id.startsWith("buffet:")) return id.slice("buffet:".length);
  const intake = siteConfig.intake.projectTypes.find((item) => item.id === id);
  if (intake) return intake.label;
  const topic = siteConfig.contactTopics.find((item) => item.id === id);
  if (topic) return topic.label;
  const template = siteConfig.automationCatalog.templates.find((item) => item.id === id);
  if (template) return template.name;
  return serviceLabel(id);
}

export function leadCategoryLabel(lead: Pick<StudioLead, "services" | "category">): string {
  const labels = lead.services.map(categoryLabel).filter((label) => label && label !== "—");
  const unique = [...new Set(labels)];
  if (unique.length) return unique.join(", ");
  return lead.category || "—";
}

export function categoryOptions(): { id: string; label: string; group: "Services" | "Buffet" }[] {
  const services = siteConfig.intake.projectTypes.map((item) => ({
    id: item.id,
    label: item.label,
    group: "Services" as const,
  }));
  const buffet = (["Sales", "Finance", "Customers", "Operations", "Education", "Health", "Property", "Custom"] as const).map(
    (category) => ({ id: `buffet:${category}`, label: category, group: "Buffet" as const })
  );
  return [...services, ...buffet];
}

export function isLeadStatus(value: string): value is LeadStatus {
  return (LEAD_STATUSES as readonly string[]).includes(value);
}

export function scoreBand(score: number): "80" | "50" | "25" | "low" {
  if (score >= 80) return "80";
  if (score >= 50) return "50";
  if (score >= 25) return "25";
  return "low";
}

export function scoreLead(input: {
  name: string;
  email: string;
  phone: string;
  company: string;
  budget: string;
  services: string[];
  message: string;
  channel: string;
}): number {
  let score = 0;
  if (input.email) score += 20;
  if (input.phone.replace(/\D/g, "").length >= 9) score += 15;
  if (input.name && !GENERIC_NAME.test(input.name)) score += 10;
  if (input.company) score += 15;
  if (input.budget) score += 15;
  if (input.services.length) score += 15;
  if (input.message.trim().length >= 40) score += 10;
  if (input.channel === "start-a-project" || input.channel === "booking") score += 10;
  return Math.min(100, score);
}

export function budgetLabel(value: string): string {
  if (!value) return "";
  return siteConfig.intake.budgets.find((item) => item.id === value)?.label || value;
}

export function matchesLeadFilters(lead: StudioLead, filters: LeadFilters): boolean {
  if (filters.source && lead.channel !== filters.source && !lead.sources.includes(filters.source) && lead.source !== filters.source) {
    return false;
  }
  if (filters.status && lead.status !== filters.status) return false;
  if (filters.category && !lead.services.includes(filters.category) && lead.category !== filters.category) return false;
  if (filters.score && scoreBand(lead.score) !== filters.score) return false;
  const day = nairobiDateKey(lead.createdAt);
  if (filters.from && (!day || day < filters.from)) return false;
  if (filters.to && (!day || day > filters.to)) return false;
  const query = filters.q.trim().toLowerCase();
  if (!query) return true;
  const haystack = [
    lead.name,
    lead.email,
    lead.phone,
    lead.company,
    lead.budget,
    lead.message,
    lead.category,
    lead.source,
    lead.channel,
    channelLabel(lead.channel),
    ...lead.services.map(categoryLabel),
    ...lead.sources.map(channelLabel),
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(query);
}

export function filterLeads(leads: StudioLead[], filters: LeadFilters): StudioLead[] {
  return leads.filter((lead) => matchesLeadFilters(lead, filters));
}
