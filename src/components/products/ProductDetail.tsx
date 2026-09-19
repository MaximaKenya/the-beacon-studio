"use client";

import Link from "next/link";
import Image from "next/image";
import { Bell, ExternalLink, Github, ArrowLeft, Calendar, Mail, Phone } from "lucide-react";
import {
  siteConfig,
  type Product,
  type ProductStatus,
  type TechStackItem,
} from "@/data/site";
import { useFeatures } from "@/providers/FeatureProvider";
import { trackEvent } from "@/lib/analytics";
import { AskGlowPrompt } from "@/components/features/AskGlowPrompt";
import { StickyProductCTA } from "@/components/features/StickyProductCTA";
import { screensForProduct } from "@/data/product-screens";
import { mailtoHref, phoneHref, trackCallClick, trackEmailClick } from "@/lib/contact-actions";

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

export function ProductDetail({
  product,
  related,
  stack,
}: {
  product: Product;
  related: Product[];
  stack: TechStackItem[];
}) {
  const { openIntake, openBooking, openNewsletter, openChat } = useFeatures();
  const isLive = Boolean(product.liveUrl);
  const isComingSoon = product.status === "coming-soon" || !isLive;
  const shots = screensForProduct(product.id).filter((s) => s.src);

  return (
    <div className="relative px-6 pb-28 pt-28 lg:px-8 lg:pt-32">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/#products"
          className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-accent"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to suite
        </Link>

        <div className="mt-8 grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
          <div>
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <span
                className={`rounded-md border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider ${statusClass[product.status]}`}
              >
                {statusLabel[product.status]}
              </span>
              <span className="rounded-md border border-border/70 bg-surface/40 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-muted">
                {product.operationalStatus}
              </span>
            </div>

            <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              {product.name}
            </h1>
            <p className="mt-3 text-xl font-medium text-foreground/90">{product.tagline}</p>
            <p className="mt-6 text-base leading-relaxed text-muted lg:text-lg">
              {product.longDescription ?? product.description}
            </p>

            {isComingSoon && (
              <div className="mt-8 rounded-2xl border border-accent-amber/30 bg-accent-amber/5 px-5 py-4">
                <p className="font-display text-base font-semibold text-foreground">
                  {product.status === "coming-soon" ? "Coming soon" : "Private beta"}
                </p>
                <p className="mt-1 text-sm text-muted">
                  {product.name} isn&apos;t publicly live yet. Request access, subscribe for
                  launch notes, or book a call to talk about custom builds alongside the suite.
                </p>
              </div>
            )}

            <ul className="mt-8 flex flex-wrap gap-2" aria-label="Tags">
              {product.tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-md border border-border/70 bg-surface/60 px-3 py-1.5 font-mono text-[11px] text-muted"
                >
                  {tag}
                </li>
              ))}
            </ul>

            {stack.length > 0 && (
              <div className="mt-10">
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted">Stack</p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {stack.map((t) => (
                    <li
                      key={t.id}
                      className="rounded-lg border border-border bg-background/50 px-3 py-1.5 text-sm text-foreground"
                    >
                      {t.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-10 flex flex-wrap gap-3">
              {isLive ? (
                <a
                  href={product.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() =>
                    trackEvent("product_open_app", { product: product.id, source: "detail" })
                  }
                  className="inline-flex h-12 items-center gap-2 rounded-xl bg-accent px-6 text-sm font-semibold text-background hover:bg-accent-hover"
                >
                  Open live app
                  <ExternalLink className="h-4 w-4" aria-hidden />
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    trackEvent("product_request_access", { product: product.id });
                    openIntake();
                  }}
                  className="inline-flex h-12 items-center rounded-xl bg-accent px-6 text-sm font-semibold text-background hover:bg-accent-hover"
                >
                  Request access
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  trackEvent("product_notify", { product: product.id });
                  if (siteConfig.newsletter.enabled) openNewsletter();
                }}
                className="inline-flex h-12 items-center gap-2 rounded-xl border border-border bg-surface px-5 text-sm font-semibold text-foreground hover:border-accent/40"
              >
                <Bell className="h-4 w-4 text-accent" aria-hidden />
                Notify me
              </button>

              <button
                type="button"
                onClick={() => {
                  trackEvent("cta_click", { type: "book", product: product.id });
                  openBooking();
                }}
                className="inline-flex h-12 items-center gap-2 rounded-xl border border-border bg-surface px-5 text-sm font-semibold text-foreground hover:border-accent/40"
              >
                <Calendar className="h-4 w-4 text-accent" aria-hidden />
                Book a call
              </button>

              <a
                href={phoneHref()}
                onClick={() => trackCallClick(`product_${product.id}`)}
                className="inline-flex h-12 items-center gap-2 rounded-xl border border-border bg-surface px-5 text-sm font-semibold text-foreground hover:border-accent/40"
              >
                <Phone className="h-4 w-4 text-accent" aria-hidden />
                Call
              </a>

              <a
                href={mailtoHref(`${product.name} inquiry`)}
                onClick={() => trackEmailClick(`product_${product.id}`)}
                className="inline-flex h-12 items-center gap-2 rounded-xl border border-border bg-surface px-5 text-sm font-semibold text-foreground hover:border-accent/40"
              >
                <Mail className="h-4 w-4 text-accent" aria-hidden />
                Email
              </a>

              {product.githubUrl && (
                <a
                  href={product.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent("product_github", { product: product.id })}
                  className="inline-flex h-12 items-center gap-2 rounded-xl border border-border bg-surface px-5 text-sm font-medium text-muted hover:border-accent/40 hover:text-foreground"
                >
                  <Github className="h-4 w-4" aria-hidden />
                  GitHub
                </a>
              )}
            </div>
          </div>

          <div className="space-y-6">
            {shots.length > 0 ? (
              <div className="space-y-4">
                {shots.map((shot) => (
                  <div
                    key={shot.id}
                    className="overflow-hidden rounded-2xl border border-border bg-surface/40"
                  >
                    <Image
                      src={shot.src!}
                      alt={shot.alt}
                      width={1440}
                      height={900}
                      className="h-auto w-full object-cover object-top"
                      priority={shot === shots[0]}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-border bg-surface/40 p-6">
                <Image
                  src={product.image}
                  alt={product.name}
                  width={800}
                  height={500}
                  className="mx-auto h-auto max-h-64 w-full object-contain"
                  priority
                />
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

        {related.length > 0 && (
          <div className="mt-20 border-t border-border/70 pt-12">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
              Related products
            </p>
            <ul className="mt-5 grid gap-4 sm:grid-cols-3">
              {related.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/products/${p.id}`}
                    onClick={() =>
                      trackEvent("product_click", {
                        product: p.id,
                        source: "related",
                      })
                    }
                    className="block rounded-xl border border-border bg-surface/30 p-5 transition-colors hover:border-accent/40"
                  >
                    <p className="font-display text-base font-semibold text-foreground">{p.name}</p>
                    <p className="mt-1 text-sm text-muted">{p.tagline}</p>
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
