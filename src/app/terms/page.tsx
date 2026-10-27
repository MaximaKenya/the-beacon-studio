import Link from "next/link";
import { brandMailboxAddress } from "@/lib/brand-comms";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Terms of use",
  description: "Short terms for using The Beacon Studio website, trials and automations.",
  path: "/terms",
});

const TERMS = [
  ["Using the site", "Use the site and trials lawfully. Do not attack, scrape at scale or misuse it."],
  ["Trials and automations", "Trials are free for the stated period with no card. You are responsible for having consent to message your own customers."],
  ["Quotes and payment", "Paid work follows the written quote or agreement we send you. Payments run through Paystack."],
  ["Your data", "You own what you upload. We process client data only on your instructions. See the privacy policy."],
  ["Liability", "We work with care, but the site and AI answers are provided as is. AI output can be wrong; check it before relying on it."],
  ["Law", "These terms follow the laws of Kenya."],
];

export default function TermsPage() {
  const hello = brandMailboxAddress("hello");
  return (
    <div className="mx-auto max-w-3xl px-6 pb-24 pt-28 lg:px-8">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">Last updated 27 Oct 2026</p>
      <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-heading">Terms of use</h1>
      <div className="mt-8 grid gap-4">
        {TERMS.map(([title, body]) => (
          <section key={title} className="sleek-card rounded-3xl p-6">
            <h2 className="font-display text-lg font-semibold text-heading">{title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
          </section>
        ))}
      </div>
      <p className="mt-8 text-xs text-muted">
        Questions: <a className="text-accent" href={`mailto:${hello}`}>{hello}</a> · <Link href="/privacy" className="text-accent">Privacy policy</Link>
      </p>
    </div>
  );
}
