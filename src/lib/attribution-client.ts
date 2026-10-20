import { attributionFromRecord, type LeadAttribution } from "@/lib/attribution";

const KEY = "beacon-attribution";

function readRaw(): Record<string, unknown> {
  if (typeof window === "undefined") return {};
  try {
    const parsed = JSON.parse(window.sessionStorage.getItem(KEY) || "{}") as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return parsed as Record<string, unknown>;
  } catch {
    return {};
  }
}

/** Campaign fields captured on the first landing, sent with every lead form. */
export function readStoredAttribution(): LeadAttribution {
  return attributionFromRecord(readRaw());
}

export function captureAttribution(pathname: string, search: string): void {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(search);
  const incoming = attributionFromRecord({
    utm_source: params.get("utm_source") ?? "",
    utm_medium: params.get("utm_medium") ?? "",
    utm_campaign: params.get("utm_campaign") ?? "",
    utm_term: params.get("utm_term") ?? "",
    utm_content: params.get("utm_content") ?? "",
    referrer: document.referrer,
    landingPath: `${pathname}${search ? `?${search}` : ""}`,
  });
  const hasCampaign = Boolean(
    incoming.utmSource || incoming.utmMedium || incoming.utmCampaign || incoming.utmTerm || incoming.utmContent
  );
  const existing = attributionFromRecord(readRaw());
  const next: LeadAttribution = {
    utmSource: existing.utmSource || incoming.utmSource,
    utmMedium: existing.utmMedium || incoming.utmMedium,
    utmCampaign: existing.utmCampaign || incoming.utmCampaign,
    utmTerm: existing.utmTerm || incoming.utmTerm,
    utmContent: existing.utmContent || incoming.utmContent,
    referrer: existing.referrer || incoming.referrer,
    landingPath: existing.landingPath || incoming.landingPath,
  };
  if (!existing.landingPath && hasCampaign) {
    next.landingPath = incoming.landingPath;
  }
  window.sessionStorage.setItem(KEY, JSON.stringify(next));
}
