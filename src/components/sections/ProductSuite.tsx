"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { siteConfig } from "@/data/site";
import { ProductVisual } from "@/components/products/ProductVisual";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { LiftCard } from "@/components/ui/LiftCard";
import { ScrollReveal, StaggerChild } from "@/components/ui/ScrollReveal";
import { useFeatures } from "@/providers/FeatureProvider";
import { trackEvent } from "@/lib/analytics";

export function ProductSuite() {
  const { openNewsletter } = useFeatures();

  return (
    <section id="products" className="relative py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <SectionHeading
          label="Products"
          title="Five products"
          description="Built in Nairobi. Most start with a 30-day free trial, no card needed."
        />

        <ScrollReveal stagger className="grid gap-6 md:grid-cols-2">
          {siteConfig.products.map((product) => {
            const isOpen = Boolean(product.liveUrl);
            return (
              <StaggerChild key={product.id} className="h-full">
              <LiftCard className="h-full">
              <article
                className="sleek-card flex h-full flex-col overflow-hidden rounded-3xl bg-surface"
              >
                <ProductVisual product={product} />
                <div className="flex flex-1 flex-col p-6 sm:p-7">
                  <p className="text-xs font-medium uppercase tracking-wide text-accent">
                    {product.statusLabel}
                  </p>
                  <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight text-foreground">
                    {product.name}
                  </h3>
                  <p className="mt-1 text-sm font-medium text-foreground/90">{product.tagline}</p>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{product.description}</p>
                  <ul className="mt-4 space-y-2">
                    {product.features.map((feature) => (
                      <li key={feature} className="flex gap-2 text-sm leading-relaxed text-foreground">
                        <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" aria-hidden />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    {isOpen ? (
                      <a
                        href={product.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() =>
                          trackEvent("product_open_app", { product: product.id, source: "card" })
                        }
                        className="inline-flex h-11 items-center gap-2 rounded-xl bg-accent px-4 text-sm font-semibold text-background hover:bg-accent-hover"
                      >
                        Visit site
                        <ArrowUpRight className="h-4 w-4" aria-hidden />
                      </a>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          trackEvent("product_notify", { product: product.id, source: "card" });
                          openNewsletter();
                        }}
                        className="inline-flex h-11 items-center rounded-xl bg-accent px-4 text-sm font-semibold text-background hover:bg-accent-hover"
                      >
                        Get notified
                      </button>
                    )}
                    <Link
                        href={`/products/${product.id}`}
                        className="inline-flex h-11 items-center rounded-2xl bg-surface-elevated/80 px-4 text-sm font-medium text-foreground"
                      >
                        Details
                      </Link>
                    {product.id === "confirent" || product.id === "cadenceapp" ? (
                      <Link
                        href={`/work/${product.id}`}
                        className="inline-flex h-11 items-center rounded-2xl bg-surface-elevated/80 px-4 text-sm font-medium text-foreground"
                      >
                        Case study
                      </Link>
                    ) : (
                      <a
                        href="#contact"
                        className="inline-flex h-11 items-center rounded-2xl bg-surface-elevated/80 px-4 text-sm font-medium text-foreground"
                      >
                        Contact
                      </a>
                    )}
                  </div>
                </div>
              </article>
              </LiftCard>
              </StaggerChild>
            );
          })}
        </ScrollReveal>
      </div>
    </section>
  );
}
