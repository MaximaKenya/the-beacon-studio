import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { REFERRAL_CREDIT_EXPIRY_DAYS, REFERRAL_COOKIE_DAYS } from "@/lib/referral-rules";

export const metadata = pageMetadata({
  title: "Referral programme terms",
  description: "Refer a business to The Beacon Studio. They get an extra free month; you earn a free month after their first paid month.",
  path: "/referrals",
});

const TERMS = [
  "Every automation client gets a referral code and link in the portal.",
  "A new client who signs up with your link gets one extra free trial month.",
  "You earn one free-month credit after the referred client pays their first month. Until then it shows as pending.",
  "New clients only. Self-referrals, including your own other emails or the same business domain, do not count.",
  "Each business can be referred once. The link is remembered for " + REFERRAL_COOKIE_DAYS + " days.",
  "Credits expire " + Math.round(REFERRAL_CREDIT_EXPIRY_DAYS / 30) + " months after they are earned and are applied to your next automation invoice.",
  "Credits have no cash value. There are no cash payouts.",
  "We may void a referral that breaks these terms or change the programme with notice in the portal.",
];

export default function ReferralTermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 pb-24 pt-28 lg:px-8">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">Referrals</p>
      <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-heading">Refer a business, get a free month.</h1>
      <ol className="sleek-card mt-8 list-decimal space-y-3 rounded-3xl p-6 pl-10 text-sm leading-relaxed text-muted">
        {TERMS.map((term) => (
          <li key={term}>{term}</li>
        ))}
      </ol>
      <p className="mt-6 text-sm text-muted">
        Find your link in the <Link href="/portal" className="text-accent hover:underline">portal</Link>.
      </p>
    </div>
  );
}
