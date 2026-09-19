"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Bell, ExternalLink, Github, X } from "lucide-react";
import { siteConfig, type Product, type ProductStatus } from "@/data/site";
import { useFeatures } from "@/providers/FeatureProvider";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { trackEvent } from "@/lib/analytics";

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

export function ProductDrawer() {
  const {
    productDrawerOpen,
    selectedProductId,
    closeProductDrawer,
    openIntake,
    openNewsletter,
  } = useFeatures();
  const trapRef = useFocusTrap(productDrawerOpen);

  const product: Product | undefined = siteConfig.products.find(
    (p) => p.id === selectedProductId
  );

  useEffect(() => {
    if (!productDrawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeProductDrawer();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [productDrawerOpen, closeProductDrawer]);

  if (!productDrawerOpen || !product) return null;

  const notifyMailto = `mailto:${siteConfig.email}?subject=${encodeURIComponent(
    `Notify me — ${product.name}`
  )}&body=${encodeURIComponent(
    `Hi Beacon,\n\nPlease notify me when ${product.name} is available.\n\nThanks!`
  )}`;

  return (
    <div
      className="fixed inset-0 z-[180] flex justify-end bg-background/55 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-drawer-title"
      onClick={closeProductDrawer}
    >
      <div
        ref={trapRef}
        className="glass-panel flex h-full w-full max-w-md flex-col border-l border-border/80 shadow-2xl shadow-black/30"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border/60 px-6 py-5">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
              Product
            </p>
            <h2
              id="product-drawer-title"
              className="mt-1 font-display text-2xl font-bold tracking-tight text-foreground"
            >
              {product.name}
            </h2>
          </div>
          <button
            type="button"
            onClick={closeProductDrawer}
            className="rounded-lg p-2 text-muted transition-colors hover:bg-surface hover:text-foreground"
            aria-label="Close product details"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <span
              className={`rounded-md border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider ${statusClass[product.status]}`}
            >
              {statusLabel[product.status]}
            </span>
            <span className="rounded-md border border-border/70 bg-background/40 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-muted">
              {product.operationalStatus}
            </span>
          </div>

          <p className="font-display text-lg font-medium text-foreground">
            {product.tagline}
          </p>
          <p className="mt-4 text-sm leading-relaxed text-muted lg:text-base">
            {product.longDescription ?? product.description}
          </p>

          <ul className="mt-6 flex flex-wrap gap-2" aria-label="Tags">
            {product.tags.map((tag) => (
              <li
                key={tag}
                className="rounded-md border border-border/70 bg-surface/60 px-2.5 py-1 font-mono text-[11px] text-muted"
              >
                {tag}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3 border-t border-border/60 px-6 py-5">
          <Link
            href={`/products/${product.id}`}
            onClick={() => {
              trackEvent("product_click", { product: product.id, source: "drawer" });
              closeProductDrawer();
            }}
            className="inline-flex h-12 w-full items-center justify-center rounded-xl border border-border bg-surface/50 text-sm font-semibold text-foreground transition-all hover:border-accent/40"
          >
            Full product page
          </Link>
          {product.liveUrl ? (
            <a
              href={product.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                trackEvent("product_open_app", { product: product.id })
              }
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-accent text-sm font-semibold text-background shadow-lg shadow-accent/20 transition-all hover:bg-accent-hover"
            >
              Open app
              <ExternalLink className="h-4 w-4" aria-hidden />
            </a>
          ) : (
            <MagneticButton
              onClick={() => {
                trackEvent("product_request_access", { product: product.id });
                closeProductDrawer();
                openIntake();
              }}
              className="inline-flex h-12 w-full cursor-pointer items-center justify-center rounded-xl bg-accent text-sm font-semibold text-background shadow-lg shadow-accent/20 transition-all hover:bg-accent-hover"
            >
              Request access
            </MagneticButton>
          )}

          <div className="flex gap-3">
            <a
              href={notifyMailto}
              onClick={() => {
                trackEvent("product_notify", { product: product.id });
                if (siteConfig.newsletter.enabled) {
                  openNewsletter();
                }
              }}
              className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-surface/50 text-sm font-medium text-foreground transition-all hover:border-accent/40"
            >
              <Bell className="h-4 w-4 text-accent" aria-hidden />
              Notify me
            </a>
            {product.githubUrl ? (
              <a
                href={product.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  trackEvent("product_github", { product: product.id })
                }
                className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-surface/50 text-sm font-medium text-muted transition-all hover:border-accent/40 hover:text-foreground"
              >
                <Github className="h-4 w-4" aria-hidden />
                GitHub
              </a>
            ) : product.docsUrl ? (
              <a
                href={product.docsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 flex-1 items-center justify-center rounded-xl border border-border bg-surface/50 text-sm font-medium text-muted transition-all hover:border-accent/40 hover:text-foreground"
              >
                Docs
              </a>
            ) : null}
          </div>
          {product.githubUrl && product.docsUrl ? (
            <a
              href={product.docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-border bg-surface/50 text-sm font-medium text-muted transition-all hover:border-accent/40 hover:text-foreground"
            >
              Docs
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}
