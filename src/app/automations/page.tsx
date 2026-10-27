import { BuffetBuilder } from "@/components/automations/BuffetBuilder";
import { pricedTemplates } from "@/automations/templates/public";
import { siteConfig } from "@/data/site";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Ready-made automations",
  description:
    "Tick the ready-made automations you need. Pay monthly or annually with Paystack, or ask for an invoice. AI automation Kenya.",
  path: "/automations",
  keywords: ["AI automation Kenya", "ready-made automations", siteConfig.brand.name],
});

export default async function AutomationsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const pack = typeof params.pack === "string" ? params.pack : undefined;
  const templates = pricedTemplates();
  return (
    <div className="mx-auto max-w-6xl px-6 pb-24 pt-28 lg:px-8">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">Automations</p>
      <h1 className="mt-2 max-w-2xl font-display text-4xl font-semibold text-foreground">Pick what should run itself.</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
        {siteConfig.automationPricing.buildBody} One Paystack checkout, or one invoice, covers the whole bundle. Payment turns every selected automation on.
      </p>
      <div className="mt-10">
        <BuffetBuilder key={pack || "all"} templates={templates} initialPack={pack} />
      </div>
    </div>
  );
}
