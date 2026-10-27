import { industryPacks, type IndustryPack } from "@/data/site";
import { quoteBundle, type BillingInterval, type BundleQuote } from "@/automations/pricing";

export type { IndustryPack };

export function packById(id: string | null | undefined): IndustryPack | undefined {
  if (!id) return undefined;
  return industryPacks.find((pack) => pack.id === id.toLowerCase());
}

/** Same quote the buffet and checkout use, so a pack never has its own price. */
export function packQuote(pack: IndustryPack, billing: BillingInterval = "monthly"): BundleQuote {
  const quote = quoteBundle(pack.templateIds, { billing });
  if (!quote) throw new Error(`Pack ${pack.id} has no priced automations`);
  return quote;
}

const INDUSTRY_TO_PACK: Array<[RegExp, string]> = [
  [/clinic|hospital|dental|medical|pharmac|patient|health/i, "clinic"],
  [/school|college|academy|tuition|parent|student|fees/i, "school"],
  [/sacco|chama|microfinance|loan|lender|credit union/i, "sacco"],
  [/landlord|rent|tenant|property|apartment|real estate|estate agent/i, "landlord"],
  [/retail|shop|store|boutique|supermarket|duka|e-?commerce|stock/i, "retail"],
];

/** Pick a pack for free text like "we run a dental clinic". Falls back to Services & SME. */
export function packForIndustry(text: string | null | undefined): IndustryPack {
  const value = (text || "").trim();
  for (const [pattern, id] of INDUSTRY_TO_PACK) {
    if (pattern.test(value)) return packById(id)!;
  }
  return packById("services")!;
}

export function packPath(pack: IndustryPack) {
  return `/packs/${pack.id}`;
}

export function packTrialHref(pack: IndustryPack) {
  return `/automations?pack=${pack.id}`;
}
