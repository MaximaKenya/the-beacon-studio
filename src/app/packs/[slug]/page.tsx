import Link from "next/link";
import { notFound } from "next/navigation";
import { industryPacks } from "@/data/site";
import { packById, packQuote } from "@/automations/packs";
import { templateById } from "@/automations/templates/public";
import { TRIAL_DAYS } from "@/lib/automations/trial";
import { formatKes } from "@/lib/fx";
import { absoluteUrl, pageMetadata } from "@/lib/seo";
import { AnnualBadge } from "@/components/revenue/Offers";
import { WorksWithApps } from "@/components/revenue/WorksWithApps";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return industryPacks.map((pack) => ({ slug: pack.id }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const pack = packById(slug);
  if (!pack) return { title: "Pack" };
  const quote = packQuote(pack);
  return pageMetadata({
    title: `${pack.name}: automations for ${pack.industry.toLowerCase()} in Kenya`,
    description: `${pack.summary} ${formatKes(quote.recurringMonthlyKes)} a month. ${TRIAL_DAYS} days free.`,
    path: `/packs/${pack.id}`,
    keywords: pack.keywords,
  });
}

export default async function PackPage({ params }: Props) {
  const { slug } = await params;
  const pack = packById(slug);
  if (!pack) notFound();
  const monthly = packQuote(pack, "monthly");
  const annual = packQuote(pack, "annual");
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `${pack.name} · The Beacon Studio`,
    description: pack.summary,
    areaServed: "KE",
    url: absoluteUrl(`/packs/${pack.id}`),
    offers: { "@type": "Offer", price: monthly.recurringMonthlyKes, priceCurrency: "KES" },
  };
  return (
    <div className="mx-auto max-w-5xl px-6 pb-24 pt-28 lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <p className="price-accent text-xs font-medium uppercase tracking-wide">{pack.industry} pack</p>
      <h1 className="mt-2 max-w-2xl font-display text-4xl font-semibold tracking-tight text-heading">{pack.headline}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">{pack.summary}</p>

      <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="grid gap-5 sm:grid-cols-2">
          {monthly.items.map((item) => {
            const template = templateById(item.id);
            return (
              <div key={item.id} className="sleek-card flex flex-col rounded-3xl p-6">
                <h2 className="font-display text-lg font-semibold text-heading">{item.name}</h2>
                {template?.summary && <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{template.summary}</p>}
                <p className="mt-4 text-xs text-muted">{formatKes(item.monthlyKes)}/mo on its own</p>
              </div>
            );
          })}
        </div>
        <aside className="sleek-card price-card-popular h-fit rounded-3xl p-7 sm:p-8 lg:sticky lg:top-28">
          <p className="text-sm text-muted">Pack price</p>
          <p className="mt-2 font-display text-4xl font-semibold tracking-tight text-heading">{formatKes(monthly.recurringMonthlyKes)}</p>
          <p className="mt-1 text-sm text-muted">a month{monthly.bundlePercent ? ` · ${monthly.bundlePercent}% bundle discount` : ""}</p>
          <p className="mt-4 text-sm text-muted">Annual: {formatKes(annual.recurringMonthlyKes)}/mo</p>
          <AnnualBadge className="mt-3" />
          {monthly.setupKes > 0 && <p className="mt-3 text-sm text-muted">Setup: {formatKes(monthly.setupKes)}</p>}
          <Link href={`/automations?pack=${pack.id}`} className="price-btn price-btn-primary mt-7 w-full">
            Start {TRIAL_DAYS}-day free trial
          </Link>
          <Link href="/book" className="price-accent mt-3 block text-center text-sm font-medium hover:underline">
            Book a call instead
          </Link>
          <p className="mt-5 text-xs leading-relaxed text-muted">No card needed. Priced with the same calculator as the buffet.</p>
          <Link href="/add-ons#care" className="price-accent mt-3 block text-center text-xs hover:underline">
            Add a care plan from $50/month
          </Link>
        </aside>
      </div>

      <WorksWithApps className="mt-8" />

      <p className="mt-10 text-sm text-muted">
        Not sure it pays off?{" "}
        <Link href="/automation-roi" className="text-accent hover:underline">
          Run the ROI calculator
        </Link>
        .
      </p>
    </div>
  );
}
