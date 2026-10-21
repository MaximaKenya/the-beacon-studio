export const SANDBOX_EMAIL = "sandbox@jamiitraders.example";
export const SANDBOX_BUSINESS = "Jamii Traders";
export const SANDBOX_OWNER = "Asha Kamau";

/** Short admin notes: what to collect, then where the client’s automation goes live. */
export const SETUP_GUIDES: Record<string, string> = {
  "lead-reply":
    "Collect the reply tone and what a good lead looks like. Point the client’s form or WhatsApp at the lead webhook. Each new message is scored, saved, and answered. The client gets a copy.",
  "abandoned-quote":
    "Collect one follow-up line per day, and the open quotes (name, email, phone, date). Or POST each new quote to the lead webhook. Messages stop when you use Stop follow-ups.",
  "lead-nurture":
    "Collect the drip lines, one per step, sent every two days. Add the leads, or POST them to the webhook. Stop follow-ups from this desk when the lead is done.",
  "daily-sales":
    "Set the Nairobi hour and what the morning note should emphasise. The first report is scheduled at that hour. It uses leads, payments, and runs already on this account.",
  "social-drafts":
    "Collect the weekday and a few topics. Groq drafts posts and emails them to the client. Nothing is published.",
  "invoice-reminders":
    "Add invoices: name, email, phone, amount in KES, and the due date. A Paystack link is created when Paystack is configured. Reminders stop when the invoice is marked paid.",
  "subscription-renewal":
    "Add each renewal with the date and the amount. Reminders go out before and on that date, and stop once it is paid.",
  "debt-collection":
    "Add the balances. The ladder is polite, then firm, then final. Each step stops for that customer when the balance is paid.",
  "sacco-repayments":
    "Add members, amounts, and due dates. The same payment reminder cycle runs, with a Paystack link when Paystack is configured.",
  appointments:
    "Set the open days, first and last slot, and slot length. Share the public booking page. A booking confirms, then reminds the guest 24 hours and 1 hour before.",
  "faq-bot":
    "Paste the FAQ or docs the bot may use, and a widget title. Embed the widget script. Answers stay inside that text. Unknown questions are saved as leads.",
  reviews:
    "Add the Google review link and the score that should alert the client. Share the review page, or POST a request to the review webhook after a sale.",
  onboarding:
    "Write the welcome lines, one per line. Add new customers, or POST them to the lead webhook. Each line is sent on its own day.",
  greetings:
    "Add the dates, with kind set to birthday or anniversary, and the greeting. Use {{name}} and {{kind}}. It sends on the date you store.",
  rsvp:
    "Set the event name and date. Share the RSVP page. Guests are saved, and a reminder goes out the day before.",
  nps:
    "Set the question, the low-score threshold, and the link for a high score. Share the review page. A low score emails the client. A high score shows the link.",
  "weekly-report":
    "Pick the weekday and any extra note. The report emails leads, payments, messages, and runs for that client’s automations.",
  "staff-shifts":
    "Add the roster: name, email or phone, start date, and the task in the note. The reminder uses {{name}}, {{note}}, and {{date}}.",
  "low-stock":
    "Add each item with quantity and reorder level. The daily check emails the client only for items at or below that level.",
  "doc-expiry":
    "Add the document, who to tell, and the expiry date. Set how many days of notice. One reminder goes out before the date.",
  "inbox-triage":
    "Write how replies should sound. The client forwards a message to the inbox webhook. Groq drafts a reply to the client. It is not sent to the customer.",
  "meeting-notes":
    "Say what to pull out (decisions, owners, dates). The client pastes notes into the notes webhook. The summary is emailed to them.",
  "kpi-digest":
    "Tick the metrics and the weekday. The digest emails only those figures, plus the note the client wrote.",
  "school-fees":
    "Add the parent notice, then students with amounts and due dates. The reminder includes the notice and a pay link when Paystack is configured.",
  "clinic-recall":
    "Set how many days after the last visit to invite the patient back. Add patients with that last-visit date. The reminder goes out when the window arrives.",
  "rent-collection":
    "Add tenants, rent amounts, and due dates. Reminders include a pay link and stop for that tenant when the rent is marked paid.",
  maintenance:
    "List the categories you accept. Share the request form. Each submission is saved and emailed to the client.",
  "custom-reminder":
    "Write the message with {{name}}, {{date}}, {{amount}}, and {{note}}. Set the recurrence, channel, and recipients or rows. It repeats on that schedule.",
  "custom-report":
    "Pick the metrics, how often, and who receives it. The report uses this account’s leads, payments, messages, and runs, plus the note.",
};
