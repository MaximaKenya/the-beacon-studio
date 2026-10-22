import Image from "next/image";
import Link from "next/link";
import { productForStudy, type WorkStudy } from "@/data/work";
import { BreadcrumbJsonLd } from "@/components/seo/BreadcrumbJsonLd";
import { JsonLd } from "@/components/seo/OrganizationJsonLd";
import { absoluteUrl } from "@/lib/seo";
import { siteConfig } from "@/data/site";

export function CaseStudyView({ study }: { study: WorkStudy }) {
  const product = productForStudy(study);
  const features = product?.keyFeatures ?? product?.features ?? [];

  return (
    <article className="mx-auto max-w-6xl px-6 pb-24 pt-28 lg:px-8">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: study.title, path: study.path },
        ]}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: study.title,
          description: study.description,
          url: absoluteUrl(study.path),
          author: { "@type": "Organization", name: siteConfig.brand.name },
          about: product?.name,
        }}
      />
      <p className="text-sm font-medium text-accent">{product?.statusLabel ?? "Work"} · Nairobi</p>
      <h1 className="mt-3 max-w-3xl font-display text-4xl font-semibold tracking-tight text-heading sm:text-5xl">
        {study.title}
      </h1>
      <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">{study.description}</p>
      <div className="mt-8 flex flex-wrap gap-3">
        {product?.liveUrl && (
          <a
            href={product.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 items-center rounded-2xl bg-accent px-5 text-sm font-semibold text-background"
          >
            Visit {study.title}
          </a>
        )}
        <Link
          href="/book"
          className="inline-flex h-12 items-center rounded-2xl bg-surface-elevated px-5 text-sm font-semibold text-foreground"
        >
          Book a free audit
        </Link>
      </div>

      <div className="mt-12 grid gap-4">
        {study.shots.map((shot) => (
          <figure key={shot.src} className="sleek-card overflow-hidden rounded-3xl">
            <Image
              src={shot.src}
              alt={shot.alt}
              width={shot.width}
              height={shot.height}
              sizes="(min-width: 1024px) 1100px, 100vw"
              className="h-auto w-full"
            />
          </figure>
        ))}
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        <section className="sleek-card rounded-3xl p-6 sm:p-8">
          <h2 className="font-display text-2xl font-semibold text-heading">Problem</h2>
          <p className="mt-3 text-sm leading-relaxed text-foreground">{study.problem}</p>
        </section>
        <section className="sleek-card rounded-3xl p-6 sm:p-8">
          <h2 className="font-display text-2xl font-semibold text-heading">Solution</h2>
          <p className="mt-3 text-sm leading-relaxed text-foreground">{study.solution}</p>
        </section>
      </div>

      <section className="mt-10" aria-labelledby="features-heading">
        <h2 id="features-heading" className="font-display text-2xl font-semibold text-heading">
          Features
        </h2>
        <ul className="mt-4 grid gap-3 md:grid-cols-2">
          {features.map((feature) => (
            <li key={feature} className="sleek-card rounded-3xl p-5 text-sm leading-relaxed text-foreground">
              {feature}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10" aria-labelledby="stack-heading">
        <h2 id="stack-heading" className="font-display text-2xl font-semibold text-heading">
          Stack
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">{study.stackNote}</p>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {study.stack.map((item) => (
            <li key={item} className="sleek-card rounded-3xl p-5 text-sm leading-relaxed text-foreground">
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="sleek-card mt-10 rounded-3xl p-6 sm:p-8" aria-labelledby="results-heading">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Placeholder</p>
        <h2 id="results-heading" className="mt-2 font-display text-2xl font-semibold text-heading">
          Results
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">{study.resultsNote}</p>
      </section>

      {product?.pricing && (
        <p className="mt-8 max-w-2xl text-sm leading-relaxed text-muted">Pricing on the product: {product.pricing}</p>
      )}
    </article>
  );
}
