import Image from "next/image";
import type { Product } from "@/data/site";
import {
  productChromeLabel,
  type ProductScreen,
} from "@/data/product-screens";
import { ProductPlaceholderPanel } from "@/components/sections/ProductPlaceholderPanel";
import { productOpenLinkAttrs } from "@/lib/product-links";
import { trackEvent } from "@/lib/analytics";

type ProductScreenCardProps = {
  screen: ProductScreen;
  product: Product;
  source: string;
  /** Duplicate marquee copy — hide from AT and skip tab order. */
  inertCopy?: boolean;
  /** Stretch to the parent width (static reduced-motion grid). */
  fluid?: boolean;
  onActivate?: (productId: string) => void;
};

export function ProductScreenCard({
  screen,
  product,
  source,
  inertCopy = false,
  fluid = false,
  onActivate,
}: ProductScreenCardProps) {
  const { href, target, rel } = productOpenLinkAttrs(product);
  const chrome = productChromeLabel(product, screen.label);
  const live = Boolean(product.liveUrl);

  return (
    <a
      href={href}
      target={target}
      rel={rel}
      tabIndex={inertCopy ? -1 : 0}
      aria-hidden={inertCopy || undefined}
      aria-label={
        inertCopy
          ? undefined
          : `Open ${product.name} — ${screen.label}. ${product.tagline}`
      }
      onFocus={() => onActivate?.(product.id)}
      onMouseEnter={() => onActivate?.(product.id)}
      onClick={() =>
        trackEvent("product_click", {
          product: product.id,
          source,
          dest: href,
          screen: screen.id,
        })
      }
      className={`group block outline-none ${
        fluid
          ? "w-full"
          : "w-[17.5rem] shrink-0 sm:w-[21.5rem] lg:w-[24rem]"
      }`}
    >
      <div className="overflow-hidden rounded-2xl border border-border/80 bg-background shadow-[0_18px_50px_-28px_rgba(0,0,0,0.65)] ring-1 ring-black/5 transition-transform duration-300 group-hover:-translate-y-1 group-hover:border-accent/40 group-hover:shadow-[0_22px_56px_-24px_rgba(0,0,0,0.7)] group-focus-visible:border-accent group-focus-visible:ring-2 group-focus-visible:ring-accent">
        <div className="flex items-center gap-1.5 border-b border-border/70 bg-surface-elevated/90 px-2.5 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[#f87171]/80" aria-hidden />
          <span className="h-1.5 w-1.5 rounded-full bg-[#fbbf24]/80" aria-hidden />
          <span className="h-1.5 w-1.5 rounded-full bg-[#34d399]/80" aria-hidden />
          <span className="ml-1 min-w-0 flex-1 truncate rounded-md border border-border/60 bg-background/70 px-2 py-0.5 text-center font-mono text-[9px] text-muted">
            {chrome}
          </span>
          <span
            className={`shrink-0 rounded-md border px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-wider ${
              live
                ? "border-emerald-500/35 bg-emerald-500/10 text-emerald-400"
                : "border-border/70 bg-background/40 text-muted"
            }`}
          >
            {live ? "Live" : "Preview"}
          </span>
        </div>
        <div className="relative aspect-[16/10] bg-surface">
          {screen.src ? (
            <Image
              src={screen.src}
              alt={inertCopy ? "" : screen.alt}
              fill
              sizes="(max-width: 640px) 280px, (max-width: 1024px) 344px, 384px"
              className="object-cover object-top"
            />
          ) : screen.placeholder ? (
            <div className="h-full" aria-hidden>
              <ProductPlaceholderPanel kind={screen.placeholder} />
            </div>
          ) : null}
        </div>
      </div>
      <p className="mt-2.5 truncate px-0.5 text-xs text-muted">
        <span className="font-medium text-foreground">{product.name}</span>
        <span className="text-muted"> · {screen.label}</span>
      </p>
    </a>
  );
}
