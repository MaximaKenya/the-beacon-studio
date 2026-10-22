"use client";

import { Bell, Calendar, Mail } from "lucide-react";
import type { Product } from "@/data/site";
import { useFeatures } from "@/providers/FeatureProvider";
import { trackEvent } from "@/lib/analytics";
import { mailtoHref, trackEmailClick } from "@/lib/contact-actions";

/**
 * Sticky CTA bar on product detail pages — request access / book / email.
 */
export function StickyProductCTA({ product }: { product: Product }) {
  const { openNewsletter, openBooking } = useFeatures();
  const isOpen = Boolean(product.liveUrl);

  return (
    <div
      data-cta=""
      data-cta-fixed=""
      className="fixed inset-x-0 bottom-0 z-[140] bg-background/90 px-4 py-3 backdrop-blur-xl supports-[backdrop-filter]:bg-background/75"
    >
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-display text-sm font-semibold text-foreground">
            {product.name}
          </p>
          <p className="truncate text-xs text-muted">{product.tagline}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {isOpen ? (
            <a
              href={product.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                trackEvent("product_open_app", { product: product.id, source: "sticky" })
              }
              className="inline-flex h-10 items-center gap-1.5 whitespace-nowrap rounded-xl bg-accent px-4 text-sm font-semibold text-background hover:bg-accent-hover"
            >
              Visit site
            </a>
          ) : (
            <button
              type="button"
              onClick={() => {
                trackEvent("product_notify", { product: product.id, source: "sticky" });
                openNewsletter();
              }}
              className="inline-flex h-10 items-center gap-1.5 whitespace-nowrap rounded-xl bg-accent px-4 text-sm font-semibold text-background hover:bg-accent-hover"
            >
              <Bell className="h-3.5 w-3.5" aria-hidden />
              Get notified
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              trackEvent("cta_click", { type: "book", product: product.id, source: "sticky" });
              openBooking();
            }}
            className="inline-flex h-10 items-center gap-1.5 whitespace-nowrap rounded-xl border border-border bg-surface px-3 text-sm font-medium text-foreground hover:border-accent/40"
          >
            <Calendar className="h-3.5 w-3.5 text-accent" aria-hidden />
            Book
          </button>
          <a
            href={mailtoHref(`${product.name} inquiry`)}
            onClick={() => trackEmailClick(`product_sticky_${product.id}`)}
            className="inline-flex h-10 items-center gap-1.5 whitespace-nowrap rounded-xl border border-border bg-surface px-3 text-sm font-medium text-foreground hover:border-accent/40"
          >
            <Mail className="h-3.5 w-3.5 text-accent" aria-hidden />
            Email
          </a>
        </div>
      </div>
    </div>
  );
}
