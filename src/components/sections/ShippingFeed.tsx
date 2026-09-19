"use client";

import Link from "next/link";
import { siteConfig } from "@/data/site";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

const tagStyles = {
  shipped: "border-emerald-500/35 bg-emerald-500/10 text-emerald-400",
  improved: "border-accent/35 bg-accent/10 text-accent",
  studio: "border-border bg-surface text-muted",
} as const;

/**
 * Recently shipped timeline — driven by siteConfig.changelog.
 */
export function ShippingFeed() {
  const entries = siteConfig.changelog;

  return (
    <section id="shipped" className="relative py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <ScrollReveal>
          <SectionHeading
            label="Changelog"
            title="Recently shipped"
            description="What the studio has been building. Add entries in site.ts as you release."
          />
        </ScrollReveal>

        <ol className="relative mt-12 space-y-0 border-l border-border/80 pl-6 sm:pl-8">
          {entries.map((entry) => {
            const product = entry.productId
              ? siteConfig.products.find((p) => p.id === entry.productId)
              : undefined;

            return (
              <li key={entry.id} className="relative pb-10 last:pb-0">
                <span
                  className="absolute -left-[1.9rem] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-background bg-accent sm:-left-[2.15rem]"
                  aria-hidden
                />
                <div className="flex flex-wrap items-center gap-2">
                  <time className="font-mono text-[11px] uppercase tracking-wider text-muted">
                    {entry.date}
                  </time>
                  <span
                    className={`rounded border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${tagStyles[entry.tag]}`}
                  >
                    {entry.tag}
                  </span>
                </div>
                <h3 className="mt-2 font-display text-lg font-semibold text-foreground">
                  {entry.title}
                </h3>
                <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted">
                  {entry.summary}
                </p>
                {product && (
                  <Link
                    href={`/products/${product.id}`}
                    className="mt-2 inline-block text-sm font-medium text-accent transition-colors hover:text-accent-hover"
                  >
                    View {product.name}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
