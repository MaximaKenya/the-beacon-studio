"use client";

import { useCallback, useId, useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { siteConfig, type Product, type ProductStatus } from "@/data/site";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { trackEvent } from "@/lib/analytics";
import { productOpenLinkAttrs } from "@/lib/product-links";
import { ProductLandingPreview } from "@/components/sections/ProductLandingPreview";

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
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const labelId = useId();
  const count = products.length;
  const product = products[index] ?? products[0];

  const go = useCallback(
    (next: number) => {
      if (count === 0) return;
      setIndex(((next % count) + count) % count);
    },
    [count]
  );

  const next = useCallback(() => go(index + 1), [go, index]);
  const prev = useCallback(() => go(index - 1), [go, index]);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const target = event.target;
    if (
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      target instanceof HTMLSelectElement
    ) {
      return;
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      next();
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      prev();
    } else if (event.key === "Home") {
      event.preventDefault();
      go(0);
    } else if (event.key === "End") {
      event.preventDefault();
      go(count - 1);
    }
  };

  if (!product) return null;

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-labelledby={labelId}
      tabIndex={0}
      onKeyDown={onKeyDown}
      className="relative outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      onTouchStart={(event) => {
        touchStartX.current = event.changedTouches[0]?.clientX ?? null;
      }}
      onTouchEnd={(event) => {
        const start = touchStartX.current;
        const end = event.changedTouches[0]?.clientX;
        touchStartX.current = null;
        if (start == null || end == null) return;
        const delta = end - start;
        if (Math.abs(delta) < 48) return;
        if (delta < 0) next();
        else prev();
      }}
    >
      <p id={labelId} className="sr-only">
        Product suite carousel. Use previous and next buttons, dots, or left and right arrow keys.
      </p>
      <p className="sr-only" aria-live="polite">
        {product.name}: {product.tagline}
      </p>

      <div className="overflow-hidden rounded-3xl border border-border/80 bg-surface/30">
        <AnimatePresence mode={reducedMotion ? "sync" : "wait"} initial={false}>
          <motion.div
            key={product.id}
            initial={reducedMotion ? false : { opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reducedMotion ? undefined : { opacity: 0, x: -24 }}
            transition={
              reducedMotion
                ? { duration: 0 }
                : { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const }
            }
            className="grid gap-0 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]"
          >
            <div className="p-4 sm:p-5 lg:p-6">
              <ProductLandingPreview product={product} />
            </div>

            <div className="flex flex-col border-t border-border/70 p-5 sm:p-6 lg:border-l lg:border-t-0 lg:p-8">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-2xl border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider ${statusClass[product.status]}`}
                >
                  {statusLabel[product.status]}
                </span>
                <span className="rounded-2xl border border-border/70 bg-background/40 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-muted">
                  {index + 1} / {count}
                </span>
              </div>

              <h3 className="mt-4 font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                {product.name}
              </h3>
              <p className="mt-2 text-sm font-medium text-foreground sm:text-base">
                {product.tagline}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted">{product.description}</p>

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

              <div className="mt-auto flex flex-wrap items-center gap-3 pt-6">
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
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 pb-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={prev}
            aria-label="Previous product"
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-surface/60 text-foreground hover:border-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Next product"
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-surface/60 text-foreground hover:border-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <ChevronRight className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-1.5" role="tablist" aria-label="Products">
          {products.map((item, i) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Show ${item.name}`}
              onClick={() => go(i)}
              className={`h-2.5 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                i === index ? "w-7 bg-accent" : "w-2.5 bg-border hover:bg-muted"
              }`}
            />
          ))}
        </div>
      </div>

      <ul className="mt-4 flex flex-wrap gap-2" aria-label="Jump to product">
        {products.map((item, i) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => go(i)}
              aria-current={i === index ? "true" : undefined}
              className={`rounded-2xl border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                i === index
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
