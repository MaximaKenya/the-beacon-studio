import { categoryLandings, industryLandings } from "@/data/landings";
import { CHECKLIST_TITLE } from "@/lib/checklist";
import { industryPacks, siteConfig } from "@/data/site";
import { packQuote } from "@/automations/packs";
import { TRIAL_DAYS } from "@/lib/automations/trial";
import { formatKes } from "@/lib/fx";

/** Facts Beacon AI may repeat. Pages, prices, and the illustrative label live here. */
export function beaconGroundingFacts(): string {
  const categories = categoryLandings
    .map((page) => `${page.category}: ${page.path} — ${page.title}`)
    .join("\n");
  const industries = industryLandings.map((page) => `${page.title}: ${page.path}`).join("\n");

  const packs = industryPacks
    .map((pack) => {
      const quote = packQuote(pack);
      return `${pack.name} (${pack.industry}): /packs/${pack.id} — ${formatKes(quote.recurringMonthlyKes)}/month, ${TRIAL_DAYS}-day free trial`;
    })
    .join("\n");

  return `Public pages and offers:
- Free 20-minute automation audit: /book. Weekdays ${siteConfig.booking.hoursStart}–${siteConfig.booking.hoursEnd} ${siteConfig.booking.timezone}. The slot is saved. A confirmation email with a calendar file is sent only when Resend is configured.
- ${CHECKLIST_TITLE}: /checklist. The visitor leaves an email, which is stored as a lead, then downloads HTML or PDF. It is a planning list, not a quote.
- Automation category pages:
${categories}
- Kenyan industry pages:
${industries}
- Industry packs (recommend one when the industry is known; prices are exact):
${packs}
- ROI calculator: /automation-roi. Results are estimates from the visitor's own inputs.
- Fixed-price packages are on the pricing section: lead site $450, automation day $300, booking launch $600, AI FAQ bot $500. 30% deposit or invoice.
- Referral programme terms: /referrals.
- Example results on the site are illustrative. Say that plainly. They are not measured client outcomes.
- Testimonials are not published. The testimonials list is empty until a real quote exists, and the site hides that section. Do not invent quotes, logos, customer counts, or uptime.
- The studio is a business in Nairobi, Kenya. Phone ${siteConfig.phone} (${siteConfig.phoneDisplay}). WhatsApp uses the same number.
- Canonical site: ${siteConfig.seo.siteUrl}`;
}
