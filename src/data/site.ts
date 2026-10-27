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
  docsUrl?: string;
  image: string;
  imageAlt: string;
  /** Plain status line shown on cards and product pages */
  statusLabel: string;
  /** Who the product is for */
  audience: string;
  /** Short benefit lines for the product card (aim for four). */
  features: string[];
  /** Longer feature list for the product page and assistant. */
  keyFeatures?: string[];
  /** One pricing line. Omit when there is no public price. */
  pricing?: string;
};

export type Service = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  group?: "studio" | "managed-it";
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
  /** Unused on the public site. Repos stay private. */
  githubUrl?: string;
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
  icon: "linkedin" | "email" | "twitter";
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
  href?: string;
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
  /** No published price. The quotation says it is quoted after a free assessment. */
  quoteOnly?: boolean;
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
  /** Studio builds vs AI automation offer ladder */
  group?: "studio" | "automation" | "it" | "package";
  /** Fixed-price packages: what is not included. */
  excludes?: string[];
  /** Fixed-price packages: revision rounds included. */
  revisions?: string;
  /** Build is a one-off. Care is a monthly plan after go-live. */
  lane?: "build" | "care";
  /**
   * Exact KES floor when the public price is set in shillings.
   * Paystack charges this (or the deposit share of it) instead of converting USD.
   */
  kesAmount?: number;
  /** No online deposit — price is quoted after discovery */
  quoteOnly?: boolean;
};

export type PricingFlowStep = {
  id: string;
  title: string;
  detail: string;
};

export type PricingFlexibilityPoint = {
  id: string;
  title: string;
  detail: string;
};

export type AutomationCategory =
  | "Sales"
  | "Finance"
  | "Customers"
  | "Operations"
  | "Education"
  | "Health"
  | "Property"
  | "Custom";

export type CatalogTemplate = {
  id: string;
  name: string;
  category: AutomationCategory;
  outcome: string;
  summary: string;
  priceKes: number;
  priceUsd: number;
  setupFeeKes: number;
  setupFeeUsd: number;
};

export type BundleDiscount = {
  id: string;
  minItems: number;
  percent: number;
  label: string;
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
 * Public products, in display order.
 * Only list a liveUrl when the product is actually open.
 * Do not link GitHub. Repositories stay private.
 */
const products: Product[] = [
  {
    id: "confirent",
    name: "ConfiRent",
    tagline: "Property management with confidence",
    description:
      "Find, rent, buy, and manage property in Kenya. Landlords collect rent by M-Pesa or card. ConfiRent takes 0% of rent.",
    tags: ["Property", "M-Pesa", "Kenya"],
    status: "live" as ProductStatus,
    statusLabel: "Live · soft launch",
    operationalStatus: "operational" as OperationalStatus,
    audience:
      "People looking for a home, landlords, agents and agencies, developers, and short-stay guests.",
    features: [
      "Rent goes by M-Pesa or card to the landlord. ConfiRent takes 0%.",
      "See who has paid, who owes, and pull statements.",
      "Listers are checked with an ID, a selfie, and a KRA PIN.",
      "Free one-to-one messaging, plus an assistant for rent and listings.",
    ],
    keyFeatures: [
      "Rent is collected by M-Pesa (STK prompt) or card and paid straight to the landlord's payout account. ConfiRent takes 0% of rent.",
      "Each payment is matched to the tenancy. See who has paid and who owes, with statements, receipts, and landlord-approved payment plans.",
      "Verified listers: ID, selfie, and KRA PIN, reviewed by an admin, to stop fake listings and scams.",
      "Free 1:1 in-app messaging on every plan. Landlords also get group chat and broadcast notices.",
      "A ConfiRent AI assistant for questions about rent, payment plans, and listings. You can install it as a phone app.",
      "Agents and agencies get team seats. Developers get project pages. Short-stay guests can book without an account. Privacy follows Kenya's Data Protection Act.",
    ],
    pricing:
      "Landlords start free; paid plans from KES 2,999/month. Agents free for 3 listings. Featured listings from KES 300/week.",
    liveUrl: "https://www.confirent.co.ke",
    image: "/images/products/confirent-desktop.jpg",
    imageAlt: "ConfiRent homepage on a desktop, with search and a featured listing",
  },
  {
    id: "cadenceapp",
    name: "CadenceApp",
    tagline: "The unified operations platform for customer teams",
    description:
      "One workspace for calling, collections, messages, and AI replies. Replaces a separate dialer, spreadsheet, WhatsApp, email, and CRM.",
    tags: ["Collections", "Calling", "Messaging"],
    status: "beta" as ProductStatus,
    statusLabel: "Beta / early access",
    operationalStatus: "operational" as OperationalStatus,
    audience:
      "Customer teams that currently split work across a dialer, spreadsheets, WhatsApp, email, and a CRM.",
    features: [
      "Manual, power, or auto dialing, including Kenyan numbers.",
      "Returned calls open the right account. Missed calls become callbacks.",
      "Debtor profiles, promises to pay, and payment plans.",
      "AI replies on email and WhatsApp, with a spending cap.",
    ],
    keyFeatures: [
      "Dialer with manual, power, and auto modes. It works with office PBX or GSM lines, cloud voice, or the agent's mobile, and handles Kenyan number formats.",
      "Smart inbound routing sends a returned call to the account owner, an inbound team, or any free agent, and opens the account on screen. Missed calls become callbacks.",
      "Collections keeps full debtor profiles, promise-to-pay tracking, payment plans, settlement offers, and a suggested next step.",
      "Allocate work and launch campaigns in a few clicks.",
      "AI Automation also works on its own. It replies to email and WhatsApp, answers pricing enquiries, fills KPIs, and builds reports from each organisation's knowledge base. Choose draft-for-review or auto-send, with a spending cap and an hours-saved dashboard.",
      "A tamper-evident audit trail records who, role, IP, time, and the before and after, and exports to a branded PDF or Excel. Modules are Collections, Dialer, Communications, AI Automation, CRM, Finance, HR, and Teams. Each organisation has its own branding.",
    ],
    pricing: "Per-seat pricing, pay only for the modules you use. 14-day free trial.",
    liveUrl: "https://www.cadenceapp.co.ke",
    image: "/images/products/cadenceapp-home.jpg",
    imageAlt: "CadenceApp home page on a desktop",
  },
  {
    id: "lookfinesse",
    name: "LookFinesse",
    tagline: "Kenya-first social marketplace for fashion, beauty and fitness.",
    description:
      "Connects shoppers with local fashion, beauty and fitness vendors. Browse and buy, book services nearby with delivery, get AI styling and fitness help; vendors get a dashboard for products and orders.",
    tags: ["Fashion", "Beauty", "Fitness"],
    status: "coming-soon" as ProductStatus,
    statusLabel: "Coming soon",
    operationalStatus: "building" as OperationalStatus,
    audience: "Shoppers and local fashion, beauty, and fitness vendors.",
    features: [
      "Near-me shopping, booking, and delivery",
      "AI stylist, shopping copilot, and gym buddy",
      "Vendor dashboard",
      "M-Pesa and card checkout",
    ],
    liveUrl: "",
    image: "",
    imageAlt: "",
  },
  {
    id: "confilearn",
    name: "ConfiLearn",
    tagline: "Learn from trusted African tutors, live and on your phone.",
    description:
      "Learning marketplace where tutors sell courses and teach live classes and learners pay with M-Pesa; payments held in escrow until delivered. Built for African learners with Kiswahili, offline downloads and WhatsApp reminders.",
    tags: ["Tutors", "Live classes", "M-Pesa"],
    status: "coming-soon" as ProductStatus,
    statusLabel: "Coming soon",
    operationalStatus: "building" as OperationalStatus,
    audience: "African learners and tutors.",
    features: [
      "M-Pesa payments with escrow and tutor wallets",
      "Live classrooms",
      "Quizzes and mastery checks",
      "Kiswahili, offline lessons, and WhatsApp notifications",
    ],
    liveUrl: "",
    image: "",
    imageAlt: "",
  },
];

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
    tagline: "Products and custom software.",
    /** Unique lockup — differentiates from similarly named creative agencies */
    lockup: "products and custom software",
    description:
      "The Beacon Studio is a software studio in Nairobi. We build our own products, and we take on AI automation, custom software, and outsourced IT.",
    /** Footer / legal disambiguation (not a film or media production company) */
    disambiguation:
      "A software studio in Nairobi — products and custom software. Not affiliated with film or media production companies of a similar name.",
  },

  founder: {
    name: "Maximillian",
    shortName: "Max",
    role: "Founder & Product Builder",
    bio: `I'm Max, founder of The Beacon Studio. I build software from Nairobi for people anywhere.`,
    location: "Nairobi, Kenya",
    timezone: "Africa/Nairobi",
  },

  /** Brand display name used in header / footer / SEO */
  name: "The Beacon Studio",
  role: "Software studio",
  tagline: "Products and custom software.",
  bio: `I'm Max, founder of The Beacon Studio. I build software from Nairobi for people anywhere.`,

  /** LinkedIn and Twitter are still placeholders and stay off the public pages. */
  email: "hello@thebeaconstudio.co.ke",
  /** Kenya E.164. tel: links and https://wa.me/254706397373 */
  phone: "+254706397373",
  /** Display form for UI */
  phoneDisplay: "0706 397 373",
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
    url: "",
    poster: "/images/video/meet-me-poster.jpg",
    title: "Meet the founder",
    caption: "Founder video is not published yet.",
  } satisfies MeetMeVideo,

  heroVideo: "" as string,

  seo: {
    siteUrl: "https://thebeaconstudio.co.ke",
    ogImage: "/opengraph-image",
    twitterHandle: "" as string,
    title: "The Beacon Studio — Products and custom software",
    description:
      "Nairobi studio for AI automation, custom software, and managed IT. ConfiRent is live. CadenceApp is in early access.",
    keywords: [
      "The Beacon Studio",
      "Beacon",
      "ConfiRent",
      "property management Kenya",
      "M-Pesa rent collection",
      "CadenceApp",
      "collections dialer Kenya",
      "LookFinesse",
      "ConfiLearn",
      "AI automation Kenya",
      "custom software Nairobi",
      "outsourced IT Nairobi",
      "managed IT Kenya",
      "Microsoft 365 support Kenya",
      "backup and disaster recovery",
      "Nairobi software studio",
    ],
  },

  cta: {
    primary: "Book a free 20-min audit",
    secondary: "See products",
    tertiary: "Book a call",
  },

  heroHeadline: "Get the repetitive work off your team's plate.",
  heroSubhead:
    "AI automation, custom software, and managed IT for Kenyan and African businesses.",

  /**
   * What clients gain — shown in Services and related CTAs.
   */
  clientGains: [
    "A short call before any quote",
    "Progress you can see while we build",
    "AI automation, custom software, or outsourced IT",
  ],

  currently: {
    status: "Taking on automation and custom software",
    statusType: "available" as "available" | "busy" | "building",
    building: "ConfiRent is live. CadenceApp is in early access.",
    focus: ["Products", "AI automation", "Custom software", "Managed IT"],
  },

  stats: [] as Stat[],

  social: [
    // LinkedIn is added from NEXT_PUBLIC_BRAND_LINKEDIN_URL / BRAND_LINKEDIN_URL when set.
    ...(process.env.NEXT_PUBLIC_BRAND_LINKEDIN_URL || process.env.BRAND_LINKEDIN_URL
      ? [{ name: "LinkedIn", href: String(process.env.NEXT_PUBLIC_BRAND_LINKEDIN_URL || process.env.BRAND_LINKEDIN_URL), icon: "linkedin" as const }]
      : []),
    {
      name: "Email",
      href: "mailto:hello@thebeaconstudio.co.ke",
      icon: "email" as const,
    },
  ] satisfies SocialLink[],

  navigation: [
    { id: "products", label: "Products" },
    { id: "services", label: "Services" },
    { id: "automations", label: "Automations", href: "/automations" },
    { id: "pricing", label: "Pricing" },
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
        "We set up one repetitive task — replies, reminders, or follow-ups — on the tools you already use. Start with a free 20-minute audit.",
      tags: ["One workflow", "Your tools", "Free audit"],
      group: "studio",
    },
    {
      id: "custom-software",
      title: "Custom Software",
      description:
        "We design and build software for your business. The price is quoted after a free call.",
      tags: ["Quoted after a call", "You keep the work"],
      group: "studio",
    },
    {
      id: "backup-dr",
      title: "Backup & Disaster Recovery",
      description: "Copies of your files, and a plan to get them back if a laptop, server, or account fails.",
      tags: ["Quoted after a free assessment"],
      group: "managed-it",
    },
    {
      id: "endpoint",
      title: "Antivirus & Endpoint Protection",
      description: "Protection on the computers and phones your team uses, plus help when something looks wrong.",
      tags: ["Quoted after a free assessment"],
      group: "managed-it",
    },
    {
      id: "firewall",
      title: "Firewall & Network Security",
      description: "A firewall and basic network checks so the office connection is harder to misuse.",
      tags: ["Quoted after a free assessment"],
      group: "managed-it",
    },
    {
      id: "microsoft-365",
      title: "Microsoft 365",
      description: "Setup, moving mail and files, licensing, and day-to-day support for Microsoft 365.",
      tags: ["Quoted after a free assessment"],
      group: "managed-it",
    },
  ] satisfies Service[],

  engagementModels: [
    {
      id: "fixed",
      name: "Project",
      headline: "A price after we understand the work.",
      description: "Custom software is quoted after a free call. You get a written quote before we build.",
      bestFor: "A new piece of software, or a change to something you already have",
      highlights: ["Free call", "Written quote", "You keep the work"],
    },
    {
      id: "retainer",
      name: "Retainer",
      headline: "Monthly help after something is live.",
      description: "We keep an automation running, or keep improving software you already have.",
      bestFor: "Automation that needs watching, or ongoing software changes",
      highlights: ["From $450/month for automation", "Monitoring", "Agreed improvements"],
    },
  ] satisfies EngagementModel[],

  /**
   * Pricing / engagement tiers — SME-friendly USD floors (Kenya + global).
   * Shown as "From $X". Final quotes after discovery.
   */
  pricingTiers: [
    {
      id: "custom-software",
      name: "Custom Software",
      headline: "Software built for your business.",
      fromPrice: "Quoted after discovery",
      fromAmount: 0,
      unit: "Free call to start",
      includes: [
        "A free call to understand the work",
        "A written quote before we build",
        "You keep the software",
      ],
      cta: "Book a free call",
      ctaAction: "booking",
      group: "studio",
      quoteOnly: true,
    },
    {
      id: "automation-pilot",
      name: "Automation Pilot",
      headline: "A one-off build of one workflow.",
      fromPrice: "From $1,350",
      fromAmount: 1350,
      unit: "one workflow · 2–3 weeks",
      includes: [
        "One workflow built for your process",
        "Agreed test runs",
        "Fixed delivery date",
        "Clear success criteria",
      ],
      cta: "Start a pilot",
      ctaAction: "intake",
      group: "automation",
      lane: "build",
      featured: true,
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
      lane: "build",
      quoteOnly: true,
    },
    {
      id: "automation-retainer",
      name: "Automation Retainer",
      headline: "Monitoring, fixes, and improvements.",
      fromPrice: "From $450/mo",
      fromAmount: 450,
      unit: "per month",
      includes: [
        "Monitoring",
        "Fixes when the workflow breaks",
        "Agreed improvements",
        "Monthly reporting",
      ],
      cta: "Book a call",
      ctaAction: "booking",
      group: "automation",
      lane: "care",
    },
    {
      id: "managed-it",
      name: "Managed IT",
      headline: "Backup, security, and Microsoft 365.",
      fromPrice: "Quoted after a free assessment",
      fromAmount: 0,
      unit: "No set price",
      includes: [
        "Backup and disaster recovery",
        "Antivirus and endpoint protection",
        "Firewall and network security",
        "Microsoft 365 setup, migration, licensing, and support",
      ],
      cta: "Book a free assessment",
      ctaAction: "booking",
      group: "it",
      quoteOnly: true,
    },
    {
      id: "package-lead-site",
      name: "WhatsApp lead site",
      headline: "A one-page site that sends every enquiry to WhatsApp.",
      fromPrice: "$450",
      fromAmount: 450,
      unit: "fixed price",
      includes: ["One responsive page with your copy and photos", "WhatsApp and call buttons", "Enquiry form to your email", "Basic SEO and Google Business link", "Live in about 7 working days"],
      excludes: ["Domain and hosting fees", "Copywriting from scratch", "Online payments"],
      revisions: "2 revision rounds",
      cta: "Pay deposit",
      ctaAction: "intake",
      group: "package",
    },
    {
      id: "package-automation-day",
      name: "Automation setup day",
      headline: "One working day to wire up an automation you already need.",
      fromPrice: "$300",
      fromAmount: 300,
      unit: "fixed price",
      includes: ["Scoping call before the day", "One automation built and tested", "Handover notes and a short walkthrough", "7 days of fixes after handover"],
      excludes: ["Paid third-party tools", "Work beyond one day", "Ongoing monitoring"],
      revisions: "1 revision round",
      cta: "Pay deposit",
      ctaAction: "intake",
      group: "package",
    },
    {
      id: "package-booking-launch",
      name: "Booking + reminders launch",
      headline: "Online booking with automatic reminders, set up end to end.",
      fromPrice: "$600",
      fromAmount: 600,
      unit: "fixed price",
      includes: ["Booking page with your services and hours", "Email reminders before each slot", "Calendar sync", "Staff walkthrough", "14 days of fixes after launch"],
      excludes: ["SMS or WhatsApp sending fees", "Online payments until Paystack is connected", "Custom app development"],
      revisions: "2 revision rounds",
      cta: "Pay deposit",
      ctaAction: "intake",
      group: "package",
    },
    {
      id: "package-faq-bot",
      name: "Custom AI FAQ bot setup",
      headline: "An AI assistant that answers from your own FAQs and documents.",
      fromPrice: "$500",
      fromAmount: 500,
      unit: "fixed price",
      includes: ["Up to 50 FAQs or 20 pages of documents", "Website chat widget", "Hand-off to a person when unsure", "Tone set to your brand", "14 days of tuning"],
      excludes: ["AI usage fees beyond the setup month", "WhatsApp Business API fees", "Integrations with private systems"],
      revisions: "2 revision rounds",
      cta: "Pay deposit",
      ctaAction: "intake",
      group: "package",
    },
  ] as PricingTier[],

  /**
   * Direct-pay path for deposits / invoices.
   * Paystack is the primary checkout (PAYSTACK_SECRET_KEY).
   * USD tiers convert to KES at PAYSTACK_USD_KES_RATE. Tiers with kesAmount charge that shilling floor.
   * Checkout can charge KES (M-Pesa or card) or a USD card.
   * Paystack is the only payment gateway (it takes M-Pesa and card).
   * Beacon has no paybill of its own. Bank transfer is only an invoice request.
   *
   * Deposit rationale (depositPercent = 30):
   * Industry-fair for custom software: enough to reserve capacity and cover discovery/kickoff,
   * without locking the client into a full prepay. Common studio practice is 25–40% upfront;
   * 30% balances cashflow for the studio with buyer comfort. Checkout amounts always use
   * tier.fromAmount × depositPercent. Invoice mode = 100%.
   */
  payments: {
    enabled: true,
    currency: "USD" as const,
    currencyNote:
      "Custom tiers show USD with an approximate KES amount. Ready-made automations are priced in KES. Paystack takes M-Pesa or card in KES, or a USD card when the account allows it.",
    depositLabel: "Pay deposit",
    invoiceLabel: "Pay invoice",
    /** Enforce 30% of tier floor on deposit checkouts. */
    depositPercent: 30,
    /** @deprecated use depositPercent — kept as alias for older reads */
    defaultDepositPercent: 30,
    comingSoonMessage:
      "Paystack is not configured yet. Pay by bank transfer, or book a call and we will send an invoice.",
  },

  pricingDisclaimer:
    "Ready-made automations are KES 2,500–6,500 a month (about $19–$50). Save 10% at 3, 15% at 5, and 22% at 8 or more. Annual billing takes another 15% off. Setup fees are included. A Pilot starts at $1,350. Multi-workflow starts at $4,500 after discovery. A retainer starts at $450 a month. Custom software and IT are quoted after a free call. Online custom deposits are 30%.",

  /**
   * Ready-made automation prices. The buffet, checkout, and Beacon AI read this list.
   * Do not duplicate these amounts in template code.
   */
  automationCatalog: {
    annualDiscountPercent: 15,
    bundleDiscounts: [
      { id: "pack-3", minItems: 3, percent: 10, label: "3+ automations" },
      { id: "pack-5", minItems: 5, percent: 15, label: "5+ automations" },
      { id: "pack-8", minItems: 8, percent: 22, label: "8+ automations" },
    ] satisfies BundleDiscount[],
    customFieldTypes: [
      "text",
      "number",
      "date",
      "recurrence rule",
      "recipients list",
      "channel",
      "template message with {{variables}}",
      "file/CSV",
      "select",
    ],
    templates: [
      { id: "lead-reply", name: "Lead auto-reply & qualifier", category: "Sales", outcome: "Reply to a new lead and tell you if they are a fit.", summary: "Web form or WhatsApp webhook. Groq qualifies the message, replies, saves the lead, and emails you.", priceKes: 4500, priceUsd: 35, setupFeeKes: 0, setupFeeUsd: 0 },
      { id: "abandoned-quote", name: "Abandoned-quote follow-up", category: "Sales", outcome: "Nudge quotes that went quiet.", summary: "A short follow-up sequence for quotes that were not accepted.", priceKes: 3500, priceUsd: 27, setupFeeKes: 0, setupFeeUsd: 0 },
      { id: "lead-nurture", name: "Lead nurture drip", category: "Sales", outcome: "A paced sequence until a lead is ready.", summary: "Scheduled notes to new leads. Stop follow-ups from the portal when they are done.", priceKes: 4500, priceUsd: 35, setupFeeKes: 0, setupFeeUsd: 0 },
      { id: "daily-sales", name: "Daily sales summary", category: "Sales", outcome: "Yesterday's sales in your inbox each morning.", summary: "A daily email of the leads, payments, and notes your automations recorded.", priceKes: 2500, priceUsd: 19, setupFeeKes: 0, setupFeeUsd: 0 },
      { id: "social-drafts", name: "Social post drafts", category: "Sales", outcome: "Draft posts ready for you to publish.", summary: "Groq drafts the week's posts from your topics. Nothing is published for you.", priceKes: 3500, priceUsd: 27, setupFeeKes: 0, setupFeeUsd: 0 },
      { id: "invoice-reminders", name: "Invoice & payment reminders", category: "Finance", outcome: "Chase invoices and stop when they are paid.", summary: "Customer list, due dates, Paystack payment links, email or WhatsApp reminders, and a stop when Paystack confirms payment.", priceKes: 6500, priceUsd: 50, setupFeeKes: 5000, setupFeeUsd: 38 },
      { id: "subscription-renewal", name: "Subscription renewal reminders", category: "Finance", outcome: "Remind customers before a renewal date.", summary: "Renewal dates, a Paystack link, and reminders that stop once the renewal is paid.", priceKes: 4500, priceUsd: 35, setupFeeKes: 0, setupFeeUsd: 0 },
      { id: "debt-collection", name: "Debt collection ladder", category: "Finance", outcome: "A polite reminder, then a firmer one, then a final notice.", summary: "Three escalating messages. Each step stops for that customer when Paystack marks the balance paid.", priceKes: 6500, priceUsd: 50, setupFeeKes: 5000, setupFeeUsd: 38 },
      { id: "sacco-repayments", name: "Loan & SACCO repayments", category: "Finance", outcome: "Repayment reminders for members.", summary: "Member list, amounts, due dates, Paystack links, and paid tracking.", priceKes: 5500, priceUsd: 42, setupFeeKes: 0, setupFeeUsd: 0 },
      { id: "appointments", name: "Appointment booking & reminders", category: "Customers", outcome: "A public booking page with confirmation and reminders.", summary: "Slots you choose. Confirmation on booking, then a reminder 24 hours and 1 hour before.", priceKes: 5500, priceUsd: 42, setupFeeKes: 0, setupFeeUsd: 0 },
      { id: "faq-bot", name: "FAQ support bot", category: "Customers", outcome: "An embeddable chat that answers only from your FAQ.", summary: "Paste your FAQ or docs. Groq answers from that text only, and saves questions it cannot answer as leads.", priceKes: 4500, priceUsd: 35, setupFeeKes: 0, setupFeeUsd: 0 },
      { id: "reviews", name: "Review & feedback requests", category: "Customers", outcome: "Ask for a rating after a sale.", summary: "A low score alerts you. A high score sends the customer your Google review link.", priceKes: 2500, priceUsd: 19, setupFeeKes: 0, setupFeeUsd: 0 },
      { id: "onboarding", name: "New-customer onboarding", category: "Customers", outcome: "A welcome sequence for a new customer.", summary: "A few scheduled messages after you add someone, or after a form submission.", priceKes: 3500, priceUsd: 27, setupFeeKes: 0, setupFeeUsd: 0 },
      { id: "greetings", name: "Birthday & anniversary greetings", category: "Customers", outcome: "A greeting on the date you store.", summary: "Birthdays and anniversaries, sent by email or a WhatsApp link.", priceKes: 2500, priceUsd: 19, setupFeeKes: 0, setupFeeUsd: 0 },
      { id: "rsvp", name: "Event & RSVP reminders", category: "Customers", outcome: "Collect RSVPs and remind guests.", summary: "A public RSVP form, then reminders before the event.", priceKes: 3500, priceUsd: 27, setupFeeKes: 0, setupFeeUsd: 0 },
      { id: "nps", name: "Survey & NPS", category: "Customers", outcome: "Ask one score and follow up when it is low.", summary: "A short survey link. Low scores email you. High scores can point at your review page.", priceKes: 2500, priceUsd: 19, setupFeeKes: 0, setupFeeUsd: 0 },
      { id: "weekly-report", name: "Weekly business report", category: "Operations", outcome: "One email with the week's automation activity.", summary: "Leads, payments, messages, and runs across your automations.", priceKes: 2500, priceUsd: 19, setupFeeKes: 0, setupFeeUsd: 0 },
      { id: "staff-shifts", name: "Staff task & shift reminders", category: "Operations", outcome: "Remind staff before a shift or task.", summary: "A roster with dates. Each person gets a reminder before they are due.", priceKes: 3500, priceUsd: 27, setupFeeKes: 0, setupFeeUsd: 0 },
      { id: "low-stock", name: "Low-stock alerts", category: "Operations", outcome: "Email you when a quantity falls to the reorder level.", summary: "A stock list. The daily check alerts you only for items at or below the reorder level.", priceKes: 3500, priceUsd: 27, setupFeeKes: 0, setupFeeUsd: 0 },
      { id: "doc-expiry", name: "Document & contract expiry", category: "Operations", outcome: "A reminder before a contract or document expires.", summary: "Expiry dates and who should be told.", priceKes: 3500, priceUsd: 27, setupFeeKes: 0, setupFeeUsd: 0 },
      { id: "inbox-triage", name: "Inbox triage & draft replies", category: "Operations", outcome: "A draft reply for an email you forward in.", summary: "Groq drafts a reply from your instructions. The draft comes to you. It is not sent to the customer.", priceKes: 5500, priceUsd: 42, setupFeeKes: 0, setupFeeUsd: 0 },
      { id: "meeting-notes", name: "Meeting notes summarizer", category: "Operations", outcome: "Paste notes and get a summary plus action items.", summary: "Groq summarizes what you paste or upload, then emails the summary and the actions.", priceKes: 3500, priceUsd: 27, setupFeeKes: 0, setupFeeUsd: 0 },
      { id: "kpi-digest", name: "KPI dashboard digest", category: "Operations", outcome: "The KPIs you name, on a schedule.", summary: "Pick the figures you care about. A digest email goes out on the weekday you choose.", priceKes: 4500, priceUsd: 35, setupFeeKes: 0, setupFeeUsd: 0 },
      { id: "school-fees", name: "School fees & parent notices", category: "Education", outcome: "Fee reminders and a notice to parents.", summary: "Student list, amounts, due dates, Paystack links, and a notice you can send with the reminder.", priceKes: 5500, priceUsd: 42, setupFeeKes: 5000, setupFeeUsd: 38 },
      { id: "clinic-recall", name: "Clinic appointment recall", category: "Health", outcome: "Invite patients back after a set number of days.", summary: "Last-visit dates and a recall window. Reminders go out as that window arrives.", priceKes: 4500, priceUsd: 35, setupFeeKes: 0, setupFeeUsd: 0 },
      { id: "rent-collection", name: "Rent & fee collection", category: "Property", outcome: "Rent reminders with a pay link, and a stop when rent is paid.", summary: "Tenants, amounts, and due dates. Paystack links. Reminders stop per tenant once payment is confirmed.", priceKes: 6500, priceUsd: 50, setupFeeKes: 5000, setupFeeUsd: 38 },
      { id: "maintenance", name: "Property maintenance intake", category: "Property", outcome: "A form for repair requests, emailed to you.", summary: "Tenants or residents submit a request. You get the details and it is stored on the automation.", priceKes: 3500, priceUsd: 27, setupFeeKes: 0, setupFeeUsd: 0 },
      { id: "custom-reminder", name: "Custom reminder", category: "Custom", outcome: "Your own reminder, with your fields and your message.", summary: "Define fields, a recurrence, recipients, a channel, and a message that uses {{variables}}. Groq can suggest the fields from a sentence.", priceKes: 2500, priceUsd: 19, setupFeeKes: 0, setupFeeUsd: 0 },
      { id: "custom-report", name: "Custom report", category: "Custom", outcome: "A report you design, on the schedule you set.", summary: "Pick metrics and sources, write the notes to include, and choose how often it emails.", priceKes: 2500, priceUsd: 19, setupFeeKes: 0, setupFeeUsd: 0 },
    ] satisfies CatalogTemplate[],
  },

  /**
   * Explains automation pricing for the homepage and for Beacon AI.
   * Amounts live in automationCatalog and pricingTiers.
   */
  automationPricing: {
    buildTitle: "Ready-made — monthly",
    buildBody:
      "Tick the automations you need. Each one is KES 2,500–6,500 a month (about $19–$50). A bundle discount applies at 3 or more (10%), 5 or more (15%), and 8 or more (22%). Paying for the year takes a further 15% off the monthly total. Setup fees are included in the total on every automation that has one.",
    careTitle: "Custom build",
    careBody:
      "Pilot is a one-off build of one workflow from $1,350, usually in 2–3 weeks. Multi-workflow is from $4,500 and is quoted after discovery. A retainer from $450 a month covers monitoring, fixes, and improvements after a custom build is live.",
    flexibilityTitle: "Flexible for small teams",
    flexibilityIntro:
      "Start with a free 20-minute audit. Pay a ready-made bundle in one Paystack checkout or one invoice. A custom Pilot paid online takes a 30% deposit. Smaller teams can ask for one of these on the call. We confirm it in writing before you pay.",
    flexibility: [
      {
        id: "split",
        title: "50/50 split",
        detail: "Pay half as the deposit and the balance at go-live.",
      },
      {
        id: "instalments",
        title: "Three M-Pesa instalments",
        detail: "Pay the Pilot in three monthly M-Pesa payments.",
      },
      {
        id: "discount",
        title: "NGO, school, and SACCO discount",
        detail: "Ask on the audit. We confirm the rate before you pay.",
      },
      {
        id: "results",
        title: "Pay after results",
        detail: "On a first workflow, pay once the agreed result is in.",
      },
      {
        id: "audit",
        title: "Free 20-minute audit",
        detail: "See whether a template or a pilot fits before you spend anything.",
      },
    ] satisfies PricingFlexibilityPoint[],
    howItWorks: [
      {
        id: "audit",
        title: "Free audit",
        detail: "About 20 minutes. We look at one repetitive job.",
      },
      {
        id: "plan",
        title: "Pick a plan",
        detail: "Tick ready-made automations, or choose a custom Pilot.",
      },
      {
        id: "deposit",
        title: "Pay",
        detail: "One Paystack checkout (M-Pesa or card) or an invoice for the bundle. Custom builds can start with a deposit.",
      },
      {
        id: "live",
        title: "Build & go live",
        detail: "Ready-made automations start as soon as payment clears. A custom build goes live with you.",
      },
      {
        id: "care",
        title: "Care plan",
        detail: "The monthly automation keeps running. A retainer adds fixes and improvements on custom work.",
      },
    ] satisfies PricingFlowStep[],
  },

  productAccessNote:
    "ConfiRent and CadenceApp have their own sign-up. The prices on this page are for automation and custom software.",

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
      id: "faq-miss",
      question: "What if the first workflow misses the mark?",
      answer:
        "We revise it before the next invoice. The free audit is where we write the success criteria, so the miss is measured against something we both agreed.",
    },
    {
      id: "faq-risk",
      question: "Do I pay before we agree what success looks like?",
      answer:
        "No. The 20-minute audit is free. For a priced automation job, we agree clear success criteria before you pay the 30% deposit.",
    },
    {
      id: "faq-replace",
      question: "Will automation replace my team?",
      answer:
        "No. It takes repetitive replies, reminders, and follow-ups off their plate, without replacing the personal service clients expect.",
    },
    {
      id: "faq-1",
      question: "What do you offer?",
      answer:
        "Four products — ConfiRent, CadenceApp, LookFinesse, and ConfiLearn — and three kinds of client work: AI automation, custom software, and outsourced IT.",
    },
    {
      id: "faq-2",
      question: "How much does automation cost?",
      answer:
        "KES 2,500–6,500 a month each (about $19–$50). Bundles save 10%, 15%, or 22%. Annual billing saves another 15%. Setup fees are included. A Pilot starts at $1,350. Multi-workflow starts at $4,500. A retainer starts at $450 a month. The audit is free. Smaller teams can ask about a 50/50 split, three M-Pesa instalments, a discount, or pay-after-results.",
    },
    {
      id: "faq-3",
      question: "How much does custom software cost?",
      answer: "It is quoted after a discovery call. The call is free.",
    },
    {
      id: "faq-4",
      question: "Which products can I use now?",
      answer:
        "ConfiRent is live (soft launch) at confirent.co.ke. CadenceApp is in beta at cadenceapp.co.ke. LookFinesse and ConfiLearn are coming soon — ask us to notify you.",
    },
    {
      id: "faq-7",
      question: "What is ConfiRent?",
      answer:
        "A Kenyan platform to find, rent, buy, and manage property. Soft launch at confirent.co.ke. Rent by M-Pesa or card, and ConfiRent takes 0%. Listers are ID-checked. Landlords start free; paid plans from KES 2,999/month.",
    },
    {
      id: "faq-8",
      question: "What is CadenceApp?",
      answer:
        "Early access at cadenceapp.co.ke. One workspace for calling, collections, messages, and AI replies. Per-seat pricing. 14-day free trial.",
    },
    {
      id: "faq-5",
      question: "Where are you based?",
      answer:
        "Nairobi, Kenya (EAT). We work with people anywhere and reply within one business day.",
    },
    {
      id: "faq-audit-page",
      question: "How do I book the free 20-minute audit?",
      answer:
        "Open /book and pick a weekday slot, 09:00–17:00 East Africa Time. The audit is free. A confirmation email goes out when email delivery is configured.",
    },
    {
      id: "faq-checklist",
      question: "Where is the free AI automation checklist for Kenyan SMEs?",
      answer:
        "At /checklist. Leave your email and download it as HTML or PDF. It is a planning list for one repetitive job, not a quote. Your email is saved as a lead.",
    },
    {
      id: "faq-examples",
      question: "Are the example results from real clients?",
      answer:
        "No. Example results on this site are illustrative. They show the shape of a workflow, not a measured client outcome. Testimonials stay hidden until a client has given a real quote we can share.",
    },
    {
      id: "faq-6",
      question: "Do you handle day-to-day IT?",
      answer:
        "Yes. Outsourced IT covers backup and disaster recovery, antivirus and endpoint protection, firewall and network security, and Microsoft 365 (setup, migration, licensing, and support). The price is quoted after a free assessment.",
    },
  ] satisfies FaqItem[],

  howItWorks: [
    {
      id: "talk",
      step: 1,
      title: "Talk",
      description: "Tell us what you need. A short call is enough to start.",
    },
    {
      id: "build",
      step: 2,
      title: "Build",
      description: "We do the work and show you progress.",
    },
    {
      id: "handover",
      step: 3,
      title: "Hand over",
      description: "You get the finished work, or we keep it running.",
    },
  ] satisfies HowItWorksStep[],

  servicesPricingNote:
    "Automation has starting prices. Custom software is quoted after a free call. Outsourced IT is quoted after a free assessment.",

  contactTopics: [
    { id: "ai-automation", label: "AI automation" },
    { id: "custom-software", label: "Custom software" },
    { id: "backup-dr", label: "Backup & disaster recovery" },
    { id: "endpoint", label: "Antivirus & endpoint protection" },
    { id: "firewall", label: "Firewall & network security" },
    { id: "microsoft-365", label: "Microsoft 365" },
    { id: "other", label: "Something else" },
  ],

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
        description: "Work that connects to ConfiRent, CadenceApp, LookFinesse, or ConfiLearn",
      },
      {
        id: "backup-dr",
        label: "Backup & disaster recovery",
        description: "Copies of your files, and a way back if something is lost",
        quoteOnly: true,
      },
      {
        id: "endpoint",
        label: "Antivirus & endpoint protection",
        description: "Protection for the computers and phones your team uses",
        quoteOnly: true,
      },
      {
        id: "firewall",
        label: "Firewall & network security",
        description: "Firewall and basic network checks for the office",
        quoteOnly: true,
      },
      {
        id: "microsoft-365",
        label: "Microsoft 365",
        description: "Setup, migration, licensing, and support",
        quoteOnly: true,
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
      type: "Select every service you need. You can choose more than one. Schools, churches, shops, and NGOs welcome.",
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
  changelog: [] satisfies ChangelogEntry[],

  /** Studio tools. Not claimed as the stack of any product. */
  techStack: [
    { id: "ts", name: "TypeScript", category: "language", usedIn: [] },
    { id: "next", name: "Next.js", category: "framework", usedIn: [] },
    { id: "react", name: "React", category: "framework", usedIn: [] },
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
      { id: "it-assessment", label: "IT assessment", duration: 30 },
      { id: "project", label: "Project Discussion", duration: 45 },
    ],
  },

  /**
   * AI Automation — homepage section, /automation, pricing group, and the studio assistant.
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
    name: "The Beacon Studio AI",
    greeting:
      "Hi, I'm The Beacon Studio AI. Tell me what you need, your budget, and when you want it. I can quote from our price list and book a free 20-minute audit.",
    suggestedQuestions: [
      "What is ConfiRent?",
      "What is CadenceApp?",
      "How much does automation cost?",
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
        "Builds The Beacon Studio products and takes on AI automation and custom software.",
      tags: ["Products", "Automation", "Custom software"],
      accent: "cyan" as const,
      current: true,
    },
  ] satisfies ExperienceEntry[],

  /** Real quotes only. The homepage hides this section while the list is empty. */
  testimonials: [] as Testimonial[],

  projects: [] as Project[],

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
    { id: "np-1", type: "Live", label: "ConfiRent is in soft launch" },
    { id: "np-2", type: "Beta", label: "CadenceApp is in early access" },
    { id: "np-3", type: "Open", label: "Automation and custom software" },
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
    note: "Software studio · Nairobi · EAT.",
    legal: [
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
    ],
  },
} as const;

export type SiteConfig = typeof siteConfig;

/** Convenience: current suite size — always prefer this over hardcoding. */
export const productCount = siteConfig.products.length;

export type IndustryPack = {
  id: string;
  name: string;
  industry: string;
  headline: string;
  summary: string;
  /** Buffet template ids. Priced by quoteBundle, never by hand. */
  templateIds: string[];
  keywords: string[];
};

/** Industry bundles. Prices come from the same buffet maths as /automations. */
export const industryPacks: IndustryPack[] = [
  {
    id: "clinic",
    name: "Clinic Pack",
    industry: "Clinics",
    headline: "Fewer missed appointments, more returning patients.",
    summary: "Booking reminders, recall nudges, review requests and an FAQ bot for front-desk questions.",
    templateIds: ["appointments", "clinic-recall", "reviews", "faq-bot"],
    keywords: ["clinic automation Kenya", "appointment reminders clinic", "patient recall SMS"],
  },
  {
    id: "school",
    name: "School Pack",
    industry: "Schools",
    headline: "Fee reminders and parent updates without the phone calls.",
    summary: "Fee reminders, event RSVPs, a parent FAQ bot, new-family onboarding and a weekly report.",
    templateIds: ["school-fees", "rsvp", "faq-bot", "onboarding", "weekly-report"],
    keywords: ["school fees reminders Kenya", "school automation", "parent communication"],
  },
  {
    id: "sacco",
    name: "SACCO Pack",
    industry: "SACCOs",
    headline: "Repayments on time, members kept in the loop.",
    summary: "Loan repayment reminders, arrears follow-up, member greetings, a member FAQ bot and a KPI digest.",
    templateIds: ["sacco-repayments", "debt-collection", "greetings", "faq-bot", "kpi-digest"],
    keywords: ["SACCO automation Kenya", "loan repayment reminders", "SACCO member SMS"],
  },
  {
    id: "landlord",
    name: "Landlord Pack",
    industry: "Landlords",
    headline: "Rent collected, repairs tracked, leases renewed.",
    summary: "Rent reminders, maintenance requests, lease and document expiry alerts and a weekly report.",
    templateIds: ["rent-collection", "maintenance", "doc-expiry", "weekly-report"],
    keywords: ["rent collection automation Kenya", "landlord software", "tenant reminders"],
  },
  {
    id: "retail",
    name: "Retail Pack",
    industry: "Retail",
    headline: "Answer buyers fast and never run out of stock.",
    summary: "Instant lead replies, low-stock alerts, daily sales summaries, review requests and customer greetings.",
    templateIds: ["lead-reply", "low-stock", "daily-sales", "reviews", "greetings"],
    keywords: ["retail automation Kenya", "shop stock alerts", "WhatsApp lead reply"],
  },
  {
    id: "services",
    name: "Services & SME Pack",
    industry: "Services and SMEs",
    headline: "From enquiry to paid invoice on autopilot.",
    summary: "Lead replies, quote follow-up, invoice reminders, bookings, reviews, onboarding, inbox triage and a weekly report.",
    templateIds: ["lead-reply", "abandoned-quote", "invoice-reminders", "appointments", "reviews", "onboarding", "inbox-triage", "weekly-report"],
    keywords: ["SME automation Kenya", "invoice reminders", "small business automation"],
  },
];

/* ------------------------------------------------------------------ */
/* Revenue add-ons. Edit prices and copy here; pages read these lists. */
/* ------------------------------------------------------------------ */

export type CarePlan = {
  id: string;
  name: string;
  monthlyUsd: number;
  summary: string;
  includes: string[];
};

/** Care and maintenance plans. Billed by monthly invoice while Paystack is off. */
export const carePlans: CarePlan[] = [
  {
    id: "care-essentials",
    name: "Care Essentials",
    monthlyUsd: 50,
    summary: "Keep a site or automation healthy.",
    includes: ["Uptime and error checks", "Security and dependency updates", "Monthly backup check", "Up to 1 hour of small fixes", "Email support, 2 working-day reply"],
  },
  {
    id: "care-growth",
    name: "Growth Care",
    monthlyUsd: 150,
    summary: "Care plus steady improvements.",
    includes: ["Everything in Care Essentials", "Up to 4 hours of changes a month", "Monthly usage and leads report", "Prompt and copy tuning", "WhatsApp support, next working-day reply"],
  },
  {
    id: "care-plus",
    name: "Care Plus",
    monthlyUsd: 450,
    summary: "A part-time team on call.",
    includes: ["Everything in Growth Care", "Up to 12 hours of changes a month", "Priority fixes, same working day", "Quarterly review call", "New automation set up each quarter"],
  },
];

/** Founders price lock. Plain terms shown on pricing, portal and invoices. */
export const foundersLock = {
  months: 12,
  title: "Founders price lock",
  terms: "Early clients keep today's price for 12 months from the lock date, even if list prices go up. It covers the plans on your account when we lock it.",
};

export type WhatsAppAddon = {
  id: string;
  name: string;
  monthlyKes: number;
  marketingIncluded: number;
  utilityIncluded: number;
};

/**
 * WhatsApp add-on. Cost basis is Meta's Kenya rate card (Oct 2026):
 * KSh 2.93 per marketing message, KSh 0.52 per utility/service message.
 * Overage is pass-through cost plus `markupPercent`. Activates when WhatsApp is connected.
 */
export const whatsappAddon = {
  status: "Activates when WhatsApp is connected",
  costBasisKes: { marketing: 2.93, utility: 0.52 },
  costBasisNote: "Meta's Kenya rates, Oct 2026. Meta may change them.",
  markupPercent: 20,
  tiers: [
    { id: "wa-starter", name: "WhatsApp Starter", monthlyKes: 1500, marketingIncluded: 200, utilityIncluded: 500 },
    { id: "wa-growth", name: "WhatsApp Growth", monthlyKes: 4500, marketingIncluded: 800, utilityIncluded: 2000 },
    { id: "wa-scale", name: "WhatsApp Scale", monthlyKes: 12000, marketingIncluded: 2500, utilityIncluded: 6000 },
  ] as WhatsAppAddon[],
};

/** M-Pesa collections add-on. We never hold the client's payment credentials. */
export const mpesaAddon = {
  status: "Setup on request, needs your paybill or till",
  summary: "Reminders and reconciliation for money paid into your own paybill or till.",
  uses: [
    { id: "invoice", name: "Invoice collections", detail: "Send invoices with your paybill and account number, then chase what is unpaid." },
    { id: "rent", name: "Rent collection", detail: "Monthly rent reminders per unit, marked paid when the tenant pays." },
    { id: "school-fees", name: "School fees", detail: "Fee balances per learner with polite reminders to parents." },
    { id: "sacco", name: "SACCO repayments", detail: "Loan and contribution reminders with member account numbers." },
  ],
  note: "Money goes straight to your paybill or till. You keep your own Daraja keys; we never store them.",
};

export type ProAddon = { id: string; name: string; priceKes: number; unit: string; detail: string };

/** Paid upgrades. Billed by invoice for now. */
export const proAddons: ProAddon[] = [
  { id: "pro-priority", name: "Priority support", priceKes: 3000, unit: "a month", detail: "Same working-day replies and fixes first." },
  { id: "pro-prompts", name: "Custom prompts", priceKes: 5000, unit: "one-off per automation", detail: "AI replies tuned to your tone, products and FAQs." },
  { id: "pro-runs", name: "Extra runs", priceKes: 1000, unit: "per 1,000 runs", detail: "More scheduled runs when you outgrow the plan." },
  { id: "pro-sms-1k", name: "SMS credits · 1,000", priceKes: 1200, unit: "pack", detail: "Used once SMS is connected. Credits do not expire for 12 months." },
  { id: "pro-sms-5k", name: "SMS credits · 5,000", priceKes: 5500, unit: "pack", detail: "Used once SMS is connected. Credits do not expire for 12 months." },
];

export type PartnerTier = { id: string; name: string; wholesaleDiscountPercent: number; minClients: number; perks: string[] };

/** White-label / reseller programme. Edit discounts here. */
export const partnerTiers: PartnerTier[] = [
  { id: "partner-registered", name: "Registered", wholesaleDiscountPercent: 15, minClients: 1, perks: ["Partner price on every plan", "Co-branded proposals"] },
  { id: "partner-silver", name: "Silver", wholesaleDiscountPercent: 25, minClients: 5, perks: ["White-label portal and emails", "Partner onboarding call"] },
  { id: "partner-gold", name: "Gold", wholesaleDiscountPercent: 35, minClients: 15, perks: ["Priority builds", "Shared roadmap input", "Named contact"] },
];

/** Associations, accountants and advisers. Leave commission empty until it is agreed. */
export const partnershipProgramme = {
  audiences: ["Business associations and chambers", "Accountants and bookkeepers", "SACCO and school networks", "Consultants and agencies"],
  commissionNote: "Referral commission is agreed per partner in writing before any referral. No commission is promised on this page.",
};

export type LeadTemplate = { id: string; title: string; summary: string; format: "csv" | "md"; filename: string };

/** Free lead-magnet templates. Content is generated in src/lib/templates-store.ts. */
export const leadTemplates: LeadTemplate[] = [
  { id: "rent-tracker", title: "Rent collection tracker", summary: "Units, tenants, rent due and paid, in one sheet.", format: "csv", filename: "beacon-rent-tracker.csv" },
  { id: "fee-tracker", title: "School fee balance sheet", summary: "Learners, fees billed, paid and balance.", format: "csv", filename: "beacon-school-fees.csv" },
  { id: "lead-tracker", title: "WhatsApp lead tracker", summary: "Log every enquiry and the follow-up date.", format: "csv", filename: "beacon-lead-tracker.csv" },
  { id: "invoice-chaser", title: "Invoice follow-up checklist", summary: "A step-by-step routine for getting paid on time.", format: "md", filename: "beacon-invoice-checklist.md" },
  { id: "automation-audit", title: "Automation audit checklist", summary: "Find the repetitive tasks worth automating first.", format: "md", filename: "beacon-automation-audit.md" },
];

/** Paid template slots. Edit when a template is ready. */
export const paidTemplateSlots = [
  { id: "paid-sacco-pack", title: "SACCO operations pack", status: "Coming soon" },
  { id: "paid-clinic-pack", title: "Clinic front-desk pack", status: "Coming soon" },
  { id: "paid-landlord-pack", title: "Landlord finance pack", status: "Coming soon" },
];
