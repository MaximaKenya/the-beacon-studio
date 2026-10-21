import Link from "next/link";
import { siteConfig } from "@/data/site";
import {
  categoryLandings,
  exampleById,
  industryLandings,
  templatesForLanding,
  type SeoLanding,
} from "@/data/landings";
import { FaqJsonLd } from "@/components/seo/FaqJsonLd";
import { JsonLd } from "@/components/seo/OrganizationJsonLd";
import { absoluteUrl } from "@/lib/seo";

function priceRange(page: SeoLanding) {
  const templates = templatesForLanding(page);
  const prices = templates.map((item) => item.priceKes);
  if (prices.length === 0) return null;
  return { low: Math.min(...prices), high: Math.max(...prices), count: prices.length };
}

export function LandingJsonLd({ page }: { page: SeoLanding }) {
  const range = priceRange(page);
  const url = absoluteUrl(page.path);
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: page.title,
          description: page.description,
          serviceType: "AI automation",
          url,
          areaServed: { "@type": "Country", name: "Kenya" },
          provider: {
            "@type": "LocalBusiness",
            name: siteConfig.brand.name,
            telephone: siteConfig.phone,
            address: {
              "@type": "PostalAddress",
              addressLocality: "Nairobi",
              addressCountry: "KE",
            },
          },
          ...(range
            ? {
                offers: {
                  "@type": "AggregateOffer",
                  priceCurrency: "KES",
                  lowPrice: range.low,
                  highPrice: range.high,
                  offerCount: range.count,
                },
              }
            : {}),
        }}
      />
      <FaqJsonLd items={page.faqs} />
    </>
  );
}

export function SeoLandingView({ page }: { page: SeoLanding }) {
  const example = exampleById(page.exampleId);
  const templates = templatesForLanding(page);
  const others = (page.kind === "industry" ? industryLandings : categoryLandings).filter(
    (item) => item.slug !== page.slug
  );

  return (
    <article className="mx-auto max-w-6xl px-6 pb-24 pt-28 lg:px-8">
      <p className="text-sm font-medium text-accent">{page.eyebrow} · Nairobi</p>
      <h1 className="mt-3 max-w-3xl font-display text-4xl font-semibold tracking-tight text-heading sm:text-5xl">
        {page.title}
      </h1>
      <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">{page.intro}</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/book"
          className="inline-flex h-12 items-center rounded-2xl bg-accent px-5 text-sm font-semibold text-background"
        >
          Book a free 20-min audit
        </Link>
        <Link
          href="/checklist"
          className="inline-flex h-12 items-center rounded-2xl bg-surface-elevated/80 px-5 text-sm font-semibold text-foreground"
        >
          Get the SME checklist
        </Link>
      </div>

      <section className="mt-14 grid gap-4 md:grid-cols-3" aria-labelledby="pains-heading">
        <h2 id="pains-heading" className="sr-only">
          What this replaces
        </h2>
        {page.pains.map((pain) => (
          <p key={pain} className="sleek-card rounded-3xl p-6 text-sm leading-relaxed text-foreground">
            {pain}
          </p>
        ))}
      </section>

      {example && (
        <section className="sleek-card mt-10 rounded-3xl p-6 sm:p-8" aria-labelledby="example-heading">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Illustrative example</p>
          <h2 id="example-heading" className="mt-2 font-display text-2xl font-semibold text-heading">
            {example.industry}: {example.title}
          </h2>
          <p className="mt-2 text-sm text-muted">Not a client result. A picture of the workflow, not a measured outcome.</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <p className="text-sm leading-relaxed text-foreground">
              <span className="block text-xs uppercase tracking-wide text-muted">Before</span>
              {example.before}
            </p>
            <p className="text-sm leading-relaxed text-foreground">
              <span className="block text-xs uppercase tracking-wide text-muted">With an automation</span>
              {example.after}
            </p>
          </div>
          <p className="mt-4 text-sm text-muted">{example.figure}</p>
        </section>
      )}

      <section className="mt-14" aria-labelledby="templates-heading">
        <h2 id="templates-heading" className="font-display text-2xl font-semibold text-heading">
          Automations that fit
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          Monthly prices from the studio list. A bundle discount starts at three. Setup fees are included wherever one exists.
        </p>
        <ul className="mt-6 grid gap-4 md:grid-cols-2">
          {templates.map((item) => (
            <li key={item.id} className="sleek-card rounded-3xl p-6">
              <p className="text-xs uppercase tracking-wide text-accent">{item.category}</p>
              <h3 className="mt-2 font-display text-xl font-semibold text-heading">{item.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{item.summary}</p>
              <p className="mt-3 text-sm font-medium text-foreground">
                KES {item.priceKes.toLocaleString("en-KE")}/mo
                <span className="text-muted"> · about ${item.priceUsd}</span>
                {item.setupFeeKes > 0 && (
                  <span className="text-muted">
                    {" "}
                    · setup KES {item.setupFeeKes.toLocaleString("en-KE")} included
                  </span>
                )}
              </p>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm">
          <Link href="/automations" className="text-accent hover:underline">
            Build a bundle
          </Link>
        </p>
      </section>

      <section className="mt-14" aria-labelledby="fit-heading">
        <h2 id="fit-heading" className="font-display text-2xl font-semibold text-heading">
          Who it is for
        </h2>
        <ul className="mt-4 flex flex-wrap gap-2">
          {page.fit.map((item) => (
            <li key={item} className="rounded-full bg-surface-elevated/80 px-4 py-2 text-sm text-foreground">
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-14" aria-labelledby="faq-heading">
        <h2 id="faq-heading" className="font-display text-2xl font-semibold text-heading">
          Questions
        </h2>
        <div className="mt-4 space-y-3">
          {page.faqs.map((item) => (
            <details key={item.id} className="sleek-card rounded-3xl p-5">
              <summary className="cursor-pointer font-display text-lg font-semibold text-foreground">
                {item.question}
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <nav className="mt-14" aria-label="Related pages">
        <h2 className="font-display text-xl font-semibold text-heading">
          {page.kind === "industry" ? "Other industries" : "Other automation categories"}
        </h2>
        <ul className="mt-4 flex flex-wrap gap-3">
          {others.map((item) => (
            <li key={item.path}>
              <Link href={item.path} className="text-sm text-accent hover:underline">
                {item.eyebrow}
              </Link>
            </li>
          ))}
          <li>
            <Link href={page.kind === "industry" ? "/automations" : "/automation"} className="text-sm text-muted hover:text-accent">
              All automations
            </Link>
          </li>
        </ul>
      </nav>
    </article>
  );
}
