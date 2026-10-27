import { leadTemplates, mpesaAddon, partnerTiers } from "@/data/site";
import { carePlanById, proAddonById, whatsappTierById } from "@/lib/revenue-pricing";
import { isValidEmail, normalizeEmail } from "@/lib/validation";

export const REQUEST_KINDS = ["care-plan", "whatsapp-addon", "mpesa-addon", "pro-addon", "partner", "partnership", "template"] as const;
export type RequestKind = (typeof REQUEST_KINDS)[number];

export const REQUEST_LABEL: Record<RequestKind, string> = {
  "care-plan": "Care plan",
  "whatsapp-addon": "WhatsApp add-on",
  "mpesa-addon": "M-Pesa collections",
  "pro-addon": "Pro upgrade",
  partner: "Partner application",
  partnership: "Partnership enquiry",
  template: "Template download",
};

export type RevenueRequest = {
  id: string;
  kind: RequestKind;
  createdAt: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  item?: string;
  itemLabel?: string;
  message?: string;
  status: "new" | "contacted" | "done";
  downloadToken?: string;
};

export type ParsedRequest = Omit<RevenueRequest, "id" | "createdAt" | "status" | "downloadToken">;

function text(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function itemLabelFor(kind: RequestKind, item: string): string | null {
  if (!item) return kind === "partnership" || kind === "partner" || kind === "mpesa-addon" ? "" : null;
  if (kind === "care-plan") return carePlanById(item)?.name ?? null;
  if (kind === "whatsapp-addon") return whatsappTierById(item)?.name ?? null;
  if (kind === "pro-addon") return proAddonById(item)?.name ?? null;
  if (kind === "mpesa-addon") return mpesaAddon.uses.find((use) => use.id === item)?.name ?? null;
  if (kind === "partner") return partnerTiers.find((tier) => tier.id === item)?.name ?? null;
  if (kind === "template") return leadTemplates.find((entry) => entry.id === item)?.title ?? null;
  return item;
}

/** Validates a public request form. Pure so it can be unit tested. */
export function parseRevenueRequest(body: Record<string, unknown>): { ok: true; value: ParsedRequest } | { ok: false; error: string } {
  if (typeof body.website === "string" && body.website.trim()) return { ok: false, error: "Could not send that." };
  const kind = REQUEST_KINDS.find((entry) => entry === body.kind);
  if (!kind) return { ok: false, error: "Unknown request." };
  const email = normalizeEmail(text(body.email, 200));
  if (!isValidEmail(email)) return { ok: false, error: "Enter a valid email." };
  const name = text(body.name, 80) || (kind === "template" ? "Template download" : "");
  if (!name) return { ok: false, error: "Enter your name." };
  const item = text(body.item, 60);
  const itemLabel = itemLabelFor(kind, item);
  if (itemLabel === null) return { ok: false, error: "Pick an option." };
  if (kind === "partner" && !text(body.company, 120)) return { ok: false, error: "Enter your business name." };
  return {
    ok: true,
    value: {
      kind,
      name,
      email,
      ...(text(body.phone, 30) ? { phone: text(body.phone, 30) } : {}),
      ...(text(body.company, 120) ? { company: text(body.company, 120) } : {}),
      ...(item ? { item, itemLabel } : {}),
      ...(text(body.message, 2000) ? { message: text(body.message, 2000) } : {}),
    },
  };
}

export function countRequests(list: RevenueRequest[]) {
  const counts = Object.fromEntries(REQUEST_KINDS.map((kind) => [kind, 0])) as Record<RequestKind, number>;
  let open = 0;
  for (const entry of list) {
    counts[entry.kind] = (counts[entry.kind] || 0) + 1;
    if (entry.status === "new" && entry.kind !== "template") open += 1;
  }
  const addOns = counts["care-plan"] + counts["whatsapp-addon"] + counts["mpesa-addon"] + counts["pro-addon"];
  return { counts, open, addOns };
}
