import { siteConfig } from "@/data/site";

export type Intent =
  | "hire"
  | "experience"
  | "skills"
  | "projects"
  | "products"
  | "services"
  | "contact"
  | "newsletter"
  | "booking"
  | "about"
  | "status"
  | "location"
  | "stats"
  | "testimonials"
  | "personality"
  | "currently"
  | "greeting"
  | "engagement"
  | "intake"
  | "pricing"
  | "portal"
  | "faq"
  | "deposits";

type IntentRule = {
  intent: Intent;
  keywords: string[];
  patterns?: RegExp[];
  weight?: number;
};

export type KnowledgeResponse = {
  reply: string;
  confidence: number;
  intent: Intent | "fallback";
  source: "knowledge-base";
};

const {
  brand,
  founder,
  email,
  location,
  currently,
  skills,
  experience,
  projects,
  products,
  services,
  stats,
  testimonials,
  personalityTraits,
  assistant,
  booking,
  engagementModels,
  intake,
  pricingTiers,
  pricingDisclaimer,
  faq,
} = siteConfig;

const depositPct =
  siteConfig.payments.depositPercent ??
  siteConfig.payments.defaultDepositPercent ??
  30;

const INTENT_RULES: IntentRule[] = [
  {
    intent: "hire",
    keywords: [
      "hire",
      "hiring",
      "work together",
      "freelance",
      "contract",
      "collaborate",
      "custom",
      "build for",
      "build me",
      "client",
      "agency",
    ],
    patterns: [/how can i (hire|work with|reach)/i, /want to (hire|work with)/i, /build (a |my )/i],
    weight: 1.3,
  },
  {
    intent: "products",
    keywords: [
      "product",
      "suite",
      "cloud app",
      "software basket",
      "apps",
      ...products.flatMap((p) => [p.id, p.name.toLowerCase()]),
    ],
    patterns: [/what (products|apps)/i, /product suite/i],
    weight: 1.4,
  },
  {
    intent: "services",
    keywords: ["service", "custom app", "saas", "api", "redesign", "rebuild"],
    patterns: [/what (services|do you offer)/i, /custom (software|app|build)/i],
    weight: 1.3,
  },
  {
    intent: "experience",
    keywords: ["experience", "background", "resume", "cv", "work history", "career"],
    patterns: [/what('s| is) your experience/i],
    weight: 1.1,
  },
  {
    intent: "skills",
    keywords: ["skill", "tech", "stack", "technologies", "tools", "framework", "language"],
    patterns: [/what('s| is) your stack/i],
    weight: 1.1,
  },
  {
    intent: "projects",
    keywords: ["project", "case study", "portfolio", "shipped", "work sample"],
    patterns: [/case stud/i, /show me (your )?work/i],
    weight: 1.2,
  },
  {
    intent: "contact",
    keywords: ["contact", "email", "reach", "hello", "talk", "message", "get in touch"],
    patterns: [/how (do i|can i) (contact|reach)/i],
    weight: 1.1,
  },
  {
    intent: "newsletter",
    keywords: ["newsletter", "subscribe", "updates", "notify", "mailing list"],
    weight: 1,
  },
  {
    intent: "booking",
    keywords: ["book", "call", "meeting", "schedule", "calendar", "intro call", "slot"],
    patterns: [/book a (call|meeting|time)/i],
    weight: 1.1,
  },
  {
    intent: "portal",
    keywords: ["portal", "client login", "magic link", "otp", "project progress", "client account"],
    patterns: [/client portal/i, /portal\/login/i],
    weight: 1.45,
  },
  {
    intent: "faq",
    keywords: ["faq", "frequently", "common question", "how does it work"],
    patterns: [/frequently asked/i],
    weight: 1.2,
  },
  {
    intent: "deposits",
    keywords: ["deposit", "stripe", "m-pesa", "mpesa", "payment", "checkout", "pay"],
    patterns: [/30%|thirty percent/i, /pay (a )?deposit/i],
    weight: 1.45,
  },
  {
    intent: "engagement",
    keywords: [
      "engagement",
      "retainer",
      "fixed",
      "equity",
      "pricing model",
      "how do you charge",
      "partner",
    ],
    patterns: [/engagement model/i, /fixed (scope|fee)/i, /equity.?friendly/i],
    weight: 1.35,
  },
  {
    intent: "pricing",
    keywords: [
      "pricing",
      "price",
      "cost",
      "budget",
      "how much",
      "rates",
      "quote",
      "estimate",
      "sprint",
      "$",
    ],
    patterns: [/how much (do you|does it)/i, /what('s| is) (your |the )?pric/i],
    weight: 1.4,
  },
  {
    intent: "intake",
    keywords: ["start a project", "intake", "brief", "proposal", "get started", "kickoff", "launch plan"],
    patterns: [/start (a )?project/i, /project intake/i],
    weight: 1.35,
  },
  {
    intent: "about",
    keywords: [
      "who",
      "about",
      "introduce",
      "quoramax",
      "founder",
      "maximillian",
      "bio",
    ],
    patterns: [/who (are you|is max|is maximillian|is quoramax)/i, /tell me about/i],
    weight: 1.2,
  },
  {
    intent: "status",
    keywords: ["available", "open", "busy", "status", "looking for work"],
    weight: 1,
  },
  {
    intent: "location",
    keywords: ["location", "where", "based", "timezone", "kenya", "nairobi"],
    weight: 1,
  },
  {
    intent: "stats",
    keywords: ["years", "how many", "metrics", "numbers", "stats"],
    weight: 0.9,
  },
  {
    intent: "testimonials",
    keywords: ["testimonial", "review", "recommend", "feedback"],
    weight: 0.9,
  },
  {
    intent: "personality",
    keywords: ["personality", "fun fact", "hobbies", "coffee"],
    weight: 0.9,
  },
  {
    intent: "currently",
    keywords: ["currently", "right now", "building now", "this week", "focus"],
    weight: 1,
  },
  {
    intent: "greeting",
    keywords: ["hi", "hello", "hey", "good morning", "good afternoon", "good evening"],
    patterns: [/^(hi|hello|hey)[!.?\s]*$/i],
    weight: 0.8,
  },
];

function scoreIntent(message: string, rule: IntentRule): number {
  const lower = message.toLowerCase();
  let score = 0;

  for (const keyword of rule.keywords) {
    if (lower.includes(keyword)) score += 1;
  }

  if (rule.patterns) {
    for (const pattern of rule.patterns) {
      if (pattern.test(message)) score += 2;
    }
  }

  return score * (rule.weight ?? 1);
}

function detectIntent(message: string): { intent: Intent; confidence: number } {
  let bestIntent: Intent = "about";
  let bestScore = 0;

  for (const rule of INTENT_RULES) {
    const score = scoreIntent(message, rule);
    if (score > bestScore) {
      bestScore = score;
      bestIntent = rule.intent;
    }
  }

  return { intent: bestIntent, confidence: Math.min(1, bestScore / 3) };
}

function formatExperience(): string {
  return experience
    .map(
      (e) =>
        `${e.role} at ${e.company} (${e.period})${e.current ? " — current" : ""}: ${e.description}`
    )
    .join("\n• ");
}

function formatSkills(): string {
  return skills.map((c) => `${c.name}: ${c.skills.join(", ")}`).join(" | ");
}

function formatProjects(): string {
  return projects
    .map((p) => `${p.title}${p.comingSoon ? " (coming soon)" : ""} — ${p.description}`)
    .join("\n• ");
}

function formatProducts(): string {
  return products
    .map(
      (p) =>
        `**${p.name}** [${p.status}]: ${p.tagline} — [Open ${p.name}](/products/${p.id})`
    )
    .join("\n• ");
}

function findProductMention(message: string) {
  const lower = message.toLowerCase();
  return products.find(
    (p) =>
      lower.includes(p.id) ||
      lower.includes(p.name.toLowerCase()) ||
      (p.id === "confilearn" &&
        (lower.includes("nest") || lower.includes("lms") || lower.includes("course"))) ||
      (p.id === "lookfinesse" &&
        (lower.includes("marketplace") || lower.includes("fashion"))) ||
      (p.id === "cadence" && lower.includes("rhythm")) ||
      (p.id === "confirent" && lower.includes("rent"))
  );
}

function formatServices(): string {
  return services.map((s) => `${s.title} — ${s.description}`).join("\n• ");
}

function formatEngagement(): string {
  return engagementModels
    .map((m) => `${m.name}: ${m.headline} — ${m.description} (Best for: ${m.bestFor})`)
    .join("\n• ");
}

function formatPricing(): string {
  return pricingTiers
    .map(
      (t) =>
        `${t.name}: from ${t.fromPrice} ${t.unit} — ${t.headline}. Includes: ${t.includes.join("; ")}`
    )
    .join("\n• ");
}

function formatFaq(limit = 4): string {
  return faq
    .slice(0, limit)
    .map((f) => `**${f.question}**\n${f.answer}`)
    .join("\n\n");
}

function buildReply(intent: Intent): string {
  switch (intent) {
    case "hire":
      return `${brand.name} takes on custom projects — apps, SaaS, APIs, redesigns. Status: ${currently.status.toLowerCase()}. Fastest paths: [Start a Project](/#services), [Book a Call](/#book) (${booking.hoursStart}–${booking.hoursEnd} EAT), or email ${email}. ${siteConfig.servicesPricingNote}`;

    case "products":
      return `${brand.name}'s product suite:\n• ${formatProducts()}\n\nProduct pages: [LookFinesse](/products/lookfinesse), [ConfiLearn](/products/confilearn), [CadenceApp](/products/cadence), [ConfiRent](/products/confirent). Custom work? Ask about [services](/#services) or [Start a Project](/#services).`;

    case "services":
      return `What ${brand.name} builds for clients:\n• ${formatServices()}\n${siteConfig.servicesPricingNote}\nSee [Services](/#services), [Start a Project](/#services), or [Book a Call](/#book) — email ${email} works too.`;

    case "engagement":
      return `${brand.name} engagement models:\n• ${formatEngagement()}\nSee [Pricing](/#pricing) for USD ranges, or [Start a Project](/#services) / [Book a Call](/#book) to talk through fit.`;

    case "pricing":
      return `${brand.name} pricing (USD estimates):\n• ${formatPricing()}\n${pricingDisclaimer}\nDeposits: ${depositPct}% via Stripe or M-Pesa — details at [Pricing](/#pricing). [Book a Call](/#book) for a scoped quote.`;

    case "deposits":
      return `Kick off with a **${depositPct}% deposit** of the tier floor. Pay via **Stripe Checkout** or **M-Pesa STK Push** on [Pricing](/#pricing) or during intake. Client portal: [Portal login](/portal/login). Without payment keys configured, you'll get a graceful “coming soon” with email / book fallbacks.`;

    case "intake":
      return intake.enabled
        ? `Use [Start a Project](/#services) — a short wizard (type → budget → timeline → brief → contact). Submissions land in our admin inbox and open a client [portal](/portal/login). Or [Book a Call](/#book) if you'd rather talk first.`
        : `Email ${email} or [Book a Call](/#book) to start a project with ${brand.name}.`;

    case "portal":
      return `Clients track progress, docs, and messages in the **client portal**. Sign in at [Portal login](/portal/login) with a one-time code (emailed when Resend is configured, otherwise shown on-screen). Submit a project intake first if you don't have an account yet — [Start a Project](/#services).`;

    case "faq":
      return `Top answers from our FAQ:\n\n${formatFaq()}\n\nMore at [FAQ](/#faq).`;

    case "experience":
      return `${founder.name} (${founder.role}) leads ${brand.name}. Background:\n• ${formatExperience()}\nMeet Max: [About](/#about).`;

    case "skills":
      return `${brand.name} toolkit:\n${formatSkills()}\nFocus: ${currently.focus.join(", ")}.`;

    case "projects":
      return `Selected work & case studies:\n• ${formatProjects()}\nAlso see the [product suite](/#products).`;

    case "contact":
      return `Reach ${brand.name} at ${email} — typically 1–2 business days (EAT). Or use [Contact](/#contact), [Book a Call](/#book), or call ${siteConfig.phoneDisplay}.`;

    case "newsletter":
      return `Subscribe via the newsletter popup or footer for ${brand.name} product launches and studio notes. No spam. Prefer a call? [Book](/#book).`;

    case "booking":
      return `Book a ${booking.slotDuration}-minute call — Mon–Fri, ${booking.hoursStart}–${booking.hoursEnd} (EAT / ${booking.timezone.replace("_", " ")}). Types: ${booking.meetingTypes.map((m) => m.label).join(", ")}. Open [Book a Call](/#book).`;

    case "about":
      return `${assistant.name} here! ${brand.name} is ${founder.name}'s product studio — ${brand.tagline}\n\n${founder.bio.trim().split("\n\n")[0]}\n\n[Meet the founder](/#about) · Ask about products, custom builds, or [booking](/#book).`;

    case "status":
      return `${brand.name} is currently: "${currently.status}". Building: ${currently.building}.`;

    case "location":
      return `${brand.name} is based in ${location}. Booking times: EAT (UTC+3). Remote-friendly worldwide. [Book a Call](/#book).`;

    case "stats":
      return `${brand.name} highlights: ${stats.map((s) => `${s.value}${s.suffix ?? ""} ${s.label.toLowerCase()}`).join(" · ")}.`;

    case "testimonials":
      if (testimonials.length === 0)
        return `No testimonials listed yet — check [Work](/#work) and [Products](/#products).`;
      return `What people say:\n${testimonials.map((t) => `"${t.quote}" — ${t.author}, ${t.role}`).join("\n")}`;

    case "personality":
      return `${founder.shortName} in a nutshell: ${personalityTraits.map((t) => t.label).join(" · ")}. ${founder.bio.trim().split("\n\n").slice(-1)[0]}`;

    case "currently":
      return `Right now ${brand.name} is ${currently.status.toLowerCase()}, building ${currently.building}, focused on ${currently.focus.join(", ")}.`;

    case "greeting":
      return assistant.greeting;

    default:
      return `${assistant.name} here! I can tell you about ${brand.name}'s [products](/#products), [pricing](/#pricing), [portal](/portal/login), or how to [start a project](/#services). Try "What is ConfiLearn?" or "How do deposits work?"`;
  }
}

export function getKnowledgeResponse(userMessage: string): KnowledgeResponse {
  const trimmed = userMessage.trim();
  if (!trimmed) {
    return { reply: assistant.greeting, confidence: 1, intent: "greeting", source: "knowledge-base" };
  }

  const mentioned = findProductMention(trimmed);
  if (mentioned) {
    const productFocused =
      /what is|tell me about|who is|explain|access|open|page|status|offer|feature/i.test(
        trimmed
      ) ||
      trimmed.toLowerCase().includes(mentioned.name.toLowerCase()) ||
      trimmed.toLowerCase().includes(mentioned.id);

    if (productFocused) {
      return {
        reply: `**${mentioned.name}** [${mentioned.status} / ${mentioned.operationalStatus}]\n${mentioned.longDescription ?? mentioned.description}\n\n• Product page: [/products/${mentioned.id}](/products/${mentioned.id})${mentioned.githubUrl ? `\n• GitHub: ${mentioned.githubUrl}` : ""}\n• Start custom work: [Start a Project](/#services) · [Book a Call](/#book)`,
        confidence: 0.95,
        intent: "products",
        source: "knowledge-base",
      };
    }
  }

  const { intent, confidence } = detectIntent(trimmed);

  if (confidence < 0.25) {
    return {
      reply: `I'm ${assistant.name}, ${brand.name}'s studio assistant. Ask about [LookFinesse](/products/lookfinesse), [ConfiLearn](/products/confilearn), [CadenceApp](/products/cadence), [ConfiRent](/products/confirent), [pricing](/#pricing), [portal](/portal/login), or how to get in touch (${email}).`,
      confidence: 0.3,
      intent: "fallback",
      source: "knowledge-base",
    };
  }

  return {
    reply: buildReply(intent),
    confidence,
    intent,
    source: "knowledge-base",
  };
}

export function shouldUseOpenAI(userMessage: string): boolean {
  const { confidence } = getKnowledgeResponse(userMessage);
  const trimmed = userMessage.trim();

  if (confidence >= 0.55) return false;

  const isComplex =
    trimmed.length > 120 ||
    trimmed.split(/\s+/).length > 25 ||
    /compare|explain in detail|why did|how would you|architecture|design decision|walk me through/i.test(
      trimmed
    );

  return isComplex;
}
