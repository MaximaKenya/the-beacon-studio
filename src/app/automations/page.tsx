import type { Metadata } from "next";
import { BuffetBuilder } from "@/components/automations/BuffetBuilder";
import { pricedTemplates } from "@/automations/templates/public";
import { siteConfig } from "@/data/site";

export const metadata: Metadata = {
  title: "Automations",
  description: "Tick the ready-made automations you need. Pay monthly or annually with Paystack, or ask for an invoice.",
  alternates: { canonical: "/automations" },
};

export default function AutomationsPage() {
  const templates = pricedTemplates();
  return (
    <div className="mx-auto max-w-6xl px-6 pb-24 pt-28 lg:px-8">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">Automations</p>
      <h1 className="mt-2 max-w-2xl font-display text-4xl font-semibold text-foreground">Pick what should run itself.</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
        {siteConfig.automationPricing.buildBody} One Paystack checkout, or one invoice, covers the whole bundle. Payment turns every selected automation on.
      </p>
      <div className="mt-10">
        <BuffetBuilder templates={templates} />
      </div>
    </div>
  );
}
