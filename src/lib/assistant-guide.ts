import { siteConfig } from "@/data/site";
import { extractBeaconLead, type BeaconChatMessage } from "@/lib/beacon-ai";
import {
  durationForMeeting,
  formatDateDisplay,
  formatTimeDisplay,
  generateTimeSlots,
  getNowInTimezone,
  isDayAvailable,
  parseDateKey,
  type BookedSlot,
} from "@/lib/booking-utils";
import { describeTierMoney, formatKes } from "@/lib/fx";

export type VisitorNeed = "automation" | "software" | "it" | "product" | "";

export type Qualification = {
  needs: VisitorNeed;
  industry: string;
  budget: string;
  timeline: string;
  name: string;
  email: string;
  phone: string;
};

export type OfferedSlot = {
  date: string;
  time: string;
  label: string;
};

export type ScriptedReply = {
  text: string;
  offerSlots: boolean;
  contact: Pick<Qualification, "name" | "email" | "phone">;
  category: string;
  budget: string;
};

const INDUSTRIES: { pattern: RegExp; label: string }[] = [
  { pattern: /\b(clinic|hospital|patient|dental)\b/i, label: "Clinic" },
  { pattern: /\b(school|college|university|parent|fees)\b/i, label: "School" },
  { pattern: /\bsacco\b|\bmicrofinance\b/i, label: "SACCO" },
  { pattern: /\b(property|real estate|landlord|tenant|rent)\b/i, label: "Property" },
  { pattern: /\b(retail|shop|store|inventory)\b/i, label: "Retail" },
  { pattern: /\b(restaurant|café|cafe|hotel)\b/i, label: "Restaurant" },
  { pattern: /\b(church|ngo|non-?profit)\b/i, label: "NGO" },
];

function userText(messages: BeaconChatMessage[]): string {
  return messages
    .filter((message) => message.role === "user")
    .map((message) => message.content)
    .join("\n");
}

function detectNeeds(text: string): VisitorNeed {
  if (/\b(confirent|cadenceapp|lookfinesse|confilearn)\b/i.test(text)) return "product";
  if (/\b(managed it|microsoft 365|m365|antivirus|firewall|backup|endpoint|it support|it assessment)\b/i.test(text)) {
    return "it";
  }
  if (/\b(automations?|workflows?|reminders?|follow-?ups?|whatsapp|chatbots?|pilots?)\b/i.test(text)) return "automation";
  if (/\b(software|website|web app|mobile app|custom build|platform|saas)\b/i.test(text)) return "software";
  return "";
}

function detectIndustry(text: string): string {
  for (const industry of INDUSTRIES) {
    if (industry.pattern.test(text)) return industry.label;
  }
  return "";
}

function budgetLabelFromText(text: string): string {
  const budgets = siteConfig.intake.budgets;
  const find = (id: string) => budgets.find((item) => item.id === id)?.label ?? "";
  const lower = text.toLowerCase();
  if (/\b(not sure|no budget|don't know|dont know|unsure)\b/.test(lower)) return find("explore");
  if (/40\s*k|\bover\s*\$?\s*40|\b40,000\b/.test(lower)) return find("40k-plus");
  if (/15\s*k|\$15|15,000/.test(lower) && /40/.test(lower)) return find("15-40k");
  if (/\b15\s*[-–to]+\s*40\b/.test(lower)) return find("15-40k");
  if (/\$?\s*5\s*k|\$5,000|5,000/.test(lower) && /15/.test(lower)) return find("5-15k");
  if (/\b5\s*[-–to]+\s*15\b/.test(lower)) return find("5-15k");
  if (/under\s*\$?\s*5\s*k|under\s*\$?\s*5,000|less than\s*\$?\s*5/.test(lower)) return find("under-5k");
  if (/under\s*\$?\s*2\s*k|under\s*\$?\s*2,000|less than\s*\$?\s*2/.test(lower)) return find("under-2k");
  if (/under\s*\$?\s*500|less than\s*\$?\s*500/.test(lower)) return find("under-500");
  return "";
}

function detectTimeline(text: string): string {
  const timelines = siteConfig.intake.timelines;
  const find = (id: string) => timelines.find((item) => item.id === id)?.label ?? "";
  const lower = text.toLowerCase();
  if (/\b(asap|urgent|immediately|right away|this week)\b/.test(lower)) return find("asap");
  if (/\b(this month|next month|few weeks|a few weeks|2 weeks|3 weeks)\b/.test(lower)) return find("this-month");
  if (/\b(few months|a few months|this quarter|next quarter)\b/.test(lower)) return find("few-months");
  if (/\b(just exploring|exploring|no rush|not sure when)\b/.test(lower)) return find("exploring");
  return "";
}

export function qualifyFromMessages(messages: BeaconChatMessage[]): Qualification {
  const text = userText(messages);
  const contact = extractBeaconLead(text);
  return {
    needs: detectNeeds(text),
    industry: detectIndustry(text),
    budget: budgetLabelFromText(text),
    timeline: detectTimeline(text),
    name: contact.name,
    email: contact.email,
    phone: contact.phone,
  };
}

export function leadCategory(qualification: Qualification): string {
  const need =
    qualification.needs === "automation"
      ? "AI automation"
      : qualification.needs === "software"
        ? "Custom software"
        : qualification.needs === "it"
          ? "Managed IT"
          : qualification.needs === "product"
            ? "Products"
            : "";
  return [need, qualification.industry].filter(Boolean).join(" · ");
}

function catalogRange(): { low: number; high: number } {
  const prices = siteConfig.automationCatalog.templates.map((item) => item.priceKes);
  return { low: Math.min(...prices), high: Math.max(...prices) };
}

/** Quote copy taken from the published tiers and automation catalog. */
export function quoteForNeed(needs: VisitorNeed): string {
  if (needs === "software") {
    const tier = siteConfig.pricingTiers.find((item) => item.id === "custom-software");
    return `Custom software is ${tier?.fromPrice ?? "quoted after a free call"}.`;
  }
  if (needs === "it") {
    const tier = siteConfig.pricingTiers.find((item) => item.id === "managed-it");
    return `Managed IT is ${tier?.fromPrice ?? "quoted after a free assessment"}.`;
  }
  if (needs === "product") {
    return siteConfig.products
      .filter((product) => product.pricing)
      .map((product) => `${product.name}: ${product.pricing}`)
      .join(" ");
  }
  const range = catalogRange();
  const pilot = siteConfig.pricingTiers.find((item) => item.id === "automation-pilot");
  const multi = siteConfig.pricingTiers.find((item) => item.id === "automation-custom");
  const retainer = siteConfig.pricingTiers.find((item) => item.id === "automation-retainer");
  const parts = [
    `Ready-made automations are ${formatKes(range.low)}–${formatKes(range.high).replace("KES ", "")} a month.`,
    pilot ? `A Pilot starts at ${describeTierMoney(pilot)} (${pilot.unit}).` : "",
    multi ? `Multi-workflow is ${multi.fromPrice}.` : "",
    retainer ? `A retainer starts at ${describeTierMoney(retainer)} ${retainer.unit}.` : "",
  ];
  return parts.filter(Boolean).join(" ");
}

export function qualificationBrief(messages: BeaconChatMessage[], slots: OfferedSlot[]): string {
  const qualification = qualifyFromMessages(messages);
  const slotLine = slots.length ? slots.map((slot) => slot.label).join("; ") : "No open slot loaded.";
  return `Qualification so far:
Needs: ${qualification.needs || "unknown"}
Industry: ${qualification.industry || "unknown"}
Budget: ${qualification.budget || "unknown"}
Timeline: ${qualification.timeline || "unknown"}
Name: ${qualification.name || "unknown"}
Email: ${qualification.email || "unknown"}
Phone: ${qualification.phone || "unknown"}

Ask for one missing item at a time, in this order: needs, industry, budget, timeline, name, then email or phone.
Quote only these published ranges:
- Automation: ${quoteForNeed("automation")}
- Software: ${quoteForNeed("software")}
- IT: ${quoteForNeed("it")}
- Products: ${quoteForNeed("product")}
When you have a name and an email or phone, offer one of these free 20-minute audit slots (Africa/Nairobi): ${slotLine}
Do not invent prices, metrics, or customer quotes.`;
}

function addDays(dateKey: string, days: number): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  const next = new Date(Date.UTC(year, month - 1, day + days));
  return next.toISOString().slice(0, 10);
}

export function upcomingAuditSlots(booked: BookedSlot[], limit = 4): OfferedSlot[] {
  const { dateKey } = getNowInTimezone();
  const duration = durationForMeeting("automation-audit");
  const offered: OfferedSlot[] = [];
  for (let offset = 0; offset < 21 && offered.length < limit; offset += 1) {
    const date = addDays(dateKey, offset);
    if (!isDayAvailable(parseDateKey(date))) continue;
    for (const time of generateTimeSlots(date, booked, duration)) {
      offered.push({
        date,
        time,
        label: `${formatDateDisplay(date, { weekday: "short", month: "short", day: "numeric" })} at ${formatTimeDisplay(time)}`,
      });
      if (offered.length >= limit) break;
    }
  }
  return offered;
}

export function conversationTranscript(messages: BeaconChatMessage[], qualification = qualifyFromMessages(messages)): string {
  const lines = [
    "Beacon AI chat",
    qualification && leadCategory(qualification) ? `Category: ${leadCategory(qualification)}` : "",
    qualification?.budget ? `Budget: ${qualification.budget}` : "",
    qualification?.timeline ? `Timeline: ${qualification.timeline}` : "",
    "",
    ...messages.map((message) => `${message.role === "user" ? "Visitor" : "Beacon"}: ${message.content}`),
  ].filter((line, index) => line !== "" || index > 0);
  return lines.join("\n").trim().slice(0, 8000);
}

function asksPrice(text: string): boolean {
  return /\b(price|cost|how much|quote|pricing|kes|budget)\b/i.test(text);
}

function asksBook(text: string): boolean {
  return /\b(book|booking|call|slot|audit|meet|schedule)\b/i.test(text);
}

export function scriptedAssistantReply(messages: BeaconChatMessage[], slots: OfferedSlot[]): ScriptedReply {
  const qualification = qualifyFromMessages(messages);
  const last = [...messages].reverse().find((message) => message.role === "user")?.content ?? "";
  const contactReady = Boolean(qualification.name && (qualification.email || qualification.phone));
  const missing = [
    !qualification.needs ? "needs" : "",
    !qualification.industry ? "industry" : "",
    !qualification.budget ? "budget" : "",
    !qualification.timeline ? "timeline" : "",
    !qualification.name ? "name" : "",
    !qualification.email && !qualification.phone ? "contact" : "",
  ].filter(Boolean);

  const parts: string[] = [];
  const showQuote = Boolean(qualification.needs) && (asksPrice(last) || missing[0] !== "needs");
  if (showQuote && qualification.needs) parts.push(quoteForNeed(qualification.needs));
  else if (!qualification.needs && asksPrice(last)) parts.push(quoteForNeed("automation"));

  const next = missing[0];
  if (next === "needs") {
    parts.push("What should we help with: an automation, custom software, managed IT, or one of the products?");
  } else if (next === "industry") {
    parts.push("Which industry is this for? A clinic, school, SACCO, property, shop, or something else.");
  } else if (next === "budget") {
    parts.push("What budget should we plan around? “Not sure yet” is a fine answer.");
  } else if (next === "timeline") {
    parts.push("When do you want this live: as soon as possible, this month, a few months, or are you exploring?");
  } else if (next === "name" || next === "contact") {
    parts.push("Leave your name and an email or phone, and I can book the free 20-minute audit.");
  } else if (slots.length) {
    parts.push(`I can book the free 20-minute audit. Open slots: ${slots.map((slot) => slot.label).join("; ")}.`);
  } else {
    parts.push("The free 20-minute audit is open on weekdays. Use the booking page and pick a slot.");
  }

  const offerSlots = contactReady && (asksBook(last) || missing.length === 0) && slots.length > 0;
  if (offerSlots && next) {
    parts.push(`Or pick a slot now: ${slots.map((slot) => slot.label).join("; ")}.`);
  }

  return {
    text: parts.filter(Boolean).join("\n\n"),
    offerSlots,
    contact: {
      name: qualification.name,
      email: qualification.email,
      phone: qualification.phone,
    },
    category: leadCategory(qualification),
    budget: qualification.budget,
  };
}

export function slotFromLabel(slots: OfferedSlot[], date: string, time: string): OfferedSlot | undefined {
  return slots.find((slot) => slot.date === date && slot.time === time);
}
