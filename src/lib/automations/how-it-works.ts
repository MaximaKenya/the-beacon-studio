/**
 * Plain-language "how it works" card for every automation.
 * Shown on the portal automation detail and on /how-it-works.
 * Keep each line short. The test checks every template has a card.
 */
import { orgFieldsFor } from "@/lib/automations/org-fields";
export type HowItWorks = {
  /** What starts a run. */
  trigger: string;
  /** What the client gives it, and where they enter it. */
  needs: string;
  /** What it does on each run. */
  does: string;
  /** What the client sees in the portal. */
  sees: string;
  /** Who gets what. */
  sends: string;
  /** True when it can text a phone number (SMS/WhatsApp). */
  phone: boolean;
};

const PORTAL_ROWS = "Portal → the automation → Inputs (add rows or upload a CSV).";

const CARDS: Record<string, HowItWorks> = {
  "lead-reply": {
    trigger: "Someone fills in your lead form (/a/<your-link>/lead) or the website widget.",
    needs: "Your reply tone and what a good lead looks like. Set in Setup.",
    does: "Saves the lead, replies within a minute, scores it hot, warm or cold, and alerts you.",
    sees: "The lead in Leads with its score, plus a line in Run history.",
    sends: "Reply to the lead by email (and SMS if they left a phone). Alert to you by email.",
    phone: true,
  },
  "abandoned-quote": {
    trigger: "A quote goes in through the lead form, or you add it in Inputs.",
    needs: `Your follow-up messages, one per line, and open quotes. ${PORTAL_ROWS}`,
    does: "Sends the first follow-up (now from the form, tomorrow for added rows), then one every two days. Stop follow-ups ends it.",
    sees: "Each step in Run history and the message counts on the dashboard.",
    sends: "Follow-ups to the customer by email or SMS.",
    phone: true,
  },
  "lead-nurture": {
    trigger: "A new lead comes in through the lead form, or you add one in Inputs.",
    needs: `Your drip messages, one per line. Leads arrive by form or ${PORTAL_ROWS}`,
    does: "Sends the first message (now from the form, tomorrow for added rows), then one every two days.",
    sees: "Leads, each step in Run history, and message counts.",
    sends: "Drip messages to the lead by email or SMS.",
    phone: true,
  },
  "daily-sales": {
    trigger: "Every morning at the hour you choose (Nairobi time).",
    needs: "The hour and what to emphasise. Set in Setup.",
    does: "Totals yesterday's leads, payments, bookings and messages into a short summary.",
    sees: "Each summary in Run history.",
    sends: "The summary to you by email.",
    phone: false,
  },
  "social-drafts": {
    trigger: "Once a week on the day you pick.",
    needs: "Topics you want to post about. Set in Setup.",
    does: "Writes draft posts for the week. Nothing is posted for you.",
    sees: "The drafts in Run history.",
    sends: "The drafts to you by email.",
    phone: false,
  },
  "invoice-reminders": {
    trigger: "Each invoice's due date: 3 days before, on the day and 3 days after.",
    needs: `Customer, amount (KES), due date and contact. ${PORTAL_ROWS}`,
    does: "Sends polite reminders with a pay link and stops the moment you press Mark paid.",
    sees: "Payments list (paid / unpaid), Outstanding total and reminders sent.",
    sends: "Reminders to the customer by email or SMS.",
    phone: true,
  },
  "subscription-renewal": {
    trigger: "Each renewal date: 3 days before, on the day and 3 days after.",
    needs: `Member, amount (KES), renewal date and contact. ${PORTAL_ROWS}`,
    does: "Reminds members to renew and stops when you mark them paid.",
    sees: "Payments list, Outstanding total and reminders sent.",
    sends: "Renewal reminders by email or SMS.",
    phone: true,
  },
  "debt-collection": {
    trigger: "Each balance's due date: 3 days before, on the day, then a firmer note 7 days after.",
    needs: `Debtor, balance (KES), due date and contact. ${PORTAL_ROWS}`,
    does: "Sends reminders that get firmer, and stops when you mark the balance paid.",
    sees: "Payments list, Outstanding total and reminders sent.",
    sends: "Reminders to the debtor by email or SMS.",
    phone: true,
  },
  "sacco-repayments": {
    trigger: "Each instalment date: 3 days before, on the day and 3 days after.",
    needs: `Member, instalment (KES), date and contact. ${PORTAL_ROWS}`,
    does: "Reminds members of repayments and stops when marked paid.",
    sees: "Payments list, Outstanding total and reminders sent.",
    sends: "Reminders by email or SMS.",
    phone: true,
  },
  appointments: {
    trigger: "A customer picks a time on your booking page (/a/<your-link>/book).",
    needs: "Your opening hours and slot length. Set in Setup.",
    does: "Confirms the booking with a calendar file, then reminds them 24 hours and 1 hour before.",
    sees: "Bookings count on the dashboard and each booking in Run history.",
    sends: "Confirmation and reminders to the customer by email or SMS.",
    phone: true,
  },
  "faq-bot": {
    trigger: "A visitor asks a question in the chat widget on your website.",
    needs: "Your questions and answers. Set in Setup, then paste the widget code on your site.",
    does: "Answers only from your list. Questions it can't answer, or that leave an email, are saved as leads.",
    sees: "Questions it could not answer appear in Leads.",
    sends: "The answer in the widget. Questions with an email to you by email.",
    phone: false,
  },
  reviews: {
    trigger: "After a job: share your review link (Share), or your system posts the customer to the review webhook.",
    needs: "Your Google review link. Set in Setup.",
    does: "Asks for a score on /a/<your-link>/review. Happy customers go to Google; unhappy ones come to you privately.",
    sees: "Scores in Reviews and low scores flagged.",
    sends: "The request to the customer by email or SMS. Low scores to you by email.",
    phone: true,
  },
  onboarding: {
    trigger: "A new client signs up on your form (/a/<your-link>/lead), or you add them in Inputs.",
    needs: `Your welcome steps, one per line. Clients arrive by form or ${PORTAL_ROWS}`,
    does: "Sends step one (now for form sign-ups, tomorrow for added rows), then one every two days.",
    sees: "Each step in Run history and message counts.",
    sends: "Onboarding messages by email or SMS.",
    phone: true,
  },
  greetings: {
    trigger: "A day before each birthday or anniversary, every year.",
    needs: `Name, date and contact. ${PORTAL_ROWS}`,
    does: "Sends your greeting and books the same date for next year.",
    sees: "Each greeting in Run history.",
    sends: "Greetings by email or SMS.",
    phone: true,
  },
  rsvp: {
    trigger: "A guest answers on your RSVP page (/a/<your-link>/rsvp).",
    needs: "Event name and date. Set in Setup. Guests can also be added in Inputs.",
    does: "Records the RSVP and reminds each guest the day before.",
    sees: "Guests in Inputs and each reminder in Run history.",
    sends: "Reminders to guests by email or SMS.",
    phone: true,
  },
  nps: {
    trigger: "Share your survey link (Share), or your system posts the customer to the survey webhook.",
    needs: "The survey question. Set in Setup.",
    does: "Collects a 0–10 score on /a/<your-link>/review and works out your NPS.",
    sees: "NPS on the dashboard and every score in Reviews.",
    sends: "The survey by email or SMS. Low scores to you by email.",
    phone: true,
  },
  "weekly-report": {
    trigger: "Once a week on the day you pick.",
    needs: "Nothing beyond the send day. It reads your other automations.",
    does: "Writes a short week-in-review: leads, payments, bookings, messages.",
    sees: "Each report in Run history.",
    sends: "The report to you by email.",
    phone: false,
  },
  "staff-shifts": {
    trigger: "The day before each shift.",
    needs: `Staff name, shift date and contact. ${PORTAL_ROWS}`,
    does: "Reminds each person of their shift.",
    sees: "Each reminder in Run history.",
    sends: "Shift reminders to staff by email or SMS.",
    phone: true,
  },
  "low-stock": {
    trigger: "A stock check once a day.",
    needs: `Item, quantity and reorder level. ${PORTAL_ROWS}`,
    does: "Lists items at or below their reorder level.",
    sees: "Each check in Run history.",
    sends: "A reorder list to you by email.",
    phone: false,
  },
  "doc-expiry": {
    trigger: "Before each expiry date (lead time set in Setup).",
    needs: `Document, expiry date and who to tell. ${PORTAL_ROWS}`,
    does: "Warns before licences, permits or contracts lapse.",
    sees: "Each warning in Run history.",
    sends: "Warnings by email.",
    phone: false,
  },
  "inbox-triage": {
    trigger: "You forward an email to its address (Share), or paste one in the portal.",
    needs: "Your categories. Set in Setup.",
    does: "Sorts it (sales, support, billing, spam) and drafts a reply.",
    sees: "The result in Run history.",
    sends: "The sorted email and draft reply to you by email. Nothing goes to the sender.",
    phone: false,
  },
  "meeting-notes": {
    trigger: "You forward notes to its address (Share), or paste them in the portal.",
    needs: "The notes, pasted in the portal.",
    does: "Turns them into a summary, decisions and action items.",
    sees: "The summary in Run history.",
    sends: "The summary to you by email.",
    phone: false,
  },
  "kpi-digest": {
    trigger: "Once a week on the day you pick.",
    needs: "The numbers you track. Set in Setup.",
    does: "Builds a short KPI digest with the week's trend.",
    sees: "Each digest in Run history.",
    sends: "The digest to you by email.",
    phone: false,
  },
  "school-fees": {
    trigger: "Each fee due date: 3 days before, on the day and 3 days after.",
    needs: `Pupil or parent, amount (KES), due date and contact. ${PORTAL_ROWS}`,
    does: "Reminds parents and stops when the fee is marked paid.",
    sees: "Payments list, Outstanding total and reminders sent.",
    sends: "Reminders to parents by email or SMS.",
    phone: true,
  },
  "clinic-recall": {
    trigger: "When a patient is due back (last visit + recall days).",
    needs: `Patient, last visit date and contact. ${PORTAL_ROWS}`,
    does: "Invites patients back for their check-up.",
    sees: "Each recall in Run history.",
    sends: "Recall messages by email or SMS.",
    phone: true,
  },
  "rent-collection": {
    trigger: "Each rent due date: 3 days before, on the day and 3 days after.",
    needs: `Tenant, rent (KES), due date and contact. ${PORTAL_ROWS}`,
    does: "Reminds tenants with a pay link and stops when marked paid.",
    sees: "Payments list, Outstanding total and reminders sent.",
    sends: "Rent reminders by email or SMS.",
    phone: true,
  },
  maintenance: {
    trigger: "A tenant or customer submits /a/<your-link>/request.",
    needs: "Who should get requests. Set in Setup.",
    does: "Logs the request and passes it on straight away.",
    sees: "The request in Leads and Run history.",
    sends: "The request to you by email.",
    phone: false,
  },
  "custom-reminder": {
    trigger: "On the schedule you set (daily, weekly or monthly).",
    needs: `Your message, schedule and recipients. Set in Setup, or ${PORTAL_ROWS}`,
    does: "Sends your message to everyone on the list each time.",
    sees: "Each send in Run history.",
    sends: "Your message by the channel you choose: email, SMS or WhatsApp.",
    phone: true,
  },
  "custom-report": {
    trigger: "On the schedule you set.",
    needs: "The metrics to include and who gets it. Set in Setup.",
    does: "Builds a report from your automations' numbers.",
    sees: "Each report in Run history.",
    sends: "The report by the channel you choose (email by default).",
    phone: false,
  },
};

/** Every card's "needs" line names the Organization inputs required to activate. */
export const HOW_IT_WORKS: Record<string, HowItWorks> = Object.fromEntries(
  Object.entries(CARDS).map(([id, card]) => {
    const required = orgFieldsFor(id).filter((field) => field.required).map((field) => field.label.toLowerCase());
    const line = `Organization inputs: ${required.join(", ")}${required.length ? " (required)" : ""}, plus your rates, contacts, hours, tone and custom fields.`;
    return [id, { ...card, needs: `${card.needs} ${line}` }];
  })
);

export const CHANNEL_NOTE = {
  email: "Email goes out once the studio's Resend key is set. Until then it is logged as not sent.",
  phone: "Texts wait in the Notify queue until SMS (Africa's Talking) or WhatsApp keys are added, then go out automatically.",
};

export function howItWorks(templateId: string): HowItWorks | null {
  return HOW_IT_WORKS[templateId] || null;
}

/** Step-by-step guide shown on /how-it-works. */
export const USAGE_STEPS: { title: string; body: string }[] = [
  { title: "Sign up", body: "Pick automations at /automations and start the free 30 days. No card needed." },
  { title: "Sign in", body: "Open the portal with the same email. We send a 6-digit code." },
  { title: "Set up", body: "Open each automation and fill in Setup: messages, hours, links." },
  { title: "Organization inputs", body: "Open Organization inputs on each automation: commission and discount rates, payment terms and late fees, stock levels, hours, contacts, tone, opt-out text and your own custom fields. The meter shows what is still required." },
  { title: "Enter your data", body: "Add customers, invoices, dates or stock in Inputs, or upload a CSV. Share your form links for leads, bookings and reviews." },
  { title: "Watch results", body: "The dashboard shows runs, messages, leads, bookings and money collected. Run history shows every step." },
  { title: "Pause or resume", body: "Press Pause on any automation to stop it at once. Resume picks up where it left off." },
  { title: "Billing", body: "After the trial, pay monthly or ask for an invoice from the portal. Mark paid stops reminders for that row." },
];
