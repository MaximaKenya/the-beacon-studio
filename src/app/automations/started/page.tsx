import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Automation started",
  robots: { index: false, follow: false },
};

export default async function AutomationStartedPage({
  searchParams,
}: {
  searchParams: Promise<{ paid?: string; invoice?: string; email?: string; canceled?: string }>;
}) {
  const params = await searchParams;
  const invoice = params.invoice === "1";
  const paid = params.paid === "1";
  const email = params.email || "";
  return (
    <div className="mx-auto max-w-xl px-6 py-28">
      <article className="sleek-card rounded-3xl p-8">
        <h1 className="font-display text-3xl font-semibold text-foreground">
          {invoice ? "Invoice requested" : paid ? "You are live" : "Payment not completed"}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          {invoice
            ? "The automations stay pending until we mark the invoice paid. Sign in to the portal with the same email to watch them."
            : paid
              ? "The bundle is active. Sign in to the portal with the same email to see status, logs, and billing."
              : "Nothing was switched on. You can return to the buffet and try again."}
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
