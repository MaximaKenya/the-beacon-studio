import { siteConfig } from "@/data/site";

export type WorkShot = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

export type WorkStudy = {
  slug: string;
  path: string;
  productId: string;
  title: string;
  description: string;
  problem: string;
  solution: string;
  stack: string[];
  stackNote: string;
  resultsNote: string;
  shots: WorkShot[];
};

export const workStudies: WorkStudy[] = [
  {
    slug: "confirent",
    path: "/work/confirent",
    productId: "confirent",
    title: "ConfiRent",
    description:
      "How ConfiRent helps people find a home in Kenya and lets landlords collect rent by M-Pesa or card, with 0% taken from the rent.",
    problem:
      "A renter has to trust a listing, then pay outside the place they found it. A landlord has to chase who has paid and who still owes.",
    solution:
      "ConfiRent is the place to find, rent, buy, and manage property in Kenya. Rent is collected by M-Pesa or card and paid to the landlord. ConfiRent takes 0% of rent.",
    stack: [
      "Public website at confirent.co.ke",
      "Installable phone app",
      "M-Pesa STK and card payments, paid to the landlord",
      "In-app messaging",
      "ID, selfie, and KRA PIN checks for listers",
    ],
    stackNote: "This is the public surface. The internal engineering stack is not published here.",
    resultsNote: "Measured results are not published yet. Add them here when they are real.",
    shots: [
      {
        src: "/work/confirent-home.jpg",
        alt: "ConfiRent homepage captured from confirent.co.ke, with search for verified rentals in Kenya",
        width: 1440,
        height: 1200,
      },
    ],
  },
  {
    slug: "cadenceapp",
    path: "/work/cadenceapp",
    productId: "cadenceapp",
    title: "CadenceApp",
    description:
      "How CadenceApp puts calling, collections, messages, and AI replies in one workspace for customer teams. Early access.",
    problem:
      "A customer team splits the same account across a dialer, a spreadsheet, WhatsApp, email, and a CRM. Returned calls and missed promises get lost between the tools.",
    solution:
      "CadenceApp is one workspace for calling, collections, messages, and AI replies. Calling can be manual, power, or auto on office lines, cloud voice, or the agent's mobile.",
    stack: [
      "Public website at cadenceapp.co.ke",
      "Web workspace with per-seat modules",
      "Calling on office lines, cloud voice, or the agent's mobile",
      "Email and WhatsApp replies, draft or auto-send, with a spending cap",
    ],
    stackNote: "This is the public surface. The internal engineering stack is not published here.",
    resultsNote: "Measured results are not published yet. Figures on the product site are not repeated here.",
    shots: [
      {
        src: "/work/cadenceapp-home.jpg",
        alt: "CadenceApp homepage captured from cadenceapp.co.ke",
        width: 1440,
        height: 1400,
      },
    ],
  },
];

export function workBySlug(slug: string): WorkStudy | undefined {
  return workStudies.find((study) => study.slug === slug);
}

export function productForStudy(study: WorkStudy) {
  return siteConfig.products.find((product) => product.id === study.productId);
}

const INDUSTRY_NOTES: Record<string, string> = {
  "real-estate": "ConfiRent is the property product. CadenceApp is the workspace for a team that also calls and collects.",
  schools: "CadenceApp covers messages and collections. ConfiRent is separate: it is for homes, not school fees.",
  clinics: "CadenceApp covers reminders, calling, and follow-up. ConfiRent is the property product.",
  saccos: "CadenceApp covers repayment follow-up and calling. ConfiRent is the property product.",
  retail: "CadenceApp covers customer messages and follow-up. ConfiRent is the property product.",
  restaurants: "CadenceApp covers customer messages. ConfiRent is the property product.",
};

export function studiesForIndustry(slug: string): { study: WorkStudy; note: string }[] {
  const note = INDUSTRY_NOTES[slug] || "Two products from the studio.";
  return workStudies.map((study) => ({ study, note }));
}
