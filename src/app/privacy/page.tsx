import Link from "next/link";
import { brandContact, brandMailboxAddress } from "@/lib/brand-comms";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Privacy policy",
  description: "How The Beacon Studio collects, uses and protects personal data under the Kenya Data Protection Act, 2019.",
  path: "/privacy",
});

const LAST_UPDATED = "27 Oct 2026";

type Section = { title: string; body?: string; items?: string[] };

const PRIVACY = brandMailboxAddress("admin");
const HELLO = brandMailboxAddress("hello");

const SECTIONS: Section[] = [
  {
    title: "Who decides: controller and processor",
    items: [
      "Controller: for this website, enquiries, bookings, newsletter, trials and our own billing, Beacon decides why and how data is used.",
      "Processor: when a business uses our automations or software for its own customers, that business is the controller. We act only on its written instructions. If you got a message sent for a business, contact that business first; we will help it answer.",
    ],
  },
  {
    title: "What we collect",
    items: [
      "Contact details you give us: name, email, phone, business name and message (contact, booking, intake, trial and newsletter forms).",
      "Account and portal data: sign-in email, project files, messages and settings.",
      "Payment records: amount, reference, channel and the name and phone the payment provider returns. We never see full card numbers, card codes or M-Pesa PINs.",
      "Automation data a client loads: their customers' names, phones, emails and the messages sent.",
      "AI chat text you type into the site assistant.",
      "Basic usage data: pages viewed, referral code, device and IP address for security and rate limiting.",
    ],
  },
  {
    title: "Why we use it and our legal basis",
    items: [
      "To reply, book calls and deliver what you asked for: contract or steps before a contract.",
      "To bill, keep tax records and prevent fraud: legal obligation and legitimate interest.",
      "To keep the site secure and working: legitimate interest.",
      "To send updates and offers: your consent. Every marketing message has a free opt-out.",
      "Client automation data: the client's instructions, under our agreement with them.",
    ],
  },
  {
    title: "Who we share it with",
    body: "We do not sell personal data. Service providers process it for us under contract:",
    items: [
      "Heroku (Salesforce): hosting and database.",
      "Resend: email delivery.",
      "Paystack: card, M-Pesa and bank payments.",
      "Africa's Talking: SMS.",
      "Meta (WhatsApp Cloud API): WhatsApp messages.",
      "Groq and OpenAI: AI chat and drafting. Do not type sensitive data such as ID or health details into the chat.",
      "Authorities, only when the law requires it.",
    ],
  },
  {
    title: "Transfers outside Kenya",
    body: "Some providers store data outside Kenya. We transfer it only with appropriate safeguards, such as written data processing terms, as sections 48 to 50 of the Act require.",
  },
  {
    title: "How long we keep it",
    items: [
      "Enquiries that do not become work: 12 months from last contact.",
      "Accounts and portal data: while active, then up to 12 months after closure.",
      "Messages and delivery logs: 12 months.",
      "AI chat logs: 90 days.",
      "Payment and tax records: 7 years.",
      "Opt-out lists: kept so we keep honouring them.",
      "Client automation data: as the client instructs, deleted or returned when the contract ends.",
    ],
  },
  {
    title: "Cookies",
    body: "We use a few first-party cookies and local storage for sign-in, theme, referral codes and simple analytics. No advertising cookies.",
  },
  {
    title: "Your rights",
    body: "Under the Kenya Data Protection Act, 2019 you can:",
    items: [
      "Access the data we hold about you.",
      "Correct false or misleading data.",
      "Delete data we no longer have a lawful reason to keep.",
      "Object to processing, including any direct marketing.",
      "Restrict processing, get a portable copy, and withdraw consent at any time.",
    ],
  },
  {
    title: "How we protect it",
    body: "HTTPS everywhere, signed sessions, role-based access, rate limits, written terms with providers and a breach response plan. If a breach puts you at real risk, we tell the ODPC within 72 hours and tell you as soon as we can.",
  },
  {
    title: "Changes",
    body: "We post updates here with a new date and tell you by email if a change is significant.",
  },
];

export default function PrivacyPage() {
  const contact = brandContact();
  const legal = [contact.postalAddress, contact.registrationNo ? `Reg. No. ${contact.registrationNo}` : "", contact.kraPin ? `KRA PIN ${contact.kraPin}` : ""].filter(Boolean);
  return (
    <div className="mx-auto max-w-3xl px-6 pb-24 pt-28 lg:px-8">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">Last updated {LAST_UPDATED}</p>
      <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-heading">Privacy policy</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        How The Beacon Studio, a Nairobi software studio, handles personal data under the Kenya Data Protection Act, 2019.
      </p>

      <div className="mt-8 space-y-4">
        {SECTIONS.map((section) => (
          <section key={section.title} className="sleek-card rounded-3xl p-6">
            <h2 className="font-display text-lg font-semibold text-heading">{section.title}</h2>
            {section.body && <p className="mt-2 text-sm leading-relaxed text-muted">{section.body}</p>}
            {section.items && (
              <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-muted">
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
          </section>
        ))}

        <section className="sleek-card rounded-3xl p-6">
          <h2 className="font-display text-lg font-semibold text-heading">Contact us or complain</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Email <a className="text-accent" href={`mailto:${PRIVACY}?subject=Privacy%20request`}>{PRIVACY}</a> or{" "}
            <a className="text-accent" href={`mailto:${HELLO}`}>{HELLO}</a>. Requests are free. We may ask you to confirm who you are.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            You can also complain to the Office of the Data Protection Commissioner (ODPC):{" "}
            <a className="text-accent" href="https://www.odpc.go.ke/file-a-complaint/" target="_blank" rel="noopener noreferrer">odpc.go.ke/file-a-complaint</a>,{" "}
            complaint@odpc.go.ke, 020 780 1800, Britam Tower, 12th Floor, Hospital Road, Upper Hill, Nairobi.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            The Beacon Studio, {contact.city}
            {legal.length > 0 && <> · {legal.join(" · ")}</>}
          </p>
        </section>
      </div>

      <p className="mt-8 text-xs text-muted">
        See also our <Link href="/terms" className="text-accent">terms of use</Link>.
      </p>
    </div>
  );
}
