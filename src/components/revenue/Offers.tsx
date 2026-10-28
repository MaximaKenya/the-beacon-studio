import Link from "next/link";
import type { ReactNode } from "react";
import { Check } from "lucide-react";
import { carePlans, foundersLock, mpesaAddon, proAddons, whatsappAddon } from "@/data/site";
import { formatKes, formatUsd } from "@/lib/fx";
import { annualPrice, whatsappUnitKes } from "@/lib/revenue-pricing";

const card = "sleek-card price-tone rounded-3xl p-6 sm:p-8";
const priceCard = "sleek-card price-card price-lift";
const cta = "price-btn price-btn-secondary mt-8 self-start";

function CheckItem({ children }: { children: ReactNode }) {
  return (
    <li className="flex gap-3 text-sm leading-relaxed text-foreground">
      <span className="price-check" aria-hidden>
        <Check className="h-3 w-3" strokeWidth={3} />
      </span>
      <span className="min-w-0">{children}</span>
    </li>
  );
}

export function AnnualBadge({ className = "" }: { className?: string }) {
  const percent = annualPrice(1).percent;
  return <span className={`inline-flex rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent ${className}`}>Pay yearly, save {percent}%</span>;
}

export function CarePlansGrid({ ctaHref = "/add-ons#care" }: { ctaHref?: string }) {
  return (
    <div className="price-grid">
      {carePlans.map((plan) => {
        const annual = annualPrice(plan.monthlyUsd);
        return (
          <article key={plan.id} className={priceCard}>
            <h3 className="font-display text-xl font-semibold text-heading">{plan.name}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{plan.summary}</p>
            <p className="price-amount mt-6 font-display text-4xl font-semibold tracking-tight text-heading">
              {formatUsd(plan.monthlyUsd)}
              <span className="ml-1 text-sm font-normal tracking-normal text-muted">/ month</span>
            </p>
            <p className="mt-2 text-xs leading-relaxed text-muted">
              Or {formatUsd(annual.perYear)} a year, save {formatUsd(annual.savingPerYear)}
            </p>
            <ul className="mt-7 flex-1 space-y-3.5">
              {plan.includes.map((item) => (
                <CheckItem key={item}>{item}</CheckItem>
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
      <div className="price-grid">
        {whatsappAddon.tiers.map((tier) => (
          <article key={tier.id} className={priceCard}>
            <h3 className="font-display text-xl font-semibold text-heading">{tier.name}</h3>
            <p className="price-amount mt-5 font-display text-4xl font-semibold tracking-tight text-heading">
              {formatKes(tier.monthlyKes)}
              <span className="ml-1 text-sm font-normal tracking-normal text-muted">/ month</span>
            </p>
            <ul className="mt-6 space-y-3.5">
              <CheckItem>{tier.marketingIncluded.toLocaleString("en-KE")} marketing messages</CheckItem>
              <CheckItem>{tier.utilityIncluded.toLocaleString("en-KE")} utility messages</CheckItem>
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
    <div className="price-grid">
      {proAddons.map((addon) => (
        <article key={addon.id} className={priceCard}>
          <h3 className="font-display text-lg font-semibold text-heading">{addon.name}</h3>
          <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{addon.detail}</p>
          <p className="mt-5 font-display text-3xl font-semibold tracking-tight text-heading">
            {formatKes(addon.priceKes)} <span className="text-sm font-normal text-muted">{addon.unit}</span>
          </p>
          <Link href={ctaHref} className="price-accent mt-4 inline-flex self-start text-sm font-semibold hover:underline">
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
