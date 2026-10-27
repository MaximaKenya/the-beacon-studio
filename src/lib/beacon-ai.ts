import { siteConfig } from "@/data/site";
import { beaconGroundingFacts } from "@/lib/beacon-grounding";
import { whatsappHref, whatsappPrefill } from "@/lib/contact-actions";
import { describeTierMoney } from "@/lib/fx";
import { isValidEmail, normalizeEmail } from "@/lib/validation";

/** Requested Llama default. Override with GROQ_MODEL. */
export const DEFAULT_GROQ_MODEL = "llama-3.3-70b-versatile";

/**
 * Groq retired llama-3.3-70b-versatile for free and developer tiers on
 * 2026-08-16. Enterprise committed-spend accounts can still use it.
 * When the default id is rejected, the route retries this production model.
 */
export const GROQ_FALLBACK_MODEL = "openai/gpt-oss-120b";

export const BEACON_AI_MAX_MESSAGE_CHARS = 800;
export const BEACON_AI_MAX_MESSAGES = 20;
export const BEACON_AI_MODEL_HISTORY = 8;

export type BeaconChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const NAME_LEAD =
  /\b(?:my name is|i am|i'm|this is|name is)\s+([A-Za-z][A-Za-z'’.-]*(?:\s+[A-Za-z][A-Za-z'’.-]*){0,2})/i;

const NAME_STOP =
  /^(interested|looking|wondering|here|trying|not|happy|keen|ready|available|calling|writing|just|going|a|the)$/i;

const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;

/** At least 9 digits, so prices like $1,350 are not treated as phone numbers. */
const PHONE_RE = /(?:\+\d{1,3}[\s.-]?)?\d(?:[\s().-]*\d){8,14}/g;

export function beaconWhatsappLink(): string {
  return whatsappHref(whatsappPrefill);
}

export function beaconAiUnavailableText(leadSaved = false): string {
  const saved = leadSaved ? " We saved your details and will follow up." : "";
  return `${siteConfig.assistant.name} is unavailable right now.${saved} [WhatsApp ${siteConfig.phoneDisplay}](${beaconWhatsappLink()}) or book the free 20-minute audit and we will help you directly.`;
}

export function beaconAiRateLimitText(): string {
  return `You are sending messages very quickly. Wait a few minutes, or [WhatsApp ${siteConfig.phoneDisplay}](${beaconWhatsappLink()}).`;
}

export function sanitizeBeaconMessages(input: unknown): BeaconChatMessage[] | null {
  if (!Array.isArray(input)) return null;
  const cleaned: BeaconChatMessage[] = [];
  for (const item of input.slice(-BEACON_AI_MAX_MESSAGES)) {
    if (!item || typeof item !== "object") return null;
    const role = (item as { role?: unknown }).role;
    const content = (item as { content?: unknown }).content;
    if (role !== "user" && role !== "assistant") return null;
    if (typeof content !== "string") return null;
    const text = content.trim().slice(0, BEACON_AI_MAX_MESSAGE_CHARS);
    if (!text) continue;
    cleaned.push({ role, content: text });
  }
  if (cleaned.length === 0 || cleaned[cleaned.length - 1]?.role !== "user") return null;
  return cleaned;
}

export function beaconModelMessages(messages: BeaconChatMessage[]): BeaconChatMessage[] {
  return messages.slice(-BEACON_AI_MODEL_HISTORY);
}

export type ExtractedBeaconLead = {
  name: string;
  email: string;
  phone: string;
};

export function extractBeaconLead(userText: string): ExtractedBeaconLead {
  const studioEmail = normalizeEmail(siteConfig.email);
  const emailMatch = userText.match(EMAIL_RE);
  const rawEmail = emailMatch?.[0] ?? "";
  const email =
    rawEmail && isValidEmail(rawEmail) && normalizeEmail(rawEmail) !== studioEmail ? rawEmail : "";

  const studioDigits = siteConfig.phone.replace(/\D/g, "");
  const withoutEmails = userText.replace(EMAIL_RE, " ");
  let phone = "";
  for (const match of withoutEmails.matchAll(PHONE_RE)) {
    const raw = match[0].trim().replace(/\s+/g, " ");
    const digits = raw.replace(/\D/g, "");
    if (digits.length < 9 || digits.length > 15) continue;
    if (digits === studioDigits) continue;
    phone = raw;
    break;
  }

  let name = "";
  const nameMatch = userText.match(NAME_LEAD);
  if (nameMatch?.[1]) {
    const cleaned =
      nameMatch[1].split(/\b(?:from|at|and|with|on|in|for|about|email|phone)\b/i)[0]?.trim() ?? "";
    const first = cleaned.split(/\s+/)[0] ?? "";
    const tidy = cleaned.replace(/[.]+$/g, "").replace(/\s+/g, " ").trim();
    if (tidy && first && !NAME_STOP.test(first)) name = tidy.slice(0, 80);
  }

  return { name, email, phone };
}

export function beaconLeadNote(messages: BeaconChatMessage[]): string {
  const body = messages
    .filter((message) => message.role === "user")
    .map((message) => message.content.trim())
    .filter(Boolean)
    .join("\n")
    .slice(-600);
  const title = `${siteConfig.assistant.name} chat`;
  return body ? `${title}\n${body}` : title;
}

export function buildBeaconAiSystemPrompt(): string {
  const products = siteConfig.products
    .map((product) => {
      const features = (product.keyFeatures ?? product.features).join(" | ");
      const price = product.pricing ? `Pricing: ${product.pricing}` : "No public price.";
      const site = product.liveUrl ? `Site: ${product.liveUrl}` : "No public site yet.";
      return `- ${product.name} — ${product.statusLabel}. ${product.tagline}. ${product.description} Audience: ${product.audience}. Features: ${features}. ${price} ${site}`;
    })
    .join("\n");

  const services = siteConfig.services
    .map((service) => `- ${service.title}: ${service.description}`)
    .join("\n");

  const pricing = siteConfig.pricingTiers
    .map(
      (tier) =>
        `- ${tier.name}: ${describeTierMoney(tier)} (${tier.unit}). ${tier.headline} Includes: ${tier.includes.join("; ")}.`
    )
    .join("\n");

  const offer = siteConfig.automationPricing;
  const flexibility = offer.flexibility.map((point) => `${point.title}: ${point.detail}`).join("; ");
  const howItWorks = offer.howItWorks.map((step) => `${step.title}: ${step.detail}`).join(" → ");

  const catalog = siteConfig.automationCatalog;
  const buffet = catalog.templates
    .map(
      (item) =>
        `- ${item.name} (${item.category}): KES ${item.priceKes.toLocaleString("en-KE")}/mo (about $${item.priceUsd})${item.setupFeeKes ? `, setup KES ${item.setupFeeKes.toLocaleString("en-KE")} included` : ""}. ${item.outcome}`
    )
    .join("\n");
  const discounts = catalog.bundleDiscounts.map((tier) => `${tier.label} ${tier.percent}% off`).join(", ");

  const faq = siteConfig.faq.map((item) => `Q: ${item.question}\nA: ${item.answer}`).join("\n\n");

  return `You are ${siteConfig.assistant.name}, the assistant on the ${siteConfig.brand.name} website (${siteConfig.location}).

Goal: answer helpfully in plain language, then invite the visitor to book the free 20-minute audit or leave their name plus email or phone so the studio can follow up. Be useful first. One clear nudge is enough. Do not invent facts.

Rules:
- Use only the facts in this prompt. If a price, feature, customer count, uptime figure, or timeline is not written here, say you do not have it and offer the free audit or WhatsApp.
- All products are live. ConfiRent, CadenceApp, ConfiLearn, LookFinesse and Convoria have a 30-day free trial. Do not mention TriviaYard or ConfiTrade.
- Do not describe AI voice calling. CadenceApp calling is manual, power, or auto on office lines, cloud voice, or the agent's mobile.
- Custom software has no public price. It is quoted after a free call.
- Managed IT has no public price. It is quoted after a free assessment. It covers backup and disaster recovery, antivirus and endpoint protection, firewall and network security, and Microsoft 365 (setup, migration, licensing, and support).
- Quote AI automation prices only from the Pricing list below. Do not invent other automation prices. State both KES and USD when the pricing line has both.
- ${offer.buildTitle}. ${offer.buildBody}
- ${offer.careTitle}. ${offer.careBody}
- ${offer.flexibilityTitle}. ${offer.flexibilityIntro} Options: ${flexibility}
- How it works: ${howItWorks}
- The 20-minute audit is free. Ready-made automations are chosen on /automations and paid as one Paystack checkout or one invoice for the whole bundle. A custom Pilot paid online is a 30% deposit unless a flexibility option is agreed in writing.
- Bundle discounts: ${discounts}. Paying annually takes a further ${catalog.annualDiscountPercent}% off the monthly total. Setup fees are included in the checkout total wherever an automation has one. There is no option to skip them.
- Custom automations can use fields of these types: ${catalog.customFieldTypes.join(", ")}. Groq can suggest fields from a plain description when GROQ_API_KEY is set.
- Keep replies under 120 words. Short paragraphs. No hype and no bullet walls unless the visitor asks for a list.
- When a visitor shares a name, email, or phone, confirm what you received and that the studio will follow up. Ask only for whichever of name, email, or phone is still missing.
- You are not ${siteConfig.founder.name}. Do not pretend to be a person.
- Phone and WhatsApp: ${siteConfig.phoneDisplay} (${beaconWhatsappLink()}).
- ${beaconGroundingFacts()}

Products (these four only):
${products}

Services:
${services}

Pricing:
${pricing}

Ready-made automations (monthly, KES and USD):
${buffet}
Note: ${siteConfig.pricingDisclaimer}
${siteConfig.servicesPricingNote}

Contact:
- Email: ${siteConfig.email}
- Phone / WhatsApp: ${siteConfig.phoneDisplay}
- Location: ${siteConfig.location}
- Booking: weekdays ${siteConfig.booking.hoursStart}–${siteConfig.booking.hoursEnd} (${siteConfig.booking.timezone})
- The free audit is a 20-minute automation audit. This chat has a button that opens the booking panel.

FAQ:
${faq}`;
}
