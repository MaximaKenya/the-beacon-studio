import { siteConfig, type AutomationCategory, type FaqItem } from "@/data/site";

export type IllustrativeExample = {
  id: string;
  industry: string;
  title: string;
  before: string;
  after: string;
  figure: string;
};

export type SeoLanding = {
  slug: string;
  path: string;
  kind: "category" | "industry";
  category?: AutomationCategory;
  eyebrow: string;
  title: string;
  description: string;
  keywords: string[];
  intro: string;
  pains: string[];
  fit: string[];
  templateIds: string[];
  exampleId: string;
  faqs: FaqItem[];
};

export const illustrativeExamples: IllustrativeExample[] = [
  {
    id: "clinic",
    industry: "Clinic",
    title: "Appointment reminders",
    before: "The front desk calls patients the afternoon before.",
    after: "A reminder goes out 24 hours before and again 1 hour before. The desk handles replies.",
    figure: "Example shape: about 5 hours a week back on the desk.",
  },
  {
    id: "sacco",
    industry: "SACCO",
    title: "Repayment reminders",
    before: "A officer exports the due list and sends WhatsApp notes by hand.",
    after: "Members with a due date get a reminder and a pay link. Paid balances stop.",
    figure: "Example shape: the due list is chased without a Friday export.",
  },
  {
    id: "school",
    industry: "School",
    title: "Fee notices",
    before: "The office prints a fee list and calls parents who have not paid.",
    after: "Parents get the amount, the date, and a pay link. A notice can ride with the reminder.",
    figure: "Example shape: one list, instead of a round of calls.",
  },
  {
    id: "estate",
    industry: "Real estate",
    title: "Enquiry and rent follow-up",
    before: "Agents copy listing questions into WhatsApp and chase rent in a spreadsheet.",
    after: "New enquiries get a reply and a saved lead. Rent reminders stop when payment is confirmed.",
    figure: "Example shape: the agent starts from a list of serious enquiries.",
  },
  {
    id: "retail",
    industry: "Retail",
    title: "Orders and stock",
    before: "Orders arrive in a personal WhatsApp chat and stock is counted at closing.",
    after: "Common order questions get a reply. A daily check emails items at the reorder level.",
    figure: "Example shape: the counter is not the only place an order can land.",
  },
];

const sharedKeywords = ["AI automation Kenya", "Nairobi", siteConfig.brand.name];

export const categoryLandings: SeoLanding[] = [
  {
    slug: "sales",
    path: "/automations/sales",
    kind: "category",
    category: "Sales",
    eyebrow: "Sales automation",
    title: "AI automation for sales teams in Kenya",
    description:
      "Reply to new leads, follow up on quiet quotes, and get a morning sales summary. Ready-made sales automations for Kenyan businesses.",
    keywords: [...sharedKeywords, "sales automation Kenya", "lead follow-up Kenya", "WhatsApp leads"],
    intro:
      "Most small sales teams lose time on the first reply and the quiet quote. These automations answer, qualify, and nudge, then hand you the lead.",
    pains: [
      "New WhatsApp and form leads sit until someone is free.",
      "Quotes go quiet and nobody sends the second note.",
      "The morning starts with scrolling chats instead of a short list.",
    ],
    fit: ["Agencies", "Property agents", "Service businesses", "Shops taking enquiries"],
    templateIds: ["lead-reply", "abandoned-quote", "lead-nurture", "daily-sales", "social-drafts"],
    exampleId: "estate",
    faqs: [
      {
        id: "sales-1",
        question: "Will the automation message a lead without me?",
        answer:
          "Lead auto-reply can send the first reply from the wording you set. Social drafts are not published for you. You still decide what a fit looks like.",
      },
      {
        id: "sales-2",
        question: "How much do sales automations cost in Kenya?",
        answer:
          "Each ready-made automation is KES 2,500–6,500 a month. Sales templates on this page sit inside that range. A bundle discount starts at three automations. The 20-minute audit is free.",
      },
      {
        id: "sales-3",
        question: "Do I need a new CRM?",
        answer:
          "No. The lead is saved on the automation and emailed to you. You can keep the sheet or CRM you already use.",
      },
    ],
  },
  {
    slug: "finance",
    path: "/automations/finance",
    kind: "category",
    category: "Finance",
    eyebrow: "Finance automation",
    title: "Payment and SACCO automation in Kenya",
    description:
      "Invoice reminders, subscription renewals, debt follow-up, and SACCO repayments with M-Pesa or card links. AI automation for Kenyan finance teams.",
    keywords: [...sharedKeywords, "invoice reminders Kenya", "SACCO automation", "M-Pesa payment reminders"],
    intro:
      "Chasing the same balances by hand is the job these automations take. Each reminder can stop for that customer when Paystack confirms payment.",
    pains: [
      "Invoices are followed up when someone remembers.",
      "SACCO officers rebuild the due list every week.",
      "A paid customer still gets the next reminder.",
    ],
    fit: ["SACCOs", "Schools", "Landlords", "Professional firms"],
    templateIds: ["invoice-reminders", "subscription-renewal", "debt-collection", "sacco-repayments"],
    exampleId: "sacco",
    faqs: [
      {
        id: "fin-1",
        question: "Does a reminder stop after payment?",
        answer:
          "Yes, on the payment automations. When Paystack confirms that customer's payment, later reminders for that balance stop.",
      },
      {
        id: "fin-2",
        question: "Can members pay by M-Pesa?",
        answer:
          "The reminder can include a Paystack link. Paystack accepts M-Pesa or card when the account is set up for it.",
      },
      {
        id: "fin-3",
        question: "Is this debt collection legal wording?",
        answer:
          "No. You write the messages. The ladder is a polite note, a firmer note, then a final notice. Have your own adviser check wording if you need that.",
      },
    ],
  },
  {
    slug: "customers",
    path: "/automations/customers",
    kind: "category",
    category: "Customers",
    eyebrow: "Customer automation",
    title: "Customer replies and reminders in Kenya",
    description:
      "Booking pages, FAQ chat, review requests, onboarding, and greetings for Kenyan customer teams. AI automation that keeps the personal reply.",
    keywords: [...sharedKeywords, "appointment reminders Kenya", "WhatsApp FAQ bot", "customer follow-up"],
    intro:
      "Customers still want a person when it matters. These automations cover the repeated reply, the reminder, and the review ask.",
    pains: [
      "Bookings are confirmed in a chat and then forgotten.",
      "The same five questions arrive every day.",
      "Nobody asks for a review until the moment has passed.",
    ],
    fit: ["Clinics", "Salons", "Schools", "Hospitality", "Professional services"],
    templateIds: ["appointments", "faq-bot", "reviews", "onboarding", "greetings", "rsvp", "nps"],
    exampleId: "clinic",
    faqs: [
      {
        id: "cus-1",
        question: "Will the FAQ bot invent answers?",
        answer:
          "It answers from the FAQ or notes you paste. A question it cannot answer is saved as a lead for you.",
      },
      {
        id: "cus-2",
        question: "Can patients or clients book a time?",
        answer:
          "The appointment automation gives you a public booking page, a confirmation, and reminders 24 hours and 1 hour before.",
      },
      {
        id: "cus-3",
        question: "Does this replace my receptionist?",
        answer:
          "No. It takes the repeated reminder and the repeated question. A person still handles the conversation that needs one.",
      },
    ],
  },
  {
    slug: "operations",
    path: "/automations/operations",
    kind: "category",
    category: "Operations",
    eyebrow: "Operations automation",
    title: "Operations automation for Kenyan teams",
    description:
      "Weekly reports, shift reminders, low-stock alerts, contract expiry, and inbox drafts. AI automation for day-to-day operations in Kenya.",
    keywords: [...sharedKeywords, "low stock alerts Kenya", "staff reminders", "operations automation Nairobi"],
    intro:
      "Operations work fails when a date, a stock level, or an email sits in one person's head. These automations send the reminder and the draft.",
    pains: [
      "Stock is noticed when a customer asks.",
      "Contracts expire because the date was in an email.",
      "The weekly report is rebuilt from chats.",
    ],
    fit: ["Retail", "Offices", "Workshops", "Agencies"],
    templateIds: ["weekly-report", "staff-shifts", "low-stock", "doc-expiry", "inbox-triage", "meeting-notes", "kpi-digest"],
    exampleId: "retail",
    faqs: [
      {
        id: "ops-1",
        question: "Does inbox triage send the reply?",
        answer: "No. It drafts a reply and sends the draft to you. You send it.",
      },
      {
        id: "ops-2",
        question: "How does a low-stock alert know the quantity?",
        answer: "You keep a stock list with a reorder level. The daily check emails you only for items at or below that level.",
      },
      {
        id: "ops-3",
        question: "Can I start with one alert?",
        answer: "Yes. Pick one automation. The free audit is the place to choose which one.",
      },
    ],
  },
  {
    slug: "education",
    path: "/automations/education",
    kind: "category",
    category: "Education",
    eyebrow: "Education automation",
    title: "AI automation for schools in Kenya",
    description:
      "School fee reminders and parent notices, with a pay link and a stop when the fee is paid. Built for Kenyan schools and training centres.",
    keywords: [...sharedKeywords, "school fees automation Kenya", "parent notices", "school WhatsApp reminders"],
    intro:
      "Fee season should not mean a week of calls. Parents get the amount, the date, and a short notice you wrote.",
    pains: [
      "The office calls the same parents from a printed list.",
      "A notice and a fee reminder go out as two separate jobs.",
      "Paid families still appear on the chase list.",
    ],
    fit: ["Primary and secondary schools", "Training centres", "Tutors with groups"],
    templateIds: ["school-fees"],
    exampleId: "school",
    faqs: [
      {
        id: "edu-1",
        question: "Can a school ask for a discount?",
        answer: "Yes. Ask on the free audit. We confirm any school rate in writing before you pay.",
      },
      {
        id: "edu-2",
        question: "Do parents need a new app?",
        answer: "No. Reminders go by email or WhatsApp, with a Paystack link for the fee.",
      },
      {
        id: "edu-3",
        question: "Is this only for fees?",
        answer: "The education template covers fee reminders and a parent notice. Admission questions can use the sales or FAQ automations.",
      },
    ],
  },
  {
    slug: "health",
    path: "/automations/health",
    kind: "category",
    category: "Health",
    eyebrow: "Clinic automation",
    title: "AI automation for clinics in Kenya",
    description:
      "Clinic appointment recall and reminders for Kenyan clinics. Invite patients back after a set number of days without replacing the front desk.",
    keywords: [...sharedKeywords, "clinic reminders Kenya", "patient recall", "appointment automation Nairobi"],
    intro:
      "Recall lists get old in a notebook. This automation invites a patient back when the window you set arrives.",
    pains: [
      "Recall depends on who remembers the last visit.",
      "Appointment reminders are a same-day phone round.",
      "The desk cannot tell which patients were already invited.",
    ],
    fit: ["Outpatient clinics", "Dental rooms", "Physiotherapy", "Optical shops"],
    templateIds: ["clinic-recall", "appointments"],
    exampleId: "clinic",
    faqs: [
      {
        id: "health-1",
        question: "Does this store clinical notes?",
        answer:
          "No. It uses the last-visit date and the recall window you provide. Do not put diagnoses or treatment notes in the automation.",
      },
      {
        id: "health-2",
        question: "Can we still confirm by phone?",
        answer: "Yes. The reminder asks the patient to reply. The desk keeps the conversations that need a person.",
      },
      {
        id: "health-3",
        question: "Is there a booking page as well?",
        answer: "The appointment automation adds a public booking page with confirmation and reminders. Recall is a separate template.",
      },
    ],
  },
  {
    slug: "property",
    path: "/automations/property",
    kind: "category",
    category: "Property",
    eyebrow: "Property automation",
    title: "AI automation for property teams in Kenya",
    description:
      "Rent reminders with a pay link, and a maintenance form for repair requests. AI automation for Kenyan landlords, agents, and agencies.",
    keywords: [...sharedKeywords, "rent collection automation Kenya", "property management automation", "tenant reminders"],
    intro:
      "Rent day and repair requests are the two loops that fill an agent's week. These automations send the reminder and catch the request.",
    pains: [
      "Rent reminders are copied into WhatsApp one tenant at a time.",
      "A paid tenant still gets the next chase.",
      "Repair requests arrive as voice notes with no record.",
    ],
    fit: ["Landlords", "Letting agents", "Property managers"],
    templateIds: ["rent-collection", "maintenance", "lead-reply"],
    exampleId: "estate",
    faqs: [
      {
        id: "prop-1",
        question: "Is this the same product as ConfiRent?",
        answer:
          "No. ConfiRent is the property platform at confirent.co.ke. These automations are studio workflows for teams that want reminders and intake on the tools they already use.",
      },
      {
        id: "prop-2",
        question: "Does rent go through the studio?",
        answer:
          "No. The tenant gets a Paystack link. ConfiRent, separately, pays rent straight to the landlord and takes 0% of rent.",
      },
      {
        id: "prop-3",
        question: "Can listing questions be answered automatically?",
        answer: "The lead auto-reply can answer and save an enquiry. An agent still handles viewings.",
      },
    ],
  },
  {
    slug: "custom",
    path: "/automations/custom",
    kind: "category",
    category: "Custom",
    eyebrow: "Custom automation",
    title: "Custom AI automation in Kenya",
    description:
      "A reminder or a report built from your fields, your message, and your schedule. For Kenyan businesses whose job is not on the ready-made list.",
    keywords: [...sharedKeywords, "custom automation Kenya", "custom reminder", "business report automation"],
    intro:
      "If the job is a date, a list of people, and a message, a custom reminder can carry it. A custom report sends the figures you name.",
    pains: [
      "The ready-made list is close, but the fields are different.",
      "A report is copied out of three places every Monday.",
      "The wording has to be yours.",
    ],
    fit: ["Operators with a specific loop", "Teams that have outgrown a spreadsheet reminder"],
    templateIds: ["custom-reminder", "custom-report"],
    exampleId: "retail",
    faqs: [
      {
        id: "custom-1",
        question: "What can a custom field be?",
        answer:
          "Text, number, date, a recurrence rule, a recipients list, a channel, a message with variables, a file, or a select list.",
      },
      {
        id: "custom-2",
        question: "Can you suggest the fields?",
        answer: "Describe the job in a sentence on the automations page. When Groq is configured, it suggests fields. You can also type them yourself.",
      },
      {
        id: "custom-3",
        question: "When is a custom pilot the better fit?",
        answer:
          "When the workflow needs tools or rules a template cannot hold. A pilot is one workflow from $1,350, usually in 2–3 weeks, and it is quoted properly after the free audit.",
      },
    ],
  },
];

export const industryLandings: SeoLanding[] = [
  {
    slug: "real-estate",
    path: "/industries/real-estate",
    kind: "industry",
    eyebrow: "Real estate",
    title: "AI automation for real estate in Kenya",
    description:
      "Answer property questions, capture buyer or tenant requirements, and remind tenants about rent. AI automation for Kenyan agents and landlords.",
    keywords: [...sharedKeywords, "AI automation Kenya real estate", "property automation Nairobi", "rent reminders Kenya"],
    intro:
      "Agents lose serious enquiries in WhatsApp, and landlords chase rent from a sheet. Start with one of those loops.",
    pains: [
      "Listing questions are answered late, or not at all.",
      "Requirements are trapped in a chat instead of a lead list.",
      "Rent reminders are manual, and paid tenants stay on the list.",
    ],
    fit: ["Letting agents", "Landlords with several units", "Agencies"],
    templateIds: ["lead-reply", "rent-collection", "maintenance", "appointments"],
    exampleId: "estate",
    faqs: [
      {
        id: "re-1",
        question: "What should a Kenyan agency automate first?",
        answer:
          "Usually the first reply to a listing enquiry, or the rent reminder. The free 20-minute audit is for choosing one.",
      },
      {
        id: "re-2",
        question: "Do you replace the agent?",
        answer: "No. Viewings, negotiations, and keys stay with the agent. The automation handles the repeated reply and the reminder.",
      },
      {
        id: "re-3",
        question: "Can this connect to ConfiRent?",
        answer:
          "ConfiRent is a separate product for finding, renting, and managing property. These automations run on your current tools. Ask on the audit if you want them side by side.",
      },
    ],
  },
  {
    slug: "schools",
    path: "/industries/schools",
    kind: "industry",
    eyebrow: "Schools",
    title: "AI automation for schools in Kenya",
    description:
      "Fee reminders, parent notices, and admission enquiries for Kenyan schools. AI automation that keeps the office phone for the conversations that need it.",
    keywords: [...sharedKeywords, "AI automation for schools in Kenya", "school fee reminders", "parent WhatsApp notices"],
    intro:
      "A school office spends fee week on the phone. A reminder with the amount, the date, and a pay link gives that time back.",
    pains: [
      "Fee balances are chased from a printed list.",
      "Parent notices and fee messages are two jobs.",
      "Admission questions arrive after hours and wait until morning.",
    ],
    fit: ["Schools", "Academies", "Training centres"],
    templateIds: ["school-fees", "lead-reply", "faq-bot"],
    exampleId: "school",
    faqs: [
      {
        id: "sch-1",
        question: "Can parents pay school fees by M-Pesa?",
        answer: "The reminder includes a Paystack link. Parents can pay by M-Pesa or card when Paystack is enabled on the account.",
      },
      {
        id: "sch-2",
        question: "Is there a school discount?",
        answer: "Ask on the audit. An NGO, school, or SACCO discount is confirmed in writing before you pay.",
      },
      {
        id: "sch-3",
        question: "Will this message every parent the same way?",
        answer: "You provide the student list, the amounts, and the dates. Each family gets their own figures. Paid balances stop.",
      },
    ],
  },
  {
    slug: "clinics",
    path: "/industries/clinics",
    kind: "industry",
    eyebrow: "Clinics",
    title: "AI automation for clinics in Kenya",
    description:
      "Appointment reminders and patient recall for Kenyan clinics. AI automation for bookings, without storing clinical notes.",
    keywords: [...sharedKeywords, "AI automation for clinics in Kenya", "clinic appointment reminders", "patient recall Nairobi"],
    intro:
      "The front desk should not spend the afternoon calling tomorrow's list. Reminders and recall run from dates you already keep.",
    pains: [
      "Tomorrow's appointments are confirmed by phone.",
      "Patients who should return in 90 days are easy to miss.",
      "After-hours WhatsApp questions wait until the desk opens.",
    ],
    fit: ["Clinics", "Dental", "Optical", "Physiotherapy"],
    templateIds: ["appointments", "clinic-recall", "faq-bot"],
    exampleId: "clinic",
    faqs: [
      {
        id: "cl-1",
        question: "What patient data does the automation need?",
        answer: "A name, a phone or email, and a date. Do not put diagnoses, prescriptions, or notes into the automation.",
      },
      {
        id: "cl-2",
        question: "Can patients book online?",
        answer: "Yes. The appointment template is a public booking page with a confirmation and two reminders.",
      },
      {
        id: "cl-3",
        question: "Does this replace reception?",
        answer: "No. It sends the reminder and the recall. Reception keeps the replies and the visit.",
      },
    ],
  },
  {
    slug: "saccos",
    path: "/industries/saccos",
    kind: "industry",
    eyebrow: "SACCOs",
    title: "AI automation for SACCOs in Kenya",
    description:
      "Loan and SACCO repayment reminders with a pay link, and a stop when the member has paid. AI automation for Kenyan SACCOs.",
    keywords: [...sharedKeywords, "SACCO automation Kenya", "loan repayment reminders", "AI automation for SACCOs"],
    intro:
      "A repayment list should not be retyped into WhatsApp. Members get the amount and the date. Paid balances drop off.",
    pains: [
      "Officers export the due list and message members one by one.",
      "A member who paid in the morning still gets the afternoon reminder.",
      "The wording changes every week because it lives in someone's phone.",
    ],
    fit: ["SACCOs", "Microfinance teams", "Chamas with a formal list"],
    templateIds: ["sacco-repayments", "debt-collection", "invoice-reminders"],
    exampleId: "sacco",
    faqs: [
      {
        id: "sa-1",
        question: "How does a SACCO start?",
        answer: "Bring a member list with amounts and due dates to the free audit. The repayment template is the usual first workflow.",
      },
      {
        id: "sa-2",
        question: "Is there a SACCO rate?",
        answer: "Ask on the audit. A SACCO discount is confirmed in writing before you pay. It is not applied automatically.",
      },
      {
        id: "sa-3",
        question: "Do you take the repayment?",
        answer: "No. The member pays through a Paystack link to your account. The automation only sends the reminder and watches for payment.",
      },
    ],
  },
  {
    slug: "retail",
    path: "/industries/retail",
    kind: "industry",
    eyebrow: "Retail",
    title: "AI automation for retail in Kenya",
    description:
      "WhatsApp order replies, low-stock alerts, and review requests for Kenyan shops and restaurants. AI automation that stays on the tools you use.",
    keywords: [...sharedKeywords, "AI automation for retail Kenya", "WhatsApp orders", "low stock alerts Kenya"],
    intro:
      "A shop loses orders when they land in a personal chat, and loses stock when the count waits until closing. Automate one of those.",
    pains: [
      "Order questions interrupt the counter all day.",
      "A popular item runs out before anyone reorders.",
      "Happy customers are never asked for a review.",
    ],
    fit: ["Shops", "Restaurants", "Wholesalers", "Beauty retail"],
    templateIds: ["faq-bot", "low-stock", "reviews", "lead-reply"],
    exampleId: "retail",
    faqs: [
      {
        id: "rt-1",
        question: "Can it take the whole order?",
        answer:
          "The FAQ bot answers from the menu or product notes you provide. A full ordering app is custom software and is quoted after a call.",
      },
      {
        id: "rt-2",
        question: "How does low stock work without a new system?",
        answer: "You keep a list with quantities and a reorder level. The daily check emails you when an item hits that level.",
      },
      {
        id: "rt-3",
        question: "What does a Kenyan retailer automate first?",
        answer: "Usually the repeated WhatsApp reply, or the stock alert. The free audit picks one.",
      },
    ],
  },
];

export function landingBySlug(kind: SeoLanding["kind"], slug: string): SeoLanding | undefined {
  const list = kind === "category" ? categoryLandings : industryLandings;
  return list.find((page) => page.slug === slug);
}

export function exampleById(id: string): IllustrativeExample | undefined {
  return illustrativeExamples.find((item) => item.id === id);
}

export function templatesForLanding(page: SeoLanding) {
  const ids = new Set(page.templateIds);
  return siteConfig.automationCatalog.templates.filter((item) =>
    page.category ? item.category === page.category : ids.has(item.id)
  );
}
