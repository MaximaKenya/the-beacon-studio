"use client";

import Link from "next/link";
import { Bell, ExternalLink, ArrowLeft, Calendar, Mail } from "lucide-react";
import type { Product } from "@/data/site";
import { useFeatures } from "@/providers/FeatureProvider";
import { trackEvent } from "@/lib/analytics";
import { AskGlowPrompt } from "@/components/features/AskGlowPrompt";
import { StickyProductCTA } from "@/components/features/StickyProductCTA";
import { ProductVisual } from "@/components/products/ProductVisual";
import { mailtoHref, trackEmailClick } from "@/lib/contact-actions";
import { getProductCopy } from "@/data/product-copy";
import { ProductCopySections } from "@/components/products/ProductCopySections";
import { DeviceTour } from "@/components/gallery/DeviceTour";
import { Tilt } from "@/components/gallery/Tilt";
import { shotsFor, tourShots } from "@/data/product-shots";

export function ProductDetail({
  product,
  related,
}: {
  product: Product;
  related: Product[];
  stack?: unknown;
}) {
  const { openBooking, openNewsletter, openChat } = useFeatures();
  const isOpen = Boolean(product.liveUrl);
  const copy = getProductCopy(product.id);
  const shots = shotsFor(product.id);
  const tour = tourShots(product.id);

  return (
    <div className="relative px-6 pb-[calc(7rem+env(safe-area-inset-bottom))] pt-28 lg:px-8 lg:pt-32">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/#products"
          className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-accent"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          All products
        </Link>

        <div className="mt-8 grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-accent">
              {product.statusLabel}
            </p>
            <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              {product.name}
            </h1>
            <p className="mt-3 text-lg text-foreground/90">{copy?.headline ?? product.tagline}</p>
            {copy ? <p className="mt-2 text-base font-medium text-accent">{copy.promise}</p> : null}
            <p className="mt-6 text-base leading-relaxed text-muted">{product.description}</p>

            <h2 className="mt-10 font-display text-lg font-semibold text-foreground">Who it&apos;s for</h2>
            {copy ? (
              <ul className="mt-3 flex flex-wrap gap-2">
                {copy.audiences.map((a) => (
                  <li key={a} className="rounded-full bg-surface-elevated/80 px-3 py-1 text-xs font-medium text-foreground">
                    {a}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm leading-relaxed text-muted">{product.audience}</p>
            )}
            {copy?.trial ? (
              <p className="sleek-card mt-6 rounded-2xl bg-surface px-5 py-4 text-sm leading-relaxed text-foreground">
                {copy.trial}
              </p>
            ) : null}
            {copy?.disclaimer ? (
              <p role="note" className="sleek-card mt-6 rounded-2xl bg-surface px-5 py-4 text-sm font-medium leading-relaxed text-foreground">
                {copy.disclaimer}
              </p>
            ) : null}

            {!isOpen && (
              <p className="mt-6 rounded-2xl border border-border bg-surface px-5 py-4 text-sm leading-relaxed text-muted">
                {product.name} is not open to the public. Ask us to notify you, or send a message.
              </p>
            )}

            <h2 className="mt-10 font-display text-lg font-semibold text-foreground">Key features</h2>
            <ul className="mt-4 space-y-2">
              {(product.keyFeatures ?? product.features).map((feature) => (
                <li key={feature} className="flex gap-2 text-sm leading-relaxed text-foreground">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" aria-hidden />
                  {feature}
                </li>
              ))}
            </ul>

            {product.pricing ? (
              <>
                <h2 className="mt-10 font-display text-lg font-semibold text-foreground">Pricing</h2>
                <p className="mt-3 text-sm leading-relaxed text-foreground">{product.pricing}</p>
              </>
            ) : null}

            <div className="mt-10 flex flex-wrap gap-3">
              {isOpen ? (
                <a
                  href={product.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() =>
                    trackEvent("product_open_app", { product: product.id, source: "detail" })
                  }
                  className="inline-flex h-12 items-center gap-2 rounded-xl bg-accent px-6 text-sm font-semibold text-background hover:bg-accent-hover"
                >
                  {copy?.ctaLabel ?? "Visit site"}
                  <ExternalLink className="h-4 w-4" aria-hidden />
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    trackEvent("product_notify", { product: product.id, source: "detail" });
                    openNewsletter();
                  }}
                  className="inline-flex h-12 items-center gap-2 rounded-xl bg-accent px-6 text-sm font-semibold text-background hover:bg-accent-hover"
                >
                  <Bell className="h-4 w-4" aria-hidden />
                  Get notified
                </button>
              )}

              <Link
                href="/#contact"
                className="inline-flex h-12 items-center rounded-xl border border-border bg-surface px-5 text-sm font-semibold text-foreground hover:border-accent/40"
              >
                Contact
              </Link>

              <button
                type="button"
                onClick={() => {
                  trackEvent("cta_click", { type: "book", product: product.id });
                  openBooking();
                }}
                className="inline-flex h-12 items-center gap-2 rounded-xl border border-border bg-surface px-5 text-sm font-semibold text-foreground hover:border-accent/40"
              >
                <Calendar className="h-4 w-4 text-accent" aria-hidden />
                Book a demo
              </button>

              <a
                href={mailtoHref(`${product.name} inquiry`)}
                onClick={() => trackEmailClick(`product_${product.id}`)}
                className="inline-flex h-12 items-center gap-2 rounded-xl border border-border bg-surface px-5 text-sm font-semibold text-foreground hover:border-accent/40"
              >
                <Mail className="h-4 w-4 text-accent" aria-hidden />
                Email
              </a>

            </div>
          </div>

          <div className="space-y-6">
            {shots.length > 0 ? (
              <Tilt>
                <DeviceTour name={product.name} desktop={tour.desktop} mobile={tour.mobile} />
              </Tilt>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-border">
                <ProductVisual product={product} frameClassName="aspect-[4/5] sm:aspect-[16/11]" />
              </div>
            )}
            <AskGlowPrompt
              productName={product.name}
              onAsk={(q) => {
                trackEvent("glow_prompt", { product: product.id });
                openChat(q);
              }}
            />
          </div>
        </div>

        {copy ? <ProductCopySections name={product.name} copy={copy} shots={shots} /> : null}

        {related.length > 0 && (
          <div className="mt-20 border-t border-border/70 pt-12">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">Other products</p>
            <ul className="mt-5 grid gap-4 sm:grid-cols-3">
              {related.map((item) => (
                <li key={item.id}>
                  <Link
                    href={`/products/${item.id}`}
                    className="block rounded-xl border border-border bg-surface/30 p-5 transition-colors hover:border-accent/40"
                  >
                    <p className="text-xs text-accent">{item.statusLabel}</p>
                    <p className="mt-1 font-display text-base font-semibold text-foreground">{item.name}</p>
                    <p className="mt-1 text-sm text-muted">{item.tagline}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <StickyProductCTA product={product} />
    </div>
  );
}
