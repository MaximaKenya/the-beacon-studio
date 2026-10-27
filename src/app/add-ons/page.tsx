import { carePlans, mpesaAddon, proAddons, whatsappAddon } from "@/data/site";
import { AnnualBadge, CarePlansGrid, FoundersNote, MpesaCard, ProAddonsGrid, WhatsAppTiers } from "@/components/revenue/Offers";
import { RequestForm } from "@/components/revenue/RequestForm";
import { WorksWithApps } from "@/components/revenue/WorksWithApps";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Add-ons and care plans",
  description: "Care plans, WhatsApp messaging, M-Pesa collections and pro add-ons for your automations. Billed by invoice.",
  path: "/add-ons",
});

export default function AddOnsPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 pb-24 pt-28 lg:px-8">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">Add-ons</p>
      <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-heading">Add what your business needs.</h1>
      <p className="mt-3 max-w-2xl text-sm text-muted">Every add-on is billed by invoice. Request one below and we reply within one working day.</p>

      <section id="care" className="mt-14 scroll-mt-28">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="font-display text-2xl font-semibold text-heading">Care plans</h2>
          <AnnualBadge />
        </div>
        <div className="mt-6">
          <CarePlansGrid ctaHref="#care-form" />
        </div>
        <div id="care-form" className="mt-6 grid gap-4 md:grid-cols-2">
          <RequestForm kind="care-plan" title="Request a care plan" options={carePlans.map((plan) => ({ id: plan.id, label: plan.name }))} submitLabel="Request invoice" />
          <FoundersNote />
        </div>
      </section>

      <section id="whatsapp" className="mt-16 scroll-mt-28">
        <h2 className="font-display text-2xl font-semibold text-heading">WhatsApp messaging</h2>
        <p className="mt-1 text-sm font-semibold text-accent">{whatsappAddon.status}</p>
        <div className="mt-6">
          <WhatsAppTiers />
        </div>
        <div className="mt-6 max-w-2xl">
          <RequestForm kind="whatsapp-addon" title="Request WhatsApp add-on" options={whatsappAddon.tiers.map((tier) => ({ id: tier.id, label: tier.name }))} />
        </div>
      </section>

      <section id="mpesa" className="mt-16 scroll-mt-28">
        <h2 className="font-display text-2xl font-semibold text-heading">M-Pesa collections</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <MpesaCard />
          <RequestForm
            kind="mpesa-addon"
            title="Request M-Pesa setup"
            options={mpesaAddon.uses.map((use) => ({ id: use.id, label: use.name }))}
            messagePlaceholder="Paybill or till type, and roughly how many payers. Do not send keys or PINs."
          />
        </div>
      </section>

      <section id="pro" className="mt-16 scroll-mt-28">
        <h2 className="font-display text-2xl font-semibold text-heading">Pro add-ons</h2>
        <div className="mt-6">
          <ProAddonsGrid ctaHref="#pro-form" />
        </div>
        <div id="pro-form" className="mt-6 max-w-2xl">
          <RequestForm kind="pro-addon" title="Request a pro add-on" options={proAddons.map((addon) => ({ id: addon.id, label: addon.name }))} submitLabel="Request invoice" />
        </div>
      </section>

      <WorksWithApps className="mt-16" />
    </div>
  );
}
