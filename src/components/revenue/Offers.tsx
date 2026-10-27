import Link from "next/link";
import { carePlans, foundersLock, mpesaAddon, proAddons, whatsappAddon } from "@/data/site";
import { formatKes, formatUsd } from "@/lib/fx";
import { annualPrice, whatsappUnitKes } from "@/lib/revenue-pricing";

const card = "sleek-card rounded-3xl p-6";
const cta = "mt-4 inline-flex h-10 items-center justify-center rounded-2xl bg-accent px-4 text-sm font-semibold text-background";

export function AnnualBadge({ className = "" }: { className?: string }) {
  const percent = annualPrice(1).percent;
  return <span className={`inline-flex rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent ${className}`}>Pay yearly, save {percent}%</span>;
}

export function CarePlansGrid({ ctaHref = "/add-ons#care" }: { ctaHref?: string }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {carePlans.map((plan) => {
        const annual = annualPrice(plan.monthlyUsd);
        return (
          <article key={plan.id} className={card}>
            <h3 className="font-display text-lg font-semibold text-heading">{plan.name}</h3>
            <p className="mt-1 text-sm text-muted">{plan.summary}</p>
            <p className="mt-3 font-display text-2xl font-semibold text-heading">
              {formatUsd(plan.monthlyUsd)}
              <span className="text-sm font-normal text-muted"> / month</span>
            </p>
            <p className="text-xs text-muted">
              Or {formatUsd(annual.perYear)} a year, save {formatUsd(annual.savingPerYear)}
            </p>
            <ul className="mt-3 space-y-1 text-sm text-muted">
              {plan.includes.map((item) => (
                <li key={item}>· {item}</li>
              ))}
            </ul>
            <Link href={`${ctaHref}`} className={cta}>
              Request invoice
            </Link>
          </article>
        );
      })}
    </div>
  );
}

export function WhatsAppTiers() {
  const marketing = whatsappUnitKes("marketing");
  const utility = whatsappUnitKes("utility");
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        {whatsappAddon.tiers.map((tier) => (
          <article key={tier.id} className={card}>
            <h3 className="font-display text-lg font-semibold text-heading">{tier.name}</h3>
            <p className="mt-3 font-display text-2xl font-semibold text-heading">
              {formatKes(tier.monthlyKes)}
              <span className="text-sm font-normal text-muted"> / month</span>
            </p>
            <ul className="mt-3 space-y-1 text-sm text-muted">
              <li>· {tier.marketingIncluded.toLocaleString("en-KE")} marketing messages</li>
              <li>· {tier.utilityIncluded.toLocaleString("en-KE")} utility messages</li>
            </ul>
          </article>
        ))}
      </div>
      <p className="text-sm text-muted">
        {whatsappAddon.status}. Extra messages are billed at cost plus {whatsappAddon.markupPercent}%: KSh {marketing.toFixed(2)} per marketing and KSh{" "}
        {utility.toFixed(2)} per utility message (cost KSh {whatsappAddon.costBasisKes.marketing} and KSh {whatsappAddon.costBasisKes.utility}). {whatsappAddon.costBasisNote}
      </p>
    </div>
  );
}

export function MpesaCard() {
  return (
    <article className={card}>
      <h3 className="font-display text-lg font-semibold text-heading">M-Pesa collections</h3>
      <p className="mt-1 text-sm text-muted">{mpesaAddon.summary}</p>
      <p className="mt-2 text-xs font-semibold text-accent">{mpesaAddon.status}</p>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
        {mpesaAddon.uses.map((use) => (
          <li key={use.id} className="text-sm text-muted">
            <span className="font-semibold text-foreground">{use.name}.</span> {use.detail}
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-muted">{mpesaAddon.note}</p>
    </article>
  );
}

export function ProAddonsGrid({ ctaHref = "/add-ons#pro" }: { ctaHref?: string }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {proAddons.map((addon) => (
        <article key={addon.id} className={card}>
          <h3 className="font-display text-base font-semibold text-heading">{addon.name}</h3>
          <p className="mt-1 text-sm text-muted">{addon.detail}</p>
          <p className="mt-2 text-sm font-semibold text-foreground">
            {formatKes(addon.priceKes)} <span className="font-normal text-muted">{addon.unit}</span>
          </p>
          <Link href={ctaHref} className="mt-3 inline-flex text-sm font-semibold text-accent">
            Request invoice →
          </Link>
        </article>
      ))}
    </div>
  );
}

export function FoundersNote() {
  return (
    <div className={card}>
      <h3 className="font-display text-lg font-semibold text-heading">{foundersLock.title}</h3>
      <p className="mt-1 text-sm text-muted">{foundersLock.terms}</p>
    </div>
  );
}
