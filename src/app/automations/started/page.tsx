import type { Metadata } from "next";
import Link from "next/link";
import { loadAutomations } from "@/lib/automations/store";
import { TRIAL_DAYS, trialDaysRemaining } from "@/lib/automations/trial";
import { normalizeEmail } from "@/lib/validation";

export const metadata: Metadata = {
  title: "Automation started",
  robots: { index: false, follow: false },
};

export default async function AutomationStartedPage({
  searchParams,
}: {
  searchParams: Promise<{ paid?: string; invoice?: string; email?: string; canceled?: string; trial?: string }>;
}) {
  const params = await searchParams;
  const invoice = params.invoice === "1";
  const paid = params.paid === "1";
  const email = params.email || "";
  let days = TRIAL_DAYS;
  if (email) {
    const doc = await loadAutomations();
    const mine = doc.instances.filter((item) => item.ownerEmail === normalizeEmail(email) && item.trial);
    const ends = mine.map((item) => item.trial?.endsAt).filter((value): value is string => Boolean(value)).sort()[0];
    if (ends) days = trialDaysRemaining(ends);
  }
  const live = params.trial === "1" || invoice || paid || Boolean(email);
  return (
    <div className="mx-auto max-w-xl px-6 py-28 pb-32 max-lg:pr-[6.75rem]">
      <article className="sleek-card rounded-3xl p-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent">The Beacon Studio</p>
        <h1 className="mt-2 font-display text-3xl font-semibold text-foreground">
          {live ? `${days} days remaining` : "Payment not completed"}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          {live
            ? `Your automations are on. Free for ${TRIAL_DAYS} days, no card needed.${invoice ? " An invoice is ready for when the trial ends." : ""} Sign in to the portal with the same email.`
            : "Nothing was switched on. You can return to the buffet and start the free month."}
        </p>
        {email && <p className="mt-3 text-sm text-foreground">Email: {email}</p>}
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/portal/login" className="inline-flex h-11 items-center rounded-2xl bg-accent px-4 text-sm font-semibold text-background">
            Portal sign in
          </Link>
          <Link href="/automations" className="inline-flex h-11 items-center rounded-2xl bg-surface-elevated/80 px-4 text-sm font-semibold text-foreground">
            Back to automations
          </Link>
        </div>
      </article>
    </div>
  );
}
