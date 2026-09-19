"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { siteConfig, type Product, type ProductStatus } from "@/data/site";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProductConstellation } from "@/components/sections/ProductConstellation";
import { SuiteLine } from "@/components/brand/SuiteLine";
import { SoftImageCarousel } from "@/components/ui/SoftImageCarousel";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { motion } from "framer-motion";
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

function ProductTile({ product }: { product: Product }) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      className="group relative flex min-h-[280px] flex-col overflow-hidden rounded-3xl border border-border/80 bg-surface/30 transition-all hover:border-accent/35 sm:min-h-[300px]"
      {...(reducedMotion
        ? {}
        : {
            initial: { opacity: 0, y: 10 },
            whileInView: { opacity: 1, y: 0 },
            viewport: { once: true, margin: "-40px" },
            transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const },
          })}
    >
      <Link
        href={`/products/${product.id}`}
        onClick={() =>
          trackEvent("product_click", { product: product.id, source: "suite_card" })
        }
        className="relative flex flex-1 flex-col text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <div className="relative flex h-36 shrink-0 items-center justify-center bg-background/50 p-5 sm:h-40 sm:p-6">
          <div className="relative h-full w-full">
            <Image
              src={product.image}
              alt=""
              fill
              sizes="(max-width: 640px) 100vw, 33vw"
              className="object-contain object-center opacity-95 transition-transform duration-500 group-hover:scale-[1.03]"
            />
          </div>
          <span
            className={`absolute right-3 top-3 rounded-2xl border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider ${statusClass[product.status]}`}
          >
            {statusLabel[product.status]}
          </span>
        </div>

        <div className="relative flex flex-1 flex-col p-5 sm:p-6">
          <h3 className="font-display text-xl font-semibold tracking-tight text-foreground">
            {product.name}
          </h3>

          <p className="mt-2 text-sm font-medium text-foreground">{product.tagline}</p>
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">
            {product.description}
          </p>

          <ul className="mt-4 flex flex-wrap gap-2" aria-label="Product tags">
            {product.tags.slice(0, 4).map((tag) => (
              <li
                key={tag}
                className="rounded-2xl border border-border/70 bg-background/40 px-2.5 py-1 font-mono text-[11px] text-muted"
              >
                {tag}
              </li>
            ))}
          </ul>

          <div className="mt-auto flex items-center gap-2 pt-6 text-sm font-medium text-accent">
            View product
            <ArrowUpRight
              className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              aria-hidden
            />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export function ProductSuite() {
  const productSlides = siteConfig.products.map((p) => ({
    src: p.image,
    alt: p.name,
    caption: `${p.name} — ${p.tagline}`,
  }));

  return (
    <section id="products" className="section-wash-projects relative overflow-hidden py-24 lg:py-32">
      <div className="relative mx-auto max-w-6xl px-6 lg:px-8">
        <ScrollReveal variant="slide-left">
          <SectionHeading
            label="Product Suite"
            title="Four products. One studio."
            description="Explore the suite — or start a custom build for your team."
          />
        </ScrollReveal>

        <ScrollReveal delay={0.04}>
          <div className="mt-6">
            <SuiteLine size="md" align="left" />
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.06}>
          <div className="mt-10 mb-8 max-w-xl">
            <SoftImageCarousel
              slides={productSlides}
              intervalMs={4800}
              fit="contain"
              aspect="aspect-[16/9]"
            />
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.06}>
          <div className="mt-10 mb-10">
            <ProductConstellation />
          </div>
        </ScrollReveal>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 lg:gap-5">
          {siteConfig.products.map((product) => (
            <ProductTile key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
