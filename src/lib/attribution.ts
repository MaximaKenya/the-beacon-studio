/** First-touch campaign fields stored on every lead. */
export type LeadAttribution = {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  referrer?: string;
  landingPath?: string;
};

const FIELDS: { keys: string[]; field: keyof LeadAttribution; url?: boolean }[] = [
  { keys: ["utmSource", "utm_source"], field: "utmSource" },
  { keys: ["utmMedium", "utm_medium"], field: "utmMedium" },
  { keys: ["utmCampaign", "utm_campaign"], field: "utmCampaign" },
  { keys: ["utmTerm", "utm_term"], field: "utmTerm" },
  { keys: ["utmContent", "utm_content"], field: "utmContent" },
  { keys: ["referrer"], field: "referrer", url: true },
  { keys: ["landingPath", "landing_path"], field: "landingPath", url: true },
];

function cleanText(value: string, max = 180): string {
  return value.replace(/[\u0000-\u001f]+/g, " ").trim().slice(0, max);
}

function cleanLink(value: string): string {
  const text = cleanText(value, 300);
  if (!text) return "";
  if (text.startsWith("/") && !text.startsWith("//")) return text.slice(0, 180);
  try {
    const url = new URL(text);
    if (url.protocol !== "http:" && url.protocol !== "https:") return "";
    return `${url.pathname}${url.search}`.slice(0, 180) || url.toString().slice(0, 300);
  } catch {
    return "";
  }
}

export function attributionFromRecord(body: Record<string, unknown>): LeadAttribution {
  const out: LeadAttribution = {};
  for (const spec of FIELDS) {
    const raw = spec.keys
      .map((key) => body[key])
      .find((value) => typeof value === "string" && value.trim());
    if (typeof raw !== "string") continue;
    const value = spec.url ? cleanLink(raw) : cleanText(raw);
    if (value) out[spec.field] = value;
  }
  return out;
}

/** Keep the first campaign touch. Later visits fill only the blanks. */
export function mergeAttribution(existing: LeadAttribution, incoming: LeadAttribution): LeadAttribution {
  return {
    utmSource: existing.utmSource || incoming.utmSource,
    utmMedium: existing.utmMedium || incoming.utmMedium,
    utmCampaign: existing.utmCampaign || incoming.utmCampaign,
    utmTerm: existing.utmTerm || incoming.utmTerm,
    utmContent: existing.utmContent || incoming.utmContent,
    referrer: existing.referrer || incoming.referrer,
    landingPath: existing.landingPath || incoming.landingPath,
  };
}

export function attributionNote(value: LeadAttribution): string {
  const parts = [
    value.utmSource && `utm_source=${value.utmSource}`,
    value.utmMedium && `utm_medium=${value.utmMedium}`,
    value.utmCampaign && `utm_campaign=${value.utmCampaign}`,
    value.utmTerm && `utm_term=${value.utmTerm}`,
    value.utmContent && `utm_content=${value.utmContent}`,
    value.referrer && `referrer=${value.referrer}`,
    value.landingPath && `landing=${value.landingPath}`,
  ].filter(Boolean);
  return parts.join(" · ");
}
