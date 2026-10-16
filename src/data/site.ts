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
  features: string[];
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
  /** Optional Stripe Price id env key hint (see .env.example) */
  stripePriceEnv?: string;
  /** Studio builds vs AI automation offer ladder */
  group?: "studio" | "automation" | "it";
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
      "Kenyan property platform to find, rent, buy and manage homes in one place. Landlords, agents, agencies and developers list verified properties and run tenancies; tenants pay rent by M-Pesa or card, message landlords and track statements.",
    tags: ["Property", "M-Pesa", "Kenya"],
    status: "live" as ProductStatus,
    statusLabel: "Live · soft launch",
    operationalStatus: "operational" as OperationalStatus,
    audience: "Tenants, buyers, landlords, agents, developers, and service providers.",
    features: [
      "Verified listings with ID checks",
      "Rent collection via M-Pesa or card, with statements and payment plans",
      "In-app messaging and group notices",
      "ConfiRent AI assistant",
    ],
    liveUrl: "https://www.confirent.co.ke",
    image: "/images/products/confirent-login.jpg",
    imageAlt: "ConfiRent sign-in screen on a phone",
  },
  {
    id: "cadenceapp",
    name: "CadenceApp",
    tagline: "The unified operations platform for customer teams.",
    description:
      "Brings collections, calling, messaging and AI automation into one workspace. Teams load accounts, call and message customers, track promises and payments, and let AI handle repetitive replies and reports.",
    tags: ["Collections", "Calling", "Messaging"],
    status: "beta" as ProductStatus,
    statusLabel: "Beta / early access",
    operationalStatus: "operational" as OperationalStatus,
    audience:
      "Collections agencies, BPOs, contact centres, and any business with customer-facing teams.",
    features: [
      "Dialer with campaigns (manual, power, or auto) and inbound routing",
      "Collections with debtor history, promise-to-pay tracking, and audit trails you can export to PDF or Excel",
      "AI replies on email, WhatsApp, and SMS, plus automatic KPI reports",
      "Pay per module, with a 14-day free trial",
    ],
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
    ogImage: "/opengraph-image",
    twitterHandle: "@yourusername",
    title: "The Beacon Studio — Products and custom software",
    description:
      "Nairobi software studio. ConfiRent and CadenceApp are open now. LookFinesse and ConfiLearn are coming soon. We also do AI automation, custom software, and outsourced IT.",
    keywords: [
      "The Beacon Studio",
      "Beacon",
      "ConfiRent",
      "CadenceApp",
      "LookFinesse",
      "ConfiLearn",
      "AI automation Kenya",
      "custom software Nairobi",
      "outsourced IT Nairobi",
      "managed IT Kenya",
      "Microsoft 365 support Kenya",
      "backup and disaster recovery",
      "property management Kenya",
      "Nairobi software studio",
    ],
  },

  cta: {
    primary: "See products",
    secondary: "Contact us",
    tertiary: "Book a call",
  },

  heroHeadline: "Products you can use. Software we can build.",
  heroSubhead:
    "The Beacon Studio is in Nairobi. Four products — two you can open now, two still on the way — plus AI automation, custom software, and outsourced IT.",

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
    { id: "services", label: "Services" },
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
      quoteOnly: true,
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
    "Automation prices are starting points in USD. Custom software, more than one workflow, and outsourced IT are quoted after a short call or a free assessment. When you pay online for a priced job, the deposit is 30%.",

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
      id: "faq-1",
      question: "What do you offer?",
      answer:
        "Four products — ConfiRent, CadenceApp, LookFinesse, and ConfiLearn — and three kinds of client work: AI automation, custom software, and outsourced IT.",
    },
    {
      id: "faq-2",
      question: "How much does automation cost?",
      answer:
        "A pilot is one workflow, from $1,350, and usually takes 2–3 weeks. A retainer starts at $450 a month. Several workflows start from $4,500 and are quoted after a discovery call. The 20-minute audit is free.",
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
      id: "faq-5",
      question: "Where are you based?",
      answer:
        "Nairobi, Kenya (EAT). We work with people anywhere and reply within one business day.",
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
      "Hi, I'm Glow. Ask about our products, automation, IT, pricing, or how to start.",
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
