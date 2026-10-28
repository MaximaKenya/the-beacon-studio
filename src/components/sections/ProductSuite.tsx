"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { siteConfig, type Product } from "@/data/site";
import { ProductVisual } from "@/components/products/ProductVisual";
import { ShotCarousel } from "@/components/gallery/ShotCarousel";
import { DeviceToggle, filterByDevice, type DeviceFilter } from "@/components/gallery/DeviceToggle";
import { shotsFor } from "@/data/product-shots";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { LiftCard } from "@/components/ui/LiftCard";
import { ScrollReveal, StaggerChild } from "@/components/ui/ScrollReveal";
import { useFeatures } from "@/providers/FeatureProvider";
import { trackEvent } from "@/lib/analytics";

/** Products with a public case study. */
const CASE_STUDIES = new Set(["confirent", "cadenceapp"]);
const FEATURED = "convoria";
const COUNT_WORDS = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight"];

/**
 * All five products in one section (replaces the old "Two products, in the open" work strip).
 * Two per row; when the count is odd the last card spans the row and lays out horizontally.
 */
export function ProductSuite() {
  const products = siteConfig.products;
  const loneLast = products.length % 2 === 1;

  return (
    <section id="products" className="relative scroll-mt-24 py-16 lg:py-24">
      {/* Old #work links land here too. */}
      <span id="work" className="block scroll-mt-24" aria-hidden />
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <SectionHeading
          label="Products"
          title={`${COUNT_WORDS[products.length] ?? products.length} products, in the open`}
          description="Built in Nairobi and live today. Real screens below. Most start with a 30-day free trial, no card needed."
        />

        <ScrollReveal stagger className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {products.map((product, i) => {
            const wide = loneLast && i === products.length - 1;
            return (
              <StaggerChild key={product.id} className={`h-full min-w-0 ${wide ? "md:col-span-2" : ""}`}>
                <LiftCard className="h-full">
                  <ProductCard product={product} wide={wide} />
                </LiftCard>
              </StaggerChild>
            );
          })}
        </ScrollReveal>
      </div>
    </section>
  );
}

function ProductCard({ product, wide }: { product: Product; wide: boolean }) {
  const { openNewsletter } = useFeatures();
  const [device, setDevice] = useState<DeviceFilter>("all");
  const all = useMemo(() => shotsFor(product.id), [product.id]);
  const shots = useMemo(() => filterByDevice(all, device).slice(0, 6), [all, device]);
  const isOpen = Boolean(product.liveUrl);
  const featured = product.id === FEATURED;

  return (
    <article
      className={`sleek-card ps-card flex h-full overflow-hidden rounded-3xl bg-surface ${
        wide ? "flex-col md:flex-row" : "flex-col"
      } ${featured ? "ps-featured" : ""}`}
    >
      <div className={`ps-media ${wide ? "md:w-[54%] md:shrink-0" : ""}`}>
        {all.length > 0 ? (
          <>
            <div className="ps-toggle">
              <DeviceToggle size="sm" value={device} shots={all} onChange={setDevice} label={`${product.name} screens`} />
            </div>
            <ShotCarousel key={device} shots={shots} name={product.name} compact autoplayMs={5000} />
          </>
        ) : (
          <ProductVisual product={product} />
        )}
      </div>
      <div className={`flex flex-1 flex-col p-6 sm:p-7 ${wide ? "md:justify-center md:p-9" : ""}`}>
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs font-medium uppercase tracking-wide text-accent">{product.statusLabel}</p>
          {featured ? (
            <span className="ps-badge">
              <Sparkles className="h-3 w-3" aria-hidden />
              Featured
            </span>
          ) : null}
        </div>
        <h3 className="text-heading mt-2 font-display text-2xl font-semibold tracking-tight">{product.name}</h3>
        <p className="mt-1 text-sm font-medium text-foreground/90">{product.tagline}</p>
        <p className="mt-3 text-sm leading-relaxed text-muted">{product.description}</p>
        <ul className={`mt-4 gap-2 ${wide ? "grid lg:grid-cols-2 lg:gap-x-6" : "space-y-2"}`}>
          {product.features.map((feature) => (
            <li key={feature} className="flex gap-2 text-sm leading-relaxed text-foreground">
              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" aria-hidden />
              {feature}
            </li>
          ))}
        </ul>

        <div className="mt-6 flex flex-wrap items-center gap-2.5">
          {isOpen ? (
            <a
              href={product.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent("product_open_app", { product: product.id, source: "card" })}
              className="price-btn price-btn-primary"
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
              className="price-btn price-btn-primary"
            >
              Get notified
            </button>
          )}
          <Link href={`/products/${product.id}`} className="price-btn price-btn-secondary">
            Details
          </Link>
          {CASE_STUDIES.has(product.id) ? (
            <Link href={`/work/${product.id}`} className="price-btn price-btn-secondary">
              Case study
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  );
}
