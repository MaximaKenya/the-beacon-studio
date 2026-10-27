import Link from "next/link";
import { HowItWorksCard } from "@/components/automations/HowItWorksCard";
import { siteConfig } from "@/data/site";
import { TEMPLATE_DEFS } from "@/automations/templates/public";
import { CHANNEL_NOTE, USAGE_STEPS } from "@/lib/automations/how-it-works";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "How our automations work",
  description: "What starts each automation, what you enter, what it does and sends, and how to sign up, set up, pause and pay.",
  path: "/how-it-works",
});

export default function HowItWorksPage() {
  const catalog = new Map(siteConfig.automationCatalog.templates.map((item) => [item.id, item] as const));
  const items = TEMPLATE_DEFS.map((def) => ({ id: def.id, name: catalog.get(def.id)?.name || def.id, category: catalog.get(def.id)?.category || "Other" }));
  const categories = [...new Set(items.map((item) => item.category))];
  return (
    <div className="mx-auto max-w-5xl px-6 pb-24 pt-28 lg:px-8">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">How it works</p>
      <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-heading">Every automation, in plain words.</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">What starts it, what you give it, what it does, what you see and what it sends.</p>

      <section className="mt-10">
        <h2 className="font-display text-2xl font-semibold text-heading">Using it, step by step</h2>
        <ol className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {USAGE_STEPS.map((step, index) => (
            <li key={step.title} className="sleek-card rounded-2xl p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-accent">Step {index + 1}</p>
              <h3 className="mt-1 font-display text-base font-semibold text-heading">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="sleek-card mt-8 rounded-3xl p-6">
        <h2 className="font-display text-lg font-semibold text-heading">Channels</h2>
        <ul className="mt-3 space-y-2 text-sm text-muted">
          <li><span className="font-semibold text-foreground">Email:</span> {CHANNEL_NOTE.email}</li>
          <li><span className="font-semibold text-foreground">SMS and WhatsApp:</span> {CHANNEL_NOTE.phone}</li>
          <li>Nothing is ever sent from the demo sandbox.</li>
        </ul>
      </section>

      {categories.map((category) => (
        <section key={category} className="mt-12">
          <h2 className="font-display text-2xl font-semibold text-heading">{category}</h2>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {items
              .filter((item) => item.category === category)
              .map((item) => (
                <HowItWorksCard key={item.id} id={item.id} templateId={item.id} title={item.name} />
              ))}
          </div>
        </section>
      ))}

      <div className="mt-12 flex flex-wrap gap-3">
        <Link href="/automations" className="inline-flex h-11 items-center rounded-2xl bg-accent px-4 text-sm font-semibold text-background">
          Start the free month
        </Link>
        <Link href="/portal/login" className="inline-flex h-11 items-center rounded-2xl bg-surface-elevated/80 px-4 text-sm font-semibold text-foreground">
          Portal sign in
        </Link>
      </div>
    </div>
  );
}
