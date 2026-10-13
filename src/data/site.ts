/**
 * The Beacon Studio site configuration — edit this file to customize brand, products, services, and intake.
 *
 * Product suite: add/remove objects in `products[]` — UI and counts scale automatically.
 *
 * Brand: "The Beacon Studio" (display/legal) · short form "Beacon" · founder Maximillian / Max.
 */

export type ProductStatus = "live" | "coming-soon" | "beta";

export type OperationalStatus = "operational" | "degraded" | "maintenance" | "building";

export type Product = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  /** Longer copy for the product detail drawer */
  longDescription?: string;
  tags: string[];
  status: ProductStatus;
  operationalStatus: OperationalStatus;
  liveUrl: string;
  /** Public GitHub repo when available */
  githubUrl?: string;
  docsUrl?: string;
  image: string;
};

export type Service = {
  id: string;
  title: string;
  description: string;
  tags: string[];
};

export type EngagementModel = {
  id: string;
  name: string;
  headline: string;
  description: string;
  bestFor: string;
  highlights: string[];
};

export type HowItWorksStep = {
  id: string;
  step: number;
  title: string;
  description: string;
};

export type Project = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  liveUrl: string;
  githubUrl: string;
  /** Cover image path under /public */
  image: string;
  previewVideo?: string;
  comingSoon?: boolean;
  /** Client work | product | internal */
  kind?: "client" | "product" | "internal";
};

export type SkillCategory = {
  name: string;
  skills: string[];
  variant?: "large" | "wide" | "default";
  shape?: "circle" | "hexagon" | "diamond" | "squiggle";
  accent?: "cyan" | "coral" | "amber" | "violet";
};

export type SocialLink = {
  name: string;
  href: string;
  icon: "github" | "linkedin" | "email" | "twitter";
};

export type Stat = {
  label: string;
  value: string;
  suffix?: string;
};

export type ExperienceEntry = {
  id: string;
  role: string;
  company: string;
  period: string;
  description: string;
  tags: string[];
  logo?: string;
  accent?: "cyan" | "coral" | "amber" | "violet";
  current?: boolean;
};

export type Testimonial = {
  id: string;
  quote: string;
  author: string;
  role: string;
  avatar?: string;
};

export type NavSection = {
  id: string;
  label: string;
};

export type PersonalityTrait = {
  label: string;
  emoji?: string;
};

export type MeetMeVideo = {
  url: string;
  poster: string;
  title: string;
  caption?: string;
};

export type IntakeProjectType = {
  id: string;
  label: string;
  description: string;
};

export type IntakeBudget = {
  id: string;
  label: string;
};

export type IntakeTimeline = {
  id: string;
  label: string;
};

export type ChangelogEntry = {
  id: string;
  date: string;
  title: string;
  summary: string;
  /** Optional product id from products[] */
  productId?: string;
  tag: "shipped" | "improved" | "studio";
};

export type TechStackItem = {
  id: string;
  name: string;
  category: "language" | "framework" | "platform" | "data" | "design";
  /** Product ids from products[] that use this tech */
  usedIn: string[];
};

export type EstimatorProjectType = {
  id: string;
  label: string;
  baseWeeks: number;
  /** Base cost floor in USD before complexity multiplier */
  baseCostFrom: number;
  /** Base cost ceiling in USD before complexity multiplier */
  baseCostTo: number;
};

export type EstimatorComplexity = {
  id: string;
  label: string;
  multiplier: number;
};

export type PricingTier = {
  id: string;
  name: string;
  headline: string;
  fromPrice: string;
  /** Numeric floor for payment / estimator wiring */
  fromAmount: number;
  unit: string;
  includes: string[];
  cta: string;
  ctaAction: "intake" | "booking" | "access";
  featured?: boolean;
  /** Optional Stripe Price id env key hint (see .env.example) */
  stripePriceEnv?: string;
  /** Studio builds vs AI automation offer ladder */
  group?: "studio" | "automation";
  /** No online deposit — price is quoted after discovery */
  quoteOnly?: boolean;
};

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

export type AutomationStep = {
  id: string;
  title: string;
  description: string;
};

export type AutomationUseCase = {
  id: string;
  industry: string;
  line: string;
};

export type TrustLogo = {
  id: string;
  name: string;
};

export type ComparisonRow = {
  id: string;
  capability: string;
  withUs: string;
  diy: string;
  agency: string;
};

export type ReliabilityItem = {
  id: string;
  label: string;
  value: string;
};

/**
 * Products array — add unlimited entries; suite UI scales from this.
 *
 * Order: LookFinesse (flagship) → ConfiLearn (LMS) → CadenceApp → ConfiRent → TriviaYard.
 * Update liveUrl only when a public deploy URL exists in the product README.
 *
 * LMS naming (ex-LuminousLMS): primary brand is ConfiLearn.
 * ConfiLearn chosen; Nest avoided due to NestJS collision.
 * Runners-up: Nest, Campus, Lesson, Cohort, Scholar, Primer, Brightpath, Studio Learn.
 * Avoided: Nest (NestJS), LuminousLMS, Quoramax; Scholar/Primer/Campus had stronger brand collisions.
 */
const products = [
  {
    id: "lookfinesse",
    name: "LookFinesse",
    tagline: "Sell fashion, beauty & fitness online — with Kenya-ready payments.",
    description:
      "Shop, bookings, and Kenya-ready payments for fashion, beauty, and fitness creators.",
    longDescription:
      "LookFinesse is The Beacon Studio's flagship creator marketplace for fashion, beauty, and fitness — social feed, shop, vendor dashboards, ads, and payments (M-Pesa + Stripe). Built for the African creator economy with a mobile-first Next.js + Supabase commerce surface.",
    tags: ["Marketplace", "M-Pesa", "Next.js"],
    status: "live" as ProductStatus,
    operationalStatus: "operational" as OperationalStatus,
    liveUrl: "https://lookfinesseke-0cf56b906a55.herokuapp.com/",
    docsUrl: "",
    image: "/images/projects/lookfinesse.svg",
  },
  {
    id: "confilearn",
    name: "ConfiLearn",
    tagline: "Run live classes and courses — tutors get paid via M-Pesa.",
    description:
      "Live classes and courses, with tutor payouts via M-Pesa.",
    longDescription:
      "ConfiLearn is a learning platform for live classes and on-demand courses. Tutors get a studio for authoring, learners get progress, streaks, XP, and certificates, and payouts go via M-Pesa. Shaped for African learners and educators — TanStack Start, React, Supabase, and Cloudflare.",
    tags: ["EdTech", "Live classes", "M-Pesa"],
    status: "beta" as ProductStatus,
    operationalStatus: "building" as OperationalStatus,
    liveUrl: "",
    githubUrl: "https://github.com/MaximaKenya/luminouslms",
    docsUrl: "",
    image: "/images/projects/confilearn.svg",
  },
  {
    id: "cadenceapp",
    name: "CadenceApp",
    tagline: "Planning rhythm for teams that need to ship on schedule.",
    description: "Keep the week visible so work ships on schedule.",
    longDescription:
      "CadenceApp is Beacon’s planning and ops rhythm for teams that need to ship on schedule. It is early: the public GitHub repo is live while the product surface is still taking shape. Use it when you want cadence, not another noisy task dump.",
    tags: ["Ops", "Planning"],
    status: "coming-soon" as ProductStatus,
    operationalStatus: "building" as OperationalStatus,
    liveUrl: "",
    githubUrl: "https://github.com/MaximaKenya/CadenceApp",
    docsUrl: "",
    image: "/images/projects/cadenceapp.svg",
  },
  {
    // TODO(ConfiRent): replace stub when user uploads the local repo (expected soon).
    id: "confirent",
    name: "ConfiRent",
    tagline: "Rental ops with clearer trust between hosts and renters.",
    description: "Coming soon — listings, deposits, and handoffs with clearer trust.",
    longDescription:
      "ConfiRent is Beacon’s coming-soon rental ops product. The idea is clearer trust between hosts and renters — listings you can stand behind, deposits you can follow, and handoffs that don’t disappear into chat threads. Stack, screenshots, and links land when the repo is ready.",
    tags: ["Rentals", "Coming soon"],
    status: "coming-soon" as ProductStatus,
    operationalStatus: "building" as OperationalStatus,
    liveUrl: "",
    docsUrl: "",
    image: "/images/projects/confirent.svg",
  },
  {
    id: "triviayard",
    name: "TriviaYard",
    tagline: "Live trivia and play that keeps audiences coming back.",
    description: "Live trivia and audience play for communities, venues, and brands.",
    longDescription:
      "TriviaYard is Beacon’s coming-soon wing for live trivia and audience entertainment. Host a round, keep the room playing, and give communities a reason to come back. Full stack, screenshots, and links will land as the product ships.",
    tags: ["Trivia", "Live play"],
    status: "live" as ProductStatus,
    operationalStatus: "operational" as OperationalStatus,
    liveUrl: "https://triviayard-9cf8a6eb71ba.herokuapp.com/",
    docsUrl: "",
    image: "/images/projects/triviayard.svg",
  },
] satisfies Product[];

export const siteConfig = {
  brand: {
    /** Primary display lockup — hero, header, footer, SEO */
    name: "The Beacon Studio",
    /** Short form for tight UI after first mention */
    shortName: "Beacon",
    legalName: "The Beacon Studio",
    /** Legacy initials (favicon now uses the signal mark) */
    initials: "Be",
    /** Short brand line (hero can use a stronger business headline) */
    tagline: "Cloud products & custom software.",
    /** Unique lockup — differentiates from similarly named creative agencies */
    lockup: "cloud products & custom software",
    description:
      "The Beacon Studio is a Nairobi software product studio. Cloud apps, custom builds, and AI automation for repetitive work.",
    /** Footer / legal disambiguation (not a film or media production company) */
    disambiguation:
      "A software product studio in Nairobi — cloud apps and custom builds. Not affiliated with film or media production companies of a similar name.",
  },

  founder: {
    name: "Maximillian",
    shortName: "Max",
    role: "Founder & Product Builder",
    bio: `I'm Max, founder of The Beacon Studio. I build cloud products and custom software from Nairobi (EAT), for teams anywhere.`,
    location: "Nairobi, Kenya",
    timezone: "Africa/Nairobi",
  },

  /** Brand display name used in header / footer / SEO */
  name: "The Beacon Studio",
  role: "Software Product Studio",
  tagline: "Cloud products & custom software.",
  bio: `I'm Max, founder of The Beacon Studio. I build cloud products and custom software from Nairobi (EAT), for teams anywhere.`,

  /** TODO(go-live): replace email, phone, LinkedIn, Twitter before public launch */
  email: "hello@example.com",
  /** Kenya E.164 — edit to your real number */
  phone: "+254700000000",
  /** Display form for UI */
  phoneDisplay: "+254 700 000 000",
  location: "Nairobi, Kenya",

  profileImage: "/images/profile/profile.jpg",
  profileImageAlt: "Maximillian, founder of The Beacon Studio",

  /** Kept for assets; About UI shows founder photo only */
  aboutImages: [] as { src: string; alt: string }[],

  personalityTraits: [
    { label: "Ships with care" },
    { label: "Product-minded" },
    { label: "Clear communicator" },
    { label: "Always learning" },
  ] satisfies PersonalityTrait[],

  meetMeVideo: {
    url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    poster: "/images/video/meet-me-poster.jpg",
    title: "Meet the founder",
    caption: "A quick hello from Max — swap this embed URL in site.ts with your real intro video.",
  } satisfies MeetMeVideo,

  heroVideo: "" as string,

  seo: {
    siteUrl: "https://the-beacon-studio-0def818a6eaf.herokuapp.com",
    ogImage: "/og-image.png",
    twitterHandle: "@yourusername",
    title: "The Beacon Studio — Cloud Products & Custom Software",
    description:
      "Cloud apps, custom software, and AI automation for organizations in Kenya — WhatsApp automation, missed-call follow-up, lead capture, and routine admin. Nairobi product studio.",
    keywords: [
      "The Beacon Studio",
      "Beacon",
      "Beacon Studio software",
      "LookFinesse",
      "ConfiLearn",
      "CadenceApp",
      "ConfiRent",
      "TriviaYard",
      "custom software development",
      "cloud apps",
      "SaaS studio Kenya",
      "Nairobi software studio",
      "product studio",
      "hire software developer Kenya",
      "custom SaaS development",
      "AI automation Kenya",
      "WhatsApp automation",
      "lead follow-up automation",
    ],
  },

  cta: {
    primary: "Explore products",
    secondary: "Start a project",
    tertiary: "Book a call",
  },

  /** Benefit-led hero — suite of cloud apps + custom builds */
  heroHeadline: "Cloud apps, custom software, and automation.",
  /** Short supporting line under suite chips (chips render via SuiteLine). */
  heroSubhead: "Use our products, hire us to build, or automate the repetitive work. Nairobi / EAT.",

  /**
   * What clients gain — shown in Services and related CTAs.
   */
  clientGains: [
    "Weekly demos and a scoped plan",
    "Live progress in your client portal",
    "Direct messaging, plus Glow for quick answers",
    "Cloud apps, custom builds, or one automated workflow",
  ],

  currently: {
    status: "Open for custom builds",
    statusType: "available" as "available" | "busy" | "building",
    building: "LookFinesse and TriviaYard live",

    focus: ["Next.js", "TypeScript", "Cloud SaaS"],
  },

  stats: [
    { label: "Products in suite", value: String(products.length), suffix: "" },
    { label: "Years building", value: "3", suffix: "+" },
    { label: "Projects shipped", value: "12", suffix: "+" },
    { label: "Timezone", value: "EAT", suffix: "" },
  ] satisfies Stat[],

  social: [
    {
      name: "GitHub",
      href: "https://github.com/MaximaKenya",
      icon: "github" as const,
    },
    {
      name: "LinkedIn",
      href: "https://linkedin.com/in/yourusername",
      icon: "linkedin" as const,
    },
    {
      name: "Email",
      href: "mailto:hello@example.com",
      icon: "email" as const,
    },
  ] satisfies SocialLink[],

  navigation: [
    { id: "products", label: "Products" },
    { id: "automation", label: "Automation" },
    { id: "services", label: "Services" },
    { id: "pricing", label: "Pricing" },
    { id: "about", label: "About" },
    { id: "work", label: "Work" },
    { id: "faq", label: "FAQ" },
    { id: "book", label: "Book" },
    { id: "contact", label: "Contact" },
  ] satisfies NavSection[],

  /**
   * Product suite — add unlimited products here.
   * status: "live" | "beta" | "coming-soon"
   * operationalStatus: "operational" | "degraded" | "maintenance" | "building"
   */
  products,

  services: [
    {
      id: "ai-automation",
      title: "AI Automation",
      description:
        "Automate enquiries, missed-call follow-ups, and routine admin — the personal service stays.",
      tags: ["WhatsApp", "Lead follow-up", "Reminders"],
    },
    {
      id: "custom-apps",
      title: "Custom apps & SaaS",
      description: "MVP to a product your team can own, with weekly demos.",
      tags: ["Next.js", "TypeScript", "Portal"],
    },
    {
      id: "product-suite",
      title: "Product suite",
      description: "Adopt or extend LookFinesse, ConfiLearn, CadenceApp, ConfiRent, or TriviaYard.",
      tags: ["LookFinesse", "ConfiLearn", "CadenceApp"],
    },
    {
      id: "ops-payments",
      title: "Quotes & messaging",
      description: "Branded quotes, portal messaging, and Glow for quick answers.",
      tags: ["Quotes", "Messaging", "Glow"],
    },
    {
      id: "launch",
      title: "Launch partnerships",
      description: "Discovery, build sprints, then handoff or a retainer.",
      tags: ["Discovery", "Handoff", "Retainer"],
    },
  ] satisfies Service[],

  engagementModels: [
    {
      id: "fixed",
      name: "Fixed scope",
      headline: "Clear brief. Clear price.",
      description: "A locked scope, timeline, and fee for a known outcome.",
      bestFor: "MVPs, launches, bounded rebuilds",
      highlights: ["Scoped discovery", "Milestone demos", "Fixed fee"],
    },
    {
      id: "retainer",
      name: "Retainer",
      headline: "Ongoing craft on tap.",
      description: "Monthly capacity for features, polish, and support.",
      bestFor: "Growing products & continuous delivery",
      highlights: ["Reserved capacity", "Priority response", "Flexible backlog"],
    },
    {
      id: "equity",
      name: "Equity-friendly",
      headline: "Aligned upside for the right builds.",
      description: "Reduced cash plus equity, when the product and team fit.",
      bestFor: "Early founders with strong product fit",
      highlights: ["Hybrid cash + equity", "Deep partnership", "By invitation"],
    },
  ] satisfies EngagementModel[],

  /**
   * Pricing / engagement tiers — SME-friendly USD floors (Kenya + global).
   * Shown as "From $X". Final quotes after discovery.
   */
  pricingTiers: [
    {
      id: "sprint",
      name: "Sprint",
      headline: "Ship one focused slice fast.",
      fromPrice: "From $800",
      fromAmount: 800,
      unit: "per engagement · typical $800–1,500",
      includes: [
        "1–2 week focused build",
        "Scoped outcome & weekly demo",
        "Production-ready TypeScript",
        "Handoff notes & Loom walkthrough",
      ],
      cta: "Start your build",
      ctaAction: "intake",
      stripePriceEnv: "STRIPE_PRICE_SPRINT_DEPOSIT",
      group: "studio",
    },
    {
      id: "product-build",
      name: "Product build",
      headline: "MVP to launch-ready — lower rewrite risk.",
      fromPrice: "From $3,000",
      fromAmount: 3000,
      unit: "scoped project · typical $3k–8k",
      includes: [
        "Discovery → build → launch",
        "UI/UX + API + cloud deploy",
        "Milestone demos every week",
        "Docs, auth patterns, and handoff",
      ],
      cta: "Get a launch plan",
      ctaAction: "intake",
      featured: true,
      stripePriceEnv: "STRIPE_PRICE_PRODUCT_DEPOSIT",
      group: "studio",
    },
    {
      id: "retainer",
      name: "Retainer",
      headline: "Reserved capacity every month.",
      fromPrice: "From $1,500",
      fromAmount: 1500,
      unit: "per month · typical $1.5k–3k",
      includes: [
        "Reserved engineering hours",
        "Priority response (EAT business days)",
        "Features, polish & ops support",
        "Pause or resize with notice",
      ],
      cta: "Call us",
      ctaAction: "booking",
      stripePriceEnv: "STRIPE_PRICE_RETAINER_DEPOSIT",
      group: "studio",
    },
    {
      id: "automation-pilot",
      name: "Automation Pilot",
      headline: "One workflow, in 2–3 weeks.",
      fromPrice: "From $1,350",
      fromAmount: 1350,
      unit: "one workflow · 2–3 weeks",
      includes: [
        "One workflow on your tools",
        "Agreed test runs",
        "Fixed delivery date",
        "Clear success criteria",
      ],
      cta: "Start a pilot",
      ctaAction: "intake",
      group: "automation",
    },
    {
      id: "automation-retainer",
      name: "Automation Retainer",
      headline: "Keep that workflow healthy.",
      fromPrice: "From $450",
      fromAmount: 450,
      unit: "per month",
      includes: [
        "Monitoring and error handling",
        "Backups",
        "Monthly reporting",
        "Agreed improvements",
      ],
      cta: "Book a call",
      ctaAction: "booking",
      group: "automation",
    },
    {
      id: "automation-custom",
      name: "Multi-workflow",
      headline: "Several workflows, quoted after discovery.",
      fromPrice: "From $4,500",
      fromAmount: 4500,
      unit: "quoted after discovery",
      includes: [
        "More than one workflow",
        "Mapped to your tools",
        "Final quote after discovery",
      ],
      cta: "Book a discovery call",
      ctaAction: "booking",
      group: "automation",
    },
  ] satisfies PricingTier[],

  /**
   * Direct-pay path for deposits / invoices.
   * Live Stripe Checkout requires STRIPE_SECRET_KEY (+ optional STRIPE_PRICE_*) in .env.local.
   * M-Pesa STK Push requires MPESA_* Daraja credentials (see .env.example).
   *
   * Deposit rationale (depositPercent = 30):
   * Industry-fair for custom software: enough to reserve capacity and cover discovery/kickoff,
   * without locking the client into a full prepay. Common studio practice is 25–40% upfront;
   * 30% balances cashflow for the studio with buyer comfort. Checkout amounts always use
   * tier.fromAmount × depositPercent (Stripe Checkout + M-Pesa STK). Invoice mode = 100%.
   */
  payments: {
    enabled: true,
    currency: "USD" as const,
    currencyNote: "Prices in USD · KES via M-Pesa STK (sandbox or live Daraja).",
    depositLabel: "Pay deposit",
    invoiceLabel: "Pay invoice",
    /** Enforce 30% of tier floor on all deposit checkouts (Stripe + M-Pesa). */
    depositPercent: 30,
    /** @deprecated use depositPercent — kept as alias for older reads */
    defaultDepositPercent: 30,
    comingSoonMessage:
      "Online payments need Stripe or M-Pesa keys in .env.local. Book a call or email us to pay securely.",
    mpesaComingSoonMessage:
      "M-Pesa STK is not configured yet (set MPESA_* in .env.local). Book a call or try Stripe, or email us.",
  },

  pricingDisclaimer:
    "USD floors, not a fixed menu. A 30% deposit (Stripe or M-Pesa) reserves the work. Final quotes follow a short discovery call.",

  productAccessNote:
    "Product suite: request access — no public seat pricing until each app is live.",

  comparison: {
    title: "Us, DIY, or an agency",
    description: "What you get before the call.",
    rows: [
      {
        id: "speed",
        capability: "Time to first ship",
        withUs: "Weeks, with weekly demos",
        diy: "Months of context-switching",
        agency: "Long kickoffs",
      },
      {
        id: "cost",
        capability: "Cost clarity",
        withUs: "Ranges up front",
        diy: "Salary and opportunity cost",
        agency: "Often opaque",
      },
      {
        id: "ownership",
        capability: "Code ownership",
        withUs: "Yours from day one",
        diy: "Yours",
        agency: "Sometimes locked in",
      },
      {
        id: "fit",
        capability: "Who it suits",
        withUs: "Founders who want a studio",
        diy: "Teams with spare engineers",
        agency: "Large, layered programs",
      },
    ] satisfies ComparisonRow[],
  },

  reliability: {
    title: "How we operate",
    description: "Timezone, response, and delivery.",
    items: [
      { id: "tz", label: "Timezone", value: "Nairobi (EAT)" },
      { id: "sla", label: "Response", value: "Within 1 business day" },
      { id: "stack", label: "Stack", value: "Next.js · TypeScript" },
      { id: "deploy", label: "Delivery", value: "Weekly demos" },
    ] satisfies ReliabilityItem[],
  },

  faq: [
    {
      id: "faq-1",
      question: "What does The Beacon Studio actually build?",
      answer:
        "Cloud apps, custom software, and AI automation for repetitive work. Same studio either way.",
    },
    {
      id: "faq-2",
      question: "How does pricing work?",
      answer:
        "Published USD floors for studio builds and automation. A short discovery call turns the floor into a quote.",
    },
    {
      id: "faq-automation-custom",
      question: "How does AI automation customization work?",
      answer:
        "Every organization is different, so it starts with a short discovery call: how do you handle enquiries, missed calls, and follow-ups today? We then map one workflow and build it on your tools — WhatsApp, SMS, email, web chat, voice or missed-call, CRM or Google Sheets, and M-Pesa.",
    },
    {
      id: "faq-automation-after",
      question: "What happens after the automation pilot?",
      answer:
        "You can stop there, or move to a retainer from $450/month for monitoring, error handling, backups, reporting, and agreed improvements. Extra workflows start from $4,500 and are quoted after discovery.",
    },
    {
      id: "faq-3",
      question: "Can I get access to the product suite?",
      answer: "Request access on a product card. We’ll tell you when that app is ready.",
    },
    {
      id: "faq-4",
      question: "Where are you based, and do you work remotely?",
      answer: "Nairobi (EAT), working with teams worldwide. We reply within one business day.",
    },
    {
      id: "faq-5",
      question: "What stack do you use?",
      answer: "TypeScript, Next.js, React, Node, and PostgreSQL.",
    },
    {
      id: "faq-6",
      question: "How do we start?",
      answer: "Start a project or book a call. Glow can answer quick questions first.",
    },
  ] satisfies FaqItem[],

  howItWorks: [
    {
      id: "discover",
      step: 1,
      title: "Scope it",
      description: "A short call, then a clear outcome, timeline, and range.",
    },
    {
      id: "build",
      step: 2,
      title: "Build it",
      description: "Weekly demos. You keep the repo.",
    },
    {
      id: "launch",
      step: 3,
      title: "Launch it",
      description: "Go live, hand off, or keep a retainer.",
    },
  ] satisfies HowItWorksStep[],

  servicesPricingNote: "Final price follows a short discovery call.",

  /** Multi-step "Start a Project" wizard options — plain language for SMEs & orgs */
  intake: {
    enabled: true,
    projectTypes: [
      {
        id: "ai-automation",
        label: "AI automation",
        description:
          "Enquiries, missed-call follow-ups, lead capture, reminders, and routine admin",
      },
      {
        id: "business-site",
        label: "A website for my business",
        description: "Shop, church, school, NGO, or local business that needs a clear online home",
      },
      {
        id: "orders-app",
        label: "An app to take orders",
        description: "Menu, bookings, or sales — customers order without the phone chaos",
      },
      {
        id: "courses",
        label: "Online courses for my students",
        description: "Schools, tutors, and trainers who want lessons, progress, and payments",
      },
      {
        id: "mvp",
        label: "A new product or SaaS idea",
        description: "From idea to a first version people can actually use",
      },
      {
        id: "rebuild",
        label: "Fix or redesign what I already have",
        description: "Make an existing site or app faster, clearer, and easier to use",
      },
      {
        id: "internal",
        label: "Tools for my team or organization",
        description: "Internal dashboards, member portals, or ops tools for SMEs and nonprofits",
      },
      {
        id: "suite",
        label: "Something that works with Beacon products",
        description: "Connect or extend LookFinesse, ConfiLearn, CadenceApp, ConfiRent, or TriviaYard",
      },
      {
        id: "other",
        label: "Something else — I’m not sure",
        description: "Describe it in your own words on the next steps — we’ll help clarify",
      },
    ] satisfies IntakeProjectType[],
    budgets: [
      { id: "under-500", label: "Under $500" },
      { id: "under-2k", label: "Under $2k" },
      { id: "under-5k", label: "Under $5k" },
      { id: "5-15k", label: "$5k – $15k" },
      { id: "15-40k", label: "$15k – $40k" },
      { id: "40k-plus", label: "$40k+" },
      { id: "explore", label: "Not sure yet" },
    ] satisfies IntakeBudget[],
    timelines: [
      { id: "asap", label: "ASAP" },
      { id: "this-month", label: "This month" },
      { id: "few-months", label: "A few months" },
      { id: "exploring", label: "Just exploring" },
    ] satisfies IntakeTimeline[],
    stepHelp: {
      type: "Pick the closest match — no jargon required. Schools, churches, shops, and NGOs welcome.",
      budget: "A rough range helps us scope honestly. “Not sure yet” is a perfectly fine answer.",
      timeline: "When do you hope to see something live? Exploring is okay — we’ll still reply.",
      brief: "In plain English: who is it for, what should it do, and what does success look like?",
      contact: "We’ll reply within 1–2 business days (Nairobi time). No spam.",
    },
    briefExamples: [
      "We run a small bakery and need a site where people can see our menu and place weekend orders.",
      "I’m a tutor with 40 students — I want online courses, live classes, and M-Pesa payments.",
      "Our church needs a simple site for sermons, events, and giving — mobile-first for members.",
    ],
  },

  /**
   * Recently shipped — add entries as you release.
   * Optional productId links to products[].
   */
  changelog: [
    {
      id: "cl-1",
      date: "2026-07",
      title: "Beacon suite maps to real products",
      summary:
        "LookFinesse, ConfiLearn, CadenceApp, and ConfiRent replace placeholder suite cards — wired to real repos where available.",
      tag: "studio",
    },
    {
      id: "cl-2",
      date: "2026-06",
      title: "LookFinesse commerce surface",
      summary:
        "Creator marketplace with shop, feed, vendor tools, ads, and M-Pesa / Stripe payment paths in active beta.",
      productId: "lookfinesse",
      tag: "improved",
    },
    {
      id: "cl-3",
      date: "2026-05",
      title: "ConfiLearn tutor studio",
      summary:
        "Course authoring, live sessions, XP / certificates, and M-Pesa payouts for the ConfiLearn learning platform beta.",
      productId: "confilearn",
      tag: "shipped",
    },
    {
      id: "cl-4",
      date: "2026-04",
      title: "CadenceApp repo linked",
      summary:
        "CadenceApp public repo connected; product surface still early. ConfiRent remains a coming-soon stub pending upload.",
      productId: "cadenceapp",
      tag: "improved",
    },
  ] satisfies ChangelogEntry[],

  /** Interactive tech stack — usedIn references product ids */
  techStack: [
    { id: "ts", name: "TypeScript", category: "language", usedIn: ["lookfinesse", "confilearn", "cadenceapp"] },
    { id: "next", name: "Next.js", category: "framework", usedIn: ["lookfinesse"] },
    { id: "react", name: "React", category: "framework", usedIn: ["lookfinesse", "confilearn"] },
    { id: "tanstack", name: "TanStack Start", category: "framework", usedIn: ["confilearn"] },
    { id: "node", name: "Node.js", category: "framework", usedIn: ["lookfinesse", "confilearn"] },
    { id: "pg", name: "PostgreSQL", category: "data", usedIn: ["lookfinesse", "confilearn"] },
    { id: "vercel", name: "Vercel", category: "platform", usedIn: ["lookfinesse"] },
    { id: "cloudflare", name: "Cloudflare", category: "platform", usedIn: ["confilearn"] },
    { id: "supabase", name: "Supabase", category: "platform", usedIn: ["lookfinesse", "confilearn"] },
    { id: "figma", name: "Figma", category: "design", usedIn: ["lookfinesse", "confilearn", "cadenceapp", "confirent"] },
  ] satisfies TechStackItem[],

  /**
   * Scope estimator — timeline + cost range (not a quote).
   * weeks ≈ baseWeeks * complexityMultiplier
   * cost ≈ baseCost * complexityMultiplier
   */
  estimator: {
    disclaimer: "A rough range, not a quote. Discovery sets the real price.",
    projectTypes: [
      {
        id: "mvp",
        label: "New MVP / SaaS",
        baseWeeks: 8,
        baseCostFrom: 3000,
        baseCostTo: 8000,
      },
      {
        id: "rebuild",
        label: "Rebuild / redesign",
        baseWeeks: 6,
        baseCostFrom: 2500,
        baseCostTo: 6500,
      },
      {
        id: "api",
        label: "API / backend",
        baseWeeks: 4,
        baseCostFrom: 1500,
        baseCostTo: 4500,
      },
      {
        id: "feature",
        label: "Feature pack",
        baseWeeks: 3,
        baseCostFrom: 800,
        baseCostTo: 2500,
      },
      {
        id: "suite",
        label: "Suite integration",
        baseWeeks: 5,
        baseCostFrom: 2000,
        baseCostTo: 5500,
      },
      {
        id: "business-site",
        label: "Business website",
        baseWeeks: 3,
        baseCostFrom: 600,
        baseCostTo: 2000,
      },
    ] satisfies EstimatorProjectType[],
    complexities: [
      { id: "lean", label: "Lean", multiplier: 0.75 },
      { id: "standard", label: "Standard", multiplier: 1 },
      { id: "complex", label: "Complex", multiplier: 1.5 },
      { id: "enterprise", label: "Enterprise", multiplier: 2.25 },
    ] satisfies EstimatorComplexity[],
  },

  newsletter: {
    enabled: true,
    title: "Product & studio updates",
    description: "Occasional launch notes. Unsubscribe anytime.",
    ctaText: "Subscribe",
    delayMs: 18000,
    scrollTriggerPercent: 55,
  },

  booking: {
    enabled: true,
    timezone: "Africa/Nairobi",
    availableDays: [1, 2, 3, 4, 5] as const,
    slotDuration: 30,
    hoursStart: "09:00",
    hoursEnd: "17:00",
    meetingTypes: [
      { id: "intro", label: "Intro Call", duration: 30 },
      { id: "automation-audit", label: "Automation audit", duration: 20 },
      { id: "project", label: "Project Discussion", duration: 45 },
    ],
  },

  /**
   * AI Automation — homepage section, /automation, pricing group, and Glow.
   * One workflow first; multi-workflow is quoted after discovery.
   */
  automation: {
    headline: "Automate the repetitive work.",
    supporting:
      "Enquiries, missed calls, lead capture, reminders, and routine admin — without replacing the personal service clients expect.",
    cta: "Book a free 20-min automation audit",
    toolsLine: "WhatsApp, SMS, email, web chat, voice, CRM or Google Sheets, and M-Pesa.",
    steps: [
      {
        id: "discover",
        title: "Discover",
        description: "How do you handle enquiries, missed calls, and follow-ups today?",
      },
      {
        id: "pilot",
        title: "Pilot",
        description: "We map one workflow and build it on the tools you already use.",
      },
      {
        id: "retainer",
        title: "Retainer",
        description: "We monitor it, handle errors, and improve it each month.",
      },
    ] satisfies AutomationStep[],
    useCases: [
      {
        id: "real-estate",
        industry: "Real estate",
        line: "Answer property questions, capture tenant or buyer requirements, and alert agents.",
      },
      {
        id: "clinics",
        industry: "Clinics",
        line: "Bookings and reminders.",
      },
      {
        id: "schools",
        industry: "Schools",
        line: "Fee and admission enquiries.",
      },
      {
        id: "retail",
        industry: "Retail & restaurants",
        line: "Orders and WhatsApp replies.",
      },
      {
        id: "smes",
        industry: "SMEs & professional services",
        line: "Lead follow-up and invoicing reminders.",
      },
    ] satisfies AutomationUseCase[],
  },

  assistant: {
    enabled: true,
    name: "Glow",
    greeting:
      "Hey — I'm Glow. Ask about AI automation, our cloud apps, pricing, or how to start a project.",
    suggestedQuestions: [
      "What is AI automation?",
      "How does an automation pilot work?",
      "What is ConfiLearn?",
      "How do I start a project?",
    ],
  },

  skills: [
    {
      name: "Languages",
      skills: ["TypeScript", "JavaScript", "Python", "SQL"],
      variant: "large" as const,
      shape: "hexagon" as const,
      accent: "cyan" as const,
    },
    {
      name: "Frameworks",
      skills: ["React", "Next.js", "Node.js", "Express"],
      variant: "default" as const,
      shape: "circle" as const,
      accent: "coral" as const,
    },
    {
      name: "Tools & Platforms",
      skills: ["Git", "Docker", "PostgreSQL", "Vercel", "Figma"],
      variant: "wide" as const,
      shape: "diamond" as const,
      accent: "amber" as const,
    },
  ] satisfies SkillCategory[],

  experience: [
    {
      id: "exp-1",
      role: "Founder",
      company: "The Beacon Studio",
      period: "2024 — Present",
      description:
        "Building The Beacon Studio product suite and shipping custom software for clients — from discovery to launch.",
      tags: ["Product", "SaaS", "Client work"],
      logo: "/images/experience/company-1.svg",
      accent: "cyan" as const,
      current: true,
    },
    {
      id: "exp-2",
      role: "Software Developer",
      company: "Previous Company",
      period: "2022 — 2024",
      description:
        "Grew fast, shipped features end-to-end, and helped the team move quicker with cleaner code and better CI.",
      tags: ["JavaScript", "REST APIs", "PostgreSQL"],
      logo: "/images/experience/company-2.svg",
      accent: "coral" as const,
    },
    {
      id: "exp-3",
      role: "Freelance / Independent",
      company: "Independent",
      period: "2021 — 2022",
      description:
        "Shipped client sites and side projects end-to-end — learned that great software starts with listening.",
      tags: ["Next.js", "Tailwind CSS", "Figma"],
      logo: "/images/experience/company-3.svg",
      accent: "amber" as const,
    },
  ] satisfies ExperienceEntry[],

  testimonials: [
    {
      id: "t-1",
      quote:
        "Max doesn't just write code — he brings clarity to every standup and makes the whole team better. Delivered ahead of schedule, too.",
      author: "Colleague Name",
      role: "Engineering Lead",
      avatar: "/images/testimonials/avatar-1.jpg",
    },
    {
      id: "t-2",
      quote:
        "He turned our vague idea into something our users genuinely love. Sharp, reliable, and easy to work with.",
      author: "Client Name",
      role: "Product Manager",
      avatar: "/images/testimonials/avatar-2.jpg",
    },
  ] satisfies Testimonial[],

  projects: [
    {
      id: "case-lookfinesse",
      title: "LookFinesse (product)",
      description:
        "Fashion, beauty & fitness social commerce — shop, creators, vendor ops, and Kenya-ready payments.",
      tags: ["Next.js", "Supabase", "Stripe", "M-Pesa"],
      liveUrl: "https://lookfinesseke-0cf56b906a55.herokuapp.com/",
      githubUrl: "",
      image: "/images/projects/lookfinesse.svg",
      comingSoon: true,
      kind: "product" as const,
    },
    {
      id: "case-confilearn",
      title: "ConfiLearn (product)",
      description:
        "Live + on-demand learning with tutor studio, XP, certificates, and M-Pesa creator payouts.",
      tags: ["TanStack Start", "Supabase", "EdTech"],
      liveUrl: "",
      githubUrl: "https://github.com/MaximaKenya/luminouslms",
      image: "/images/projects/confilearn.svg",
      comingSoon: true,
      kind: "product" as const,
    },
    {
      id: "case-mvp",
      title: "SaaS MVP launch",
      description:
        "Placeholder case study: discovery → MVP → launch for a founder who needed a shippable product in weeks.",
      tags: ["Next.js", "Auth", "Cloud"],
      liveUrl: "",
      githubUrl: "",
      image: "/images/projects/project-three.jpg",
      comingSoon: true,
      kind: "client" as const,
    },
  ] satisfies Project[],

  skillRadar: [
    { name: "Frontend", level: 90 },
    { name: "Backend", level: 85 },
    { name: "TypeScript", level: 92 },
    { name: "Design", level: 75 },
    { name: "DevOps", level: 70 },
    { name: "Product", level: 82 },
  ],

  /** Intentionally empty — do not render as a bottom ticker / marquee */
  achievements: [] as string[],

  nowPlaying: [
    { id: "np-1", type: "Building", label: "LookFinesse & TriviaYard live · ConfiLearn beta" },
    { id: "np-2", type: "Open", label: "Custom client builds" },
    { id: "np-3", type: "Focus", label: "Cloud SaaS & TypeScript" },
  ],

  notes: [
    {
      id: "note-1",
      title: "Why we build with TypeScript first",
      excerpt: "Strong types aren't bureaucracy — they're empathy for your future self and teammates.",
      tag: "Engineering",
      date: "Coming soon",
    },
    {
      id: "note-2",
      title: "Designing for Nairobi's mobile-first users",
      excerpt: "Lessons from shipping products where connectivity and context look different.",
      tag: "Product",
      date: "Coming soon",
    },
    {
      id: "note-3",
      title: "Inside The Beacon Studio stack",
      excerpt: "Next.js, careful motion, and a site that feels alive without being heavy.",
      tag: "Studio",
      date: "Coming soon",
    },
  ],

  footer: {
    note: "Software product studio · Nairobi · EAT.",
    legal: [
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
    ],
  },
} as const;

export type SiteConfig = typeof siteConfig;

/** Convenience: current suite size — always prefer this over hardcoding. */
export const productCount = siteConfig.products.length;
