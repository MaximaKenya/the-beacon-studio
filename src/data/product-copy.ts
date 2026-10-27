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
  /** Risk or status notice shown prominently. */
  disclaimer?: string;
};

/** Standard trial wording shared by apps that run the 30-day trial. */
export const TRIAL_30_DAY =
  "Free for 30 days from sign-up, no card needed. A counter shows the days left. Card and Paystack checkout stay hidden until payments go live.";

/** Shared strip: what every Beacon app includes. */
export const EVERY_APP_INCLUDES: { title: string; detail: string }[] = [
  { title: "One company behind it", detail: "Every app is built and run by The Beacon Studio, with one support team." },
  { title: "Paystack payments", detail: "M-Pesa and card through Paystack. Checkout opens per app when it goes live." },
  { title: "Branded messages", detail: "SMS, WhatsApp and email go out under the app's own name, by The Beacon Studio." },
  { title: "In-app communication", detail: "Talk to people inside the app instead of scattered chats." },
  { title: "Security practices", detail: "Access controls, audit logs and privacy that follows Kenya's Data Protection Act." },
  { title: "Kenya-based support", detail: "Call or WhatsApp 0706 397 373, or email hello@thebeaconstudio.co.ke." },
];

export const productCopy: Record<string, ProductCopy> = {
  confirent: {
    headline: "Find a home or fill your units, and get rent paid straight to you.",
    promise: "Verified listings across Kenya, and rent by M-Pesa or card with 0% taken from it.",
    audiences: ["Tenants and home seekers", "Landlords", "Agents and agencies", "Developers", "Short-stay guests"],
    sellingPoints: [
      {
        title: "Money you keep",
        points: [
          "Rent goes by M-Pesa (STK prompt) or card straight to the landlord's payout account. ConfiRent takes 0% of rent.",
          "Landlords start free. Agents list up to 3 properties free.",
          "Landlord-approved payment plans for tenants.",
        ],
      },
      {
        title: "Time saved",
        points: [
          "Each payment is matched to its tenancy, so you see who has paid and who owes without a spreadsheet.",
          "Statements and receipts are ready when you need them.",
          "Group chat and broadcast notices reach every tenant at once.",
        ],
      },
      {
        title: "Trust and security",
        points: [
          "Listers are checked with an ID, a selfie and a KRA PIN, reviewed by an admin, to stop fake listings and scams.",
          "Privacy follows Kenya's Data Protection Act.",
        ],
      },
      {
        title: "Built for Kenya, on your phone",
        points: [
          "Free one-to-one in-app messaging on every plan.",
          "An AI assistant answers questions about rent, payment plans and listings.",
          "Install it as a phone app. Short-stay guests can book without an account.",
          "Agencies get team seats. Developers get project pages.",
        ],
      },
    ],
    howItWorks: [
      "Search verified rentals, homes for sale and new developments.",
      "Message the lister in the app and agree the tenancy.",
      "Pay rent by M-Pesa or card. It goes straight to the landlord.",
      "Landlords track payments, statements and notices in one place.",
    ],
    outcomes: [
      { before: "Rent arrives by M-Pesa with no reference and has to be matched by hand.", after: "Each payment is matched to the tenancy, with receipts and statements." },
      { before: "Fake listings and deposit scams make searching risky.", after: "Listers are ID, selfie and KRA PIN checked before they list." },
      { before: "Notices go out one WhatsApp at a time.", after: "Group chat and broadcast notices reach every tenant at once." },
    ],
    faqs: [
      { question: "Does ConfiRent take a cut of rent?", answer: "No. Rent is paid straight to the landlord. ConfiRent takes 0% of rent." },
      { question: "How do tenants pay?", answer: "By M-Pesa (an STK prompt on the phone) or by card." },
      { question: "How are listers verified?", answer: "With an ID, a selfie and a KRA PIN, reviewed by an admin before listing." },
      { question: "What does it cost landlords?", answer: "Landlords start free. Paid plans are from KES 2,999 a month. Agents list up to 3 properties free, and featured listings are from KES 300 a week." },
      { question: "Can I use it on my phone?", answer: "Yes. It works in the browser and installs as a phone app." },
    ],
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
          "Coming soon: supervisor listen-in, whisper and barge, and an SMS/WhatsApp reply inbox.",
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
      { question: "Will it message my clients without asking me?", answer: "No. Every automation is off until you switch it on, and opted-out clients are never contacted. Email works today; SMS and WhatsApp are coming soon." },
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
      { question: "Is Convoria free to try?", answer: "Yes. 30 days free, no card, with AI and premium tools. Reminders come at 7, 3 and 1 days left. Paid plans are coming soon." },
      { question: "Which languages, and how far?", answer: "12 languages, each up to C2/Mastery. Zulu and Kinyarwanda are still being reviewed by native speakers." },
      { question: "Do I start from zero?", answer: "No. Take the placement test or test out of a level." },
      { question: "Does it work offline?", answer: "Yes. Narration, offline packs and progress work offline. AI tutors need a connection." },
      { question: "Is it on Google Play or iOS?", answer: "Not yet. Android is a free APK download today. Google Play and the iOS App Store are coming soon." },
    ],
    trial: TRIAL_30_DAY,
    ctaLabel: "Try Convoria",
  },

  confitrade: {
    headline: "Trading discipline, enforced in code.",
    promise: "A safety-first MetaTrader 5 bot for demo accounts, with hard risk limits, a kill switch and an audit trail.",
    audiences: ["Demo-account traders who want strict rules", "People studying systematic risk control"],
    sellingPoints: [
      {
        title: "Risk limits you cannot skip",
        points: [
          "Each trade risks at most 0.5% of equity, with a 1.2 minimum reward-to-risk.",
          "New entries stop after a 2% daily loss or a 6% drawdown. The drawdown halt stays on until reviewed.",
          "At most 2 open positions, 1 per symbol, 12 trades a day, and a cooldown after 3 losses in a row.",
          "Risk multipliers can only scale risk down, never up.",
          "Stays out of new entries around high-impact news.",
        ],
      },
      {
        title: "Safety by default",
        points: [
          "Demo-only by default. Live mode needs two separate, deliberate confirmations.",
          "A preflight check refuses demo orders on a real account.",
          "Stop-loss and take-profit are sent with each order to the broker.",
        ],
      },
      {
        title: "Control and transparency",
        points: [
          "A one-tap kill switch on the dashboard or your phone pauses new entries.",
          "A tamper-evident, hash-chained audit log of every halt and resume.",
          "Phone alerts for trades, halts and daily summaries.",
          "A positions view with the entry reason and distance to stop and target.",
          "New strategies are paper-traded in shadow mode and must pass a fixed promotion rule.",
        ],
      },
    ],
    howItWorks: [
      "Connect an Exness MetaTrader 5 demo account.",
      "The preflight check confirms it is a demo account.",
      "The bot trades only inside its hard limits, and alerts your phone.",
      "Pause any time with the kill switch, and review the audit log.",
    ],
    outcomes: [
      { before: "One bad day could wipe out weeks of demo progress.", after: "A 2% daily-loss halt stops new entries for the day." },
      { before: "Revenge trading after a losing streak.", after: "A 90-minute cooldown after 3 losses in a row." },
      { before: "No record of when the bot was paused or resumed.", after: "An append-only audit log that shows any edit." },
    ],
    faqs: [
      { question: "Can I buy or try ConfiTrade?", answer: "Not yet. It is a private tool run on an Exness demo account, with no public pricing or trial. Contact us to hear when that changes." },
      { question: "Will it make me money?", answer: "We make no profit claims. Trading carries a high risk of loss, and demo or backtest results do not predict future results." },
      { question: "Does it trade real money?", answer: "Not by default. Live mode needs two deliberate confirmations, and the preflight check refuses demo mode on a real account." },
      { question: "What stops large losses?", answer: "Hard limits on risk per trade, positions, daily loss and drawdown, plus a kill switch. They reduce risk but cannot prevent losses such as gaps or slippage." },
      { question: "Is this financial advice?", answer: "No. ConfiTrade is software, not advice or a signals service. Only trade money you can afford to lose." },
    ],
    ctaLabel: "Ask about ConfiTrade",
    disclaimer:
      "Risk warning: trading forex, gold and indices carries a high risk of loss. ConfiTrade makes no promise of profit. Demo and backtest results do not predict future results. Not financial advice.",
  },
};

export function getProductCopy(id: string): ProductCopy | undefined {
  return productCopy[id];
}
