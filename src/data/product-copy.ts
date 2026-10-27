/**
 * Conversion copy for each sister app's product page.
 * Every claim is taken from the verified bot notes in Product-Copy/<app>.md
 * (checked against each app's code and live site, 27 Oct 2026).
 * Do not add statistics, testimonials, customer names, awards or unverified prices.
 */

/** LookFinesse has no domain yet. Swap this one constant when it does. */
export const LOOKFINESSE_URL = "https://lookfinesse-d9e208b87f62.herokuapp.com";
export const CONFILEARN_URL = "https://confilearn.co.ke";
export const CONVORIA_URL = "https://convoria.vercel.app";

export type SellingPointGroup = {
  /** Benefit the points deliver, e.g. "Time saved". */
  title: string;
  points: string[];
};

export type ProductOutcome = { before: string; after: string };
export type ProductFaq = { question: string; answer: string };

export type ProductCopy = {
  headline: string;
  promise: string;
  audiences: string[];
  sellingPoints: SellingPointGroup[];
  howItWorks: string[];
  outcomes: ProductOutcome[];
  faqs: ProductFaq[];
  /** Trial line. Omit when the app has no public trial. */
  trial?: string;
  /** Label for the main button to the app. */
  ctaLabel: string;
  /** Status notice shown prominently. */
  disclaimer?: string;
};

/** Standard trial wording shared by apps that run the 30-day trial. */
export const TRIAL_30_DAY =
  "Free for 30 days from sign-up, no card needed. A counter shows the days left. Card and Paystack checkout stay hidden until payments go live.";

/** Shared strip: what every Beacon app includes. */
export const EVERY_APP_INCLUDES: { title: string; detail: string }[] = [
  { title: "Built by one Kenyan studio", detail: "Every app is built and supported by The Beacon Studio in Nairobi." },
  { title: "Paystack-ready payments", detail: "Payments are set up for Paystack and M-Pesa. Checkout opens app by app as it goes live." },
  { title: "Branded email", detail: "Email under each app's own name. SMS and WhatsApp are rolling out." },
  { title: "Kenya Data Protection Act aligned", detail: "Privacy is written for Kenya's Data Protection Act, 2019." },
  { title: "Security hardening", detail: "Access controls and ongoing security fixes across the apps." },
  { title: "Kenya-based support", detail: "Call or WhatsApp 0706 397 373, or email hello@thebeaconstudio.co.ke." },
];

export const productCopy: Record<string, ProductCopy> = {
  confirent: {
    headline: "Rent, list and manage property in Kenya, without the scams.",
    promise: "Collect rent by M-Pesa with 0% commission, and keep every enquiry, viewing and offer in one place.",
    audiences: ["Landlords", "Agents and agencies", "Developers", "Tenants and buyers"],
    sellingPoints: [
      {
        title: "Money you keep",
        points: [
          "0% commission on rent.",
          "A free Starter plan for landlords that keeps going after the trial: up to 3 active listings, M-Pesa rent requests, a rent ledger and receipts.",
          "Free plans for agents (3 listings), agencies (5 listings, 1 seat) and developers (1 project).",
          "Annual billing gives you 2 months free.",
        ],
      },
      {
        title: "Time saved",
        points: [
          "Send one-off or batch M-Pesa rent requests and reminders, and see who hasn't paid.",
          "A rent overview with analytics, and reports you can export to CSV or PDF or schedule.",
          "Tenants raise maintenance tickets and you update the status.",
          "Renters and buyers book viewing slots, and you manage them from one dashboard.",
          "Every enquiry is logged as a lead, and offers arrive in chat with an amount and a note.",
        ],
      },
      {
        title: "Trust and security",
        points: [
          "Chats are scanned for common Kenyan rental-scam patterns, such as paying before viewing or off-platform M-Pesa, and a safety tip appears.",
          "Phone-verified and KYC-verified badges on profiles.",
          "Anyone can report a suspicious listing in one tap.",
        ],
      },
      {
        title: "Built for Kenya",
        points: [
          "Tenants pay rent in the app by M-Pesa.",
          "Verified rentals, homes for sale, short stays and new developments across Kenya.",
        ],
      },
    ],
    howItWorks: [
      "Sign up free. Your 30-day trial of every paid feature starts at sign-up.",
      "List your property or project, or search as a tenant or buyer.",
      "Handle enquiries, viewings and offers in the in-app chat.",
      "Request rent by M-Pesa and track who has paid.",
    ],
    outcomes: [
      { before: "Chasing tenants one by one by phone on rent day.", after: "Batch rent requests and reminders, with a live list of who hasn't paid." },
      { before: "Leads scattered across calls and texts.", after: "Every enquiry and offer lands in chat and on a leads board." },
      { before: "Renters can't tell a real listing from a scam.", after: "Verified badges, scam warnings in chat, and one-tap listing reports." },
    ],
    faqs: [
      { question: "Is there a free trial?", answer: "Yes. Landlord, agent, agency, developer and owner accounts get 30 days of all paid features from sign-up, no card needed. Then you drop to your Free plan and nothing is unpublished." },
      { question: "Does ConfiRent take a cut of my rent?", answer: "No. There is 0% commission on rent." },
      { question: "Can I pay for a plan today?", answer: "Not yet. Checkout is paused until live payments launch. Until then, the trial gives you the paid features." },
      { question: "How does ConfiRent help me avoid scams?", answer: "Chats are scanned for known rental-scam patterns, flagged messages show a safety tip, and any listing can be reported. Landlords can also earn a KYC-verified badge." },
      { question: "What do landlord plans cost?", answer: "Starter is free. Growth is KES 2,999, Pro KES 7,999 and Enterprise KES 14,999 a month. Annual billing gives you 2 months free." },
    ],
    trial:
      "Free for 30 days from sign-up, all paid features, no card needed. Checkout stays paused until live payments launch.",
    ctaLabel: "Open ConfiRent",
  },

  cadenceapp: {
    headline: "Collect more, call smarter, and prove what you recovered.",
    promise: "One workspace for collections, calling and messages, with a ROI view that shows recovery against cost.",
    audiences: ["Digital lenders, SACCOs and MFIs", "Collection agencies", "Call centres and BPOs", "Customer teams replacing a dialer, spreadsheet and CRM"],
    sellingPoints: [
      {
        title: "Money recovered",
        points: [
          "Log a promise to pay on the call, then see if it was kept, partly kept or broken.",
          "A recovery ROI dashboard sets what you recovered next to what the platform cost, from your real payments.",
          "Debtor profiles, payment plans and settlement offers in one record.",
        ],
      },
      {
        title: "Time saved",
        points: [
          "Click-to-call from the browser or the agent's phone, then log the outcome right after the call.",
          "Allocate accounts by filter and move them when an agent is on leave, with every move logged.",
          "Inbound calls route to the allocated agent, an inbound team or the next free agent, with the record on screen.",
          "Each industry starts with ready SMS, WhatsApp and email templates and pipeline stages.",
          "AI replies to email and WhatsApp in your voice, with a spending cap and an hours-saved counter.",
        ],
      },
      {
        title: "Trust and compliance",
        points: [
          "Kenya Compliance Pack: block calls outside your set hours and stop threatening or shaming wording.",
          "Block contact with numbers marked as third parties, such as family or employers.",
          "A tamper-proof, hash-chained audit trail, exportable to PDF or Excel.",
          "Each organisation's data is kept separate with row-level security. A breach log tracks ODPC notice timing under the Data Protection Act.",
        ],
      },
      {
        title: "Local fit",
        points: [
          "Works on the office PBX with MicroSIP, the agent's mobile, or Twilio.",
          "Supervisors watch calls, promises and recoveries per agent on a live wallboard.",
          "Rolling out: supervisor listen-in, whisper and barge, and an SMS/WhatsApp reply inbox.",
        ],
      },
    ],
    howItWorks: [
      "Start your free trial and pick your industry. Templates and stages load for you.",
      "Import accounts and allocate them to agents.",
      "Agents call, log promises and send polite reminders.",
      "Supervisors track the wallboard and the recovery ROI dashboard.",
    ],
    outcomes: [
      { before: "Promises to pay were forgotten once the call ended.", after: "Each promise is logged on the call and later marked kept or broken." },
      { before: "An agency mixed client portfolios and sent updates by email.", after: "Each client has its own portfolio, tracked live on the wallboard." },
      { before: "Tone and calling times depended on each agent.", after: "The Compliance Pack blocks calls outside set hours and threatening wording." },
    ],
    faqs: [
      { question: "How does the trial work?", answer: "30 days free, no card needed. When it ends, the app asks you to choose a plan." },
      { question: "What does it cost?", answer: "Per agent seat per month, from KES 1,500. Paystack is the payment method, and checkout opens once it goes live." },
      { question: "Does it help with Kenyan compliance?", answer: "The Compliance Pack enforces calling hours, blocks third-party contact, filters wording, and keeps consent and breach logs. Check your exact legal duties with your lawyer." },
      { question: "Can agents work from their phones?", answer: "Yes. The dialer hands the call to the phone and a 'Log this call' sheet opens after it." },
      { question: "How is our data secured?", answer: "Each organisation's data is isolated with row-level security, and the audit log cannot be edited or deleted." },
    ],
    trial: TRIAL_30_DAY,
    ctaLabel: "Start free on CadenceApp",
  },

  confilearn: {
    headline: "Learn it. Live it. Rise.",
    promise: "Verified Kenyan tutors, live classes in the browser, and CBC to KCSE prep, in English or Kiswahili.",
    audiences: ["Learners", "Parents and guardians", "Tutors and trainers", "Schools and institutions"],
    sellingPoints: [
      {
        title: "Money earned",
        points: [
          "Tutors keep 85%. Paystack fees and affiliate rewards come out of ConfiLearn's 15%, never the tutor's share.",
          "Price per hour, session, package, month or term, course, or learner in a group class.",
          "Holiday tuition lets parents find you by level, subject, county and mode.",
        ],
      },
      {
        title: "Time saved",
        points: [
          "Teach live in the browser through a built-in classroom. No extra software.",
          "Schools import students by CSV and bring staff in with short join codes.",
          "Make worksheets, prepare and price lessons, and track earnings in one place.",
        ],
      },
      {
        title: "Better results for learners",
        points: [
          "An AI Study Buddy gives hints between classes, in English or Kiswahili.",
          "KCSE, KJSEA and CBC practice with timed sessions and marking-scheme explanations.",
          "A parent dashboard shows lessons, quiz scores, streaks and a weekly report.",
          "Certificates with a public verification page, ready to share.",
        ],
      },
      {
        title: "Trust and local fit",
        points: [
          "Tutor profiles show KYC verification, and parents can filter by it.",
          "Children join only with a parent's or guardian's consent, under Kenya's Data Protection Act, 2019.",
          "Organised by CBC, 8-4-4 KCSE, IGCSE/A-level and more, with all 47 counties.",
          "Download lessons and learn offline on slow data.",
        ],
      },
    ],
    howItWorks: [
      "Join free. Your 30-day trial starts at sign-up, no card needed.",
      "Find a verified tutor or course by subject, level and county.",
      "Join live classes in the browser and practise with the AI Study Buddy.",
      "Track progress, earn verifiable certificates, and keep everything after the trial.",
    ],
    outcomes: [
      { before: "A tutor finds students by word of mouth and chases payments by phone.", after: "A verified profile parents can find by subject and county, with live classes in the browser." },
      { before: "A parent can't tell if holiday revision is happening.", after: "A verified tutor through Holiday tuition, and a weekly progress report." },
      { before: "A school runs timetables in WhatsApp groups and spreadsheets.", after: "Students added by CSV and a private timetable in one workspace." },
    ],
    faqs: [
      { question: "How long is the free trial?", answer: "30 days from sign-up, no card needed. Your courses and progress stay after it ends." },
      { question: "How will I pay?", answer: "Through Paystack, with M-Pesa, Airtel Money, card or bank. Checkout opens soon; join the waitlist on the pricing page. Free courses work now." },
      { question: "How much do tutors earn?", answer: "Tutors set their prices and keep 85%. ConfiLearn's 15% covers the Paystack fee and any affiliate reward." },
      { question: "Can my child use ConfiLearn?", answer: "Yes, with a parent's or guardian's consent. The Family plan covers up to 4 children, with progress reports." },
      { question: "Is it in Kiswahili?", answer: "Yes. Switch between English and Kiswahili from the menu at any time." },
    ],
    trial: TRIAL_30_DAY,
    ctaLabel: "Join ConfiLearn free",
  },

  lookfinesse: {
    headline: "Shop the culture. Live the look.",
    promise: "Fashion, beauty and fitness in one Kenyan marketplace, and a booking desk for salons, barbers and gyms.",
    audiences: ["Salons, barbers and beauty vendors", "Shoppers and clients", "Fitness and wellness users", "Gyms, studios and businesses"],
    sellingPoints: [
      {
        title: "Time saved for vendors",
        points: [
          "Share one link where clients see your services and book a slot. Stop juggling DMs.",
          "Staff shifts and time off become bookable slots automatically.",
          "Booking reminders, rebooking nudges and birthday greetings in a few clicks, sent only after you approve them.",
          "Sell in person with a till and barcode scanner, with stock kept in step.",
        ],
      },
      {
        title: "Money earned",
        points: [
          "Set commission per stylist and see each person's earnings in one table.",
          "Track orders, earnings and payouts from one dashboard.",
          "Repeat clients carry 0% booking commission on Vendor Pro.",
        ],
      },
      {
        title: "Know your clients",
        points: [
          "A profile for every client with tags, birthday, notes and visit history.",
          "Send new clients an intake form with your own questions before they arrive.",
          "Client consent and opt-outs are respected on every message.",
        ],
      },
      {
        title: "For shoppers and wellness",
        points: [
          "Find salons, barbers and services near you on a map, and manage bookings in one place.",
          "Shop beauty and fashion, follow creators, save looks and give gift cards.",
          "AI stylist outfit ideas for Nairobi weather and occasions.",
          "Gym programs, workout logs, and habit, hydration, sleep and nutrition tracking.",
        ],
      },
    ],
    howItWorks: [
      "Sign up free. Your 30-day trial opens every feature, no card needed.",
      "Vendors add services, staff shifts and products. Clients browse near them.",
      "Clients book from your link. Reminders go out once you approve them.",
      "Track bookings, sales and earnings from the vendor dashboard.",
    ],
    outcomes: [
      { before: "Bookings came through DMs into a notebook, and staff got double-booked.", after: "Clients book from one link, with slots from each stylist's shifts." },
      { before: "Allergies, preferences and birthdays lived in someone's head.", after: "Every client has a profile with intake answers, notes and visit history." },
      { before: "You messaged each due client by hand.", after: "Reminders and rebooking nudges you approve once, respecting consent." },
    ],
    faqs: [
      { question: "How does the free trial work?", answer: "30 days free, no card needed, with every feature open." },
      { question: "How do I pay?", answer: "Paid plans are not on sale yet. Checkout stays off until Paystack goes live, so nobody can be charged now. Prices are in KES." },
      { question: "Will it message my clients without asking me?", answer: "No. Every automation is off until you switch it on, and opted-out clients are never contacted. Email works today; SMS and WhatsApp are rolling out." },
      { question: "Can my whole team use it?", answer: "Yes. Vendor Pro is KES 1,500 a month with extra staff seats at KES 500. Studio & Gym is KES 5,000 a month with 10 seats." },
      { question: "Is there a student price?", answer: "Yes. Students get 50% off Premium." },
    ],
    trial: TRIAL_30_DAY,
    ctaLabel: "Open LookFinesse",
  },

  convoria: {
    headline: "Speak the world, one conversation at a time.",
    promise: "12 languages to C2, an AI tutor you can talk to, and lessons that work offline.",
    audiences: ["Beginners and returning learners", "Travellers and job seekers", "Exam takers", "Families with children"],
    sellingPoints: [
      {
        title: "Speak sooner",
        points: [
          "Hold to talk with an AI tutor on a voice call, with spoken replies and captions.",
          "Role-play the Maasai Market, a job interview or the airport, then get fluency and accuracy scores.",
          "Word-by-word pronunciation scores and a shadowing studio.",
        ],
      },
      {
        title: "Time saved",
        points: [
          "A placement test and test-outs let you skip what you already know.",
          "Spaced reviews (FSRS) bring words back right before you forget them.",
          "Stuck? Ask AI gives a hint first, then explains the answer.",
        ],
      },
      {
        title: "Local fit, low data",
        points: [
          "English, Kiswahili, French, German, Spanish, Arabic, Japanese, Korean, Mandarin, Italian, Zulu and Kinyarwanda.",
          "Explanations in your own language. Tap any word to translate and save it.",
          "Bundled narration and offline packs work without data. A low-data mode saves bundles.",
          "Sounds & Letters teaches new scripts like Arabic, Japanese, Korean and Mandarin.",
        ],
      },
      {
        title: "Stay motivated, stay safe",
        points: [
          "Streaks with free freezes, leagues and a friends leaderboard with block and report.",
          "Verifiable certificates and a shareable Proficiency Passport.",
          "Kids mode with a parent PIN and a daily time limit.",
          "What tutors remember about you stays on your device. SMS/WhatsApp messages are opt-in.",
        ],
      },
    ],
    howItWorks: [
      "Download the Android app or open it on the web. Your 30-day trial starts at sign-up.",
      "Take the placement test and pick your language.",
      "Learn with lessons and stories, then practise speaking with an AI tutor.",
      "Keep your streak, test out of levels, and earn certificates.",
    ],
    outcomes: [
      { before: "You learn phrases but freeze when someone talks back.", after: "You role-play real conversations and get scored corrections." },
      { before: "A new script feels like a wall.", after: "Sounds & Letters teaches the characters first." },
      { before: "Expensive data breaks your routine.", after: "Offline packs and low-data mode keep your streak going on the matatu." },
    ],
    faqs: [
      { question: "Is Convoria free to try?", answer: "Yes. 30 days free, no card, with AI and premium tools. Reminders come at 7, 3 and 1 days left. Paid plans are rolling out." },
      { question: "Which languages, and how far?", answer: "12 languages, each up to C2/Mastery. Zulu and Kinyarwanda are still being reviewed by native speakers." },
      { question: "Do I start from zero?", answer: "No. Take the placement test or test out of a level." },
      { question: "Does it work offline?", answer: "Yes. Narration, offline packs and progress work offline. AI tutors need a connection." },
      { question: "Is it on Google Play or iOS?", answer: "Android is a free APK download today, and it works on the web. Google Play and the iOS App Store are rolling out." },
    ],
    trial: TRIAL_30_DAY,
    ctaLabel: "Try Convoria",
  },
};

export function getProductCopy(id: string): ProductCopy | undefined {
  return productCopy[id];
}
