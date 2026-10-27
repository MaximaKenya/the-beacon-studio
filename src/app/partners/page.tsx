import { partnerTiers } from "@/data/site";
import { PartnershipsSection } from "@/components/revenue/PartnershipsSection";
import { RequestForm } from "@/components/revenue/RequestForm";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Partner and reseller programme",
  description: "Resell The Beacon Studio automations under your brand at wholesale prices. Apply to become a partner.",
  path: "/partners",
});

export default function PartnersPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 pb-24 pt-28 lg:px-8">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">Partners</p>
      <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-heading">Resell our automations.</h1>
      <p className="mt-3 max-w-2xl text-sm text-muted">Agencies and consultants get wholesale prices. We build and run it; you own the client.</p>
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {partnerTiers.map((tier) => (
          <article key={tier.id} className="sleek-card rounded-3xl p-6">
            <h2 className="font-display text-lg font-semibold text-heading">{tier.name}</h2>
            <p className="mt-3 font-display text-2xl font-semibold text-heading">{tier.wholesaleDiscountPercent}% off list</p>
            <p className="text-xs text-muted">
              From {tier.minClients} active client{tier.minClients === 1 ? "" : "s"}
            </p>
            <ul className="mt-3 space-y-1 text-sm text-muted">
              {tier.perks.map((perk) => (
                <li key={perk}>· {perk}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
      <div id="apply" className="mt-8 max-w-2xl scroll-mt-28">
        <RequestForm
          kind="partner"
          title="Apply to be a partner"
          companyRequired
          options={partnerTiers.map((tier) => ({ id: tier.id, label: tier.name }))}
          submitLabel="Apply"
          messagePlaceholder="Your agency, the clients you serve, and how many you could bring."
        />
      </div>
      <PartnershipsSection />
    </div>
  );
}
