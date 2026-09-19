"use client";

import { useId, useState } from "react";
import { ArrowUpRight, Pause, Play } from "lucide-react";
import { siteConfig, type Product, type ProductStatus } from "@/data/site";
import { productScreenRowA, productScreenRowB } from "@/data/product-screens";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { trackEvent } from "@/lib/analytics";
import { productOpenLinkAttrs } from "@/lib/product-links";
import { ProductScreenStrip } from "@/components/sections/ProductScreenStrip";

const statusLabel: Record<ProductStatus, string> = {
  live: "Live",
  beta: "Beta",
  "coming-soon": "Coming Soon",
};

const statusClass: Record<ProductStatus, string> = {
  live: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
  beta: "border-accent/40 bg-accent/10 text-accent",
  "coming-soon": "border-accent-amber/40 bg-accent-amber/10 text-accent-amber",
};

function OpenProductLink({ product, source }: { product: Product; source: string }) {
  const { href, target, rel } = productOpenLinkAttrs(product);
  return (
    <a
      href={href}
      target={target}
      rel={rel}
      onClick={() =>
        trackEvent("product_click", { product: product.id, source, dest: href })
      }
      className="inline-flex h-11 items-center gap-2 rounded-2xl bg-accent px-5 text-sm font-semibold text-background hover:bg-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      Open {product.name}
      <ArrowUpRight className="h-4 w-4" aria-hidden />
    </a>
  );
}

export function ProductCarousel() {
  const products = siteConfig.products;
  const reducedMotion = useReducedMotion();
  const labelId = useId();
  const [focusedId, setFocusedId] = useState(products[0]?.id ?? "lookfinesse");
  const [paused, setPaused] = useState(false);
  const product = products.find((p) => p.id === focusedId) ?? products[0];

  if (!product) return null;

  return (
    <div
      role="region"
      aria-labelledby={labelId}
      className="relative"
    >
      <p id={labelId} className="sr-only">
        Product suite screenshots. Hover or focus a frame to read what it does.
        Open links visit the live site, GitHub, or product page in a new tab.
      </p>
      <p className="sr-only" aria-live="polite">
        {product.name}: {product.tagline}
      </p>

      {!reducedMotion && (
        <div className="mb-4 flex justify-end">
          <button
            type="button"
            aria-pressed={paused}
            onClick={() => setPaused((value) => !value)}
            className="inline-flex h-10 items-center gap-2 rounded-2xl border border-border/80 bg-surface/60 px-3.5 text-xs font-medium text-muted hover:border-accent/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            {paused ? (
              <Play className="h-3.5 w-3.5" aria-hidden />
            ) : (
              <Pause className="h-3.5 w-3.5" aria-hidden />
            )}
            {paused ? "Play strip" : "Pause strip"}
          </button>
        </div>
      )}

      <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
          <ProductScreenStrip
            rowA={productScreenRowA}
            rowB={productScreenRowB}
            paused={paused}
            reducedMotion={reducedMotion}
            onActivate={setFocusedId}
          />
        </div>
      </div>

      <div className="mt-8 overflow-hidden rounded-3xl border border-border/80 bg-surface/30 p-5 sm:p-6 lg:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-2xl border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider ${statusClass[product.status]}`}
          >
            {statusLabel[product.status]}
          </span>
          {product.liveUrl ? (
            <span className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-emerald-400">
              Public URL
            </span>
          ) : null}
        </div>

        <h3 className="mt-4 font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {product.name}
        </h3>
        <p className="mt-2 text-sm font-medium text-foreground sm:text-base">{product.tagline}</p>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted">{product.description}</p>

        <ul className="mt-5 flex flex-wrap gap-2" aria-label={`${product.name} tags`}>
          {product.tags.map((tag) => (
            <li
              key={tag}
              className="rounded-2xl border border-border/70 bg-background/40 px-2.5 py-1 font-mono text-[11px] text-muted"
            >
              {tag}
            </li>
          ))}
        </ul>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <OpenProductLink product={product} source="suite_carousel" />
          <a
            href={`/products/${product.id}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              trackEvent("product_click", {
                product: product.id,
                source: "suite_carousel_details",
              })
            }
            className="inline-flex h-11 items-center rounded-2xl border border-border bg-background/40 px-4 text-sm font-medium text-foreground hover:border-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Product page
          </a>
        </div>
      </div>

      <ul className="mt-4 flex flex-wrap gap-2" aria-label="Focus a product">
        {products.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => setFocusedId(item.id)}
              aria-current={item.id === product.id ? "true" : undefined}
              className={`rounded-2xl border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                item.id === product.id
                  ? "border-accent/50 bg-accent/10 text-foreground"
                  : "border-border/70 bg-background/30 text-muted hover:text-foreground"
              }`}
            >
              {item.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
