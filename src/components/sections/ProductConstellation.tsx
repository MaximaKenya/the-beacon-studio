"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { siteConfig, type Product } from "@/data/site";
import { BeaconMark } from "@/components/brand/BeaconMark";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { trackEvent } from "@/lib/analytics";

function nodePosition(index: number, total: number, radius: number) {
  const angle = (index / total) * Math.PI * 2 - Math.PI / 2;
  return {
    x: 50 + Math.cos(angle) * radius,
    y: 50 + Math.sin(angle) * radius,
  };
}

function statusDot(status: Product["operationalStatus"]) {
  switch (status) {
    case "operational":
      return "bg-emerald-400";
    case "degraded":
      return "bg-amber-400";
    case "maintenance":
      return "bg-orange-400";
    default:
      return "bg-accent";
  }
}

/**
 * Animated product constellation — gentle orbit, hub pulse, draw-in rings.
 * Labels stay unclipped via padded layout; reduced-motion → static.
 */
export function ProductConstellation({ compact = false }: { compact?: boolean }) {
  const products = siteConfig.products;
  const reducedMotion = useReducedMotion();
  const [hovered, setHovered] = useState<string | null>(null);

  const radius = products.length <= 4 ? 32 : 34;
  const nodes = useMemo(
    () =>
      products.map((product, i) => ({
        product,
        ...nodePosition(i, products.length, radius),
      })),
    [products, radius]
  );

  return (
    <div
      className={`relative mx-auto w-full overflow-visible px-4 py-6 sm:px-8 sm:py-8 ${
        compact ? "max-w-[440px]" : "max-w-[520px] lg:max-w-[580px]"
      }`}
    >
      <ul className="grid gap-3 sm:hidden" aria-label="Product suite">
        {products.map((product) => (
          <li key={product.id}>
            <Link
              href={`/products/${product.id}`}
              onClick={() =>
                trackEvent("product_click", {
                  product: product.id,
                  source: "constellation_mobile",
                })
              }
              className="flex items-center gap-3 rounded-2xl border border-border bg-surface/95 px-4 py-3 shadow-sm transition-colors hover:border-accent/45"
            >
              <span
                className={`h-2 w-2 shrink-0 rounded-full ${statusDot(product.operationalStatus)}`}
                aria-hidden
              />
              <div className="min-w-0 flex-1">
                <p className="font-display text-sm font-semibold text-foreground">
                  {product.name}
                </p>
                <p className="font-mono text-[10px] uppercase tracking-wider text-muted">
                  {product.status === "coming-soon" ? "Coming soon" : product.status}
                </p>
              </div>
            </Link>
          </li>
        ))}
        <li className="flex items-center justify-center gap-2 py-2 text-muted">
          <BeaconMark size={18} />
          <span className="font-mono text-[10px] uppercase tracking-widest">
            {products.length} apps
          </span>
        </li>
      </ul>

      <div className="relative hidden aspect-square w-full overflow-visible sm:block">
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 h-full w-full overflow-visible"
          aria-hidden
        >
          <motion.circle
            cx="50"
            cy="50"
            r={radius + 4}
            fill="none"
            stroke="currentColor"
            strokeWidth="0.08"
            className="text-border/35"
            {...(reducedMotion
              ? {}
              : {
                  initial: { pathLength: 0, opacity: 0 },
                  whileInView: { pathLength: 1, opacity: 1 },
                  viewport: { once: true },
                  transition: { duration: 1.4, ease: "easeOut" as const },
                })}
          />
          <motion.circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="0.18"
            className="text-border/80"
            strokeDasharray="1.4 1.6"
            {...(reducedMotion
              ? {}
              : {
                  initial: { pathLength: 0 },
                  whileInView: { pathLength: 1 },
                  viewport: { once: true },
                  animate: { strokeDashoffset: [0, -12] },
                  transition: {
                    pathLength: { duration: 1.2, ease: "easeOut" as const },
                    strokeDashoffset: {
                      duration: 28,
                      repeat: Infinity,
                      ease: "linear" as const,
                    },
                  },
                })}
          />
          <motion.circle
            cx="50"
            cy="50"
            r="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.12"
            className="text-accent/25"
            {...(reducedMotion
              ? {}
              : {
                  initial: { pathLength: 0, opacity: 0 },
                  whileInView: { pathLength: 1, opacity: 1 },
                  viewport: { once: true },
                  transition: { duration: 1, delay: 0.2, ease: "easeOut" as const },
                })}
          />
          {nodes.map(({ product, x, y }) => (
            <motion.line
              key={`line-${product.id}`}
              x1="50"
              y1="50"
              x2={x}
              y2={y}
              stroke="currentColor"
              strokeWidth={hovered === product.id ? 0.32 : 0.14}
              className={
                hovered === product.id ? "text-accent/55" : "text-border/55"
              }
              {...(reducedMotion
                ? {}
                : {
                    initial: { pathLength: 0, opacity: 0 },
                    whileInView: { pathLength: 1, opacity: 1 },
                    viewport: { once: true },
                    transition: { duration: 0.8, delay: 0.15 },
                  })}
            />
          ))}
        </svg>

        {/* Slow orbit of nodes; counter-rotate keeps labels upright */}
        <motion.div
          className="absolute inset-0"
          animate={reducedMotion ? undefined : { rotate: 360 }}
          transition={
            reducedMotion
              ? undefined
              : { duration: 100, repeat: Infinity, ease: "linear" }
          }
        >
          {nodes.map(({ product, x, y }, i) => (
            <motion.div
              key={product.id}
              className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${x}%`, top: `${y}%` }}
              initial={reducedMotion ? false : { opacity: 0, scale: 0.85 }}
              whileInView={reducedMotion ? undefined : { opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              animate={reducedMotion ? undefined : { rotate: -360 }}
              transition={
                reducedMotion
                  ? undefined
                  : {
                      opacity: { delay: 0.2 + i * 0.07, duration: 0.45 },
                      scale: { delay: 0.2 + i * 0.07, duration: 0.45 },
                      rotate: {
                        duration: 100,
                        repeat: Infinity,
                        ease: "linear",
                      },
                    }
              }
            >
              <Link
                href={`/products/${product.id}`}
                onClick={() =>
                  trackEvent("product_click", {
                    product: product.id,
                    source: "constellation",
                  })
                }
                onMouseEnter={() => setHovered(product.id)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(product.id)}
                onBlur={() => setHovered(null)}
                className={`block w-[6.75rem] rounded-2xl border bg-surface/95 px-2.5 py-2 shadow-md backdrop-blur-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:w-[8.25rem] sm:px-3.5 sm:py-2.5 ${
                  hovered === product.id
                    ? "-translate-y-1 scale-[1.05] border-accent/55 shadow-lg shadow-accent/15"
                    : "border-border hover:-translate-y-0.5 hover:border-accent/40"
                }`}
                aria-label={`Open ${product.name} product page`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2 w-2 shrink-0 rounded-full ${statusDot(product.operationalStatus)}`}
                    aria-hidden
                  />
                  <p className="truncate font-display text-xs font-semibold text-foreground sm:text-sm">
                    {product.name}
                  </p>
                </div>
                <p className="mt-0.5 font-mono text-[9px] uppercase tracking-wider text-muted sm:text-[10px]">
                  {product.status === "coming-soon" ? "Coming soon" : product.status}
                </p>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="absolute left-1/2 top-1/2 z-30 flex h-[4.5rem] w-[4.5rem] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-2xl border border-accent/30 bg-surface/95 shadow-lg shadow-accent/10 backdrop-blur-sm sm:h-22 sm:w-22"
          animate={
            reducedMotion
              ? undefined
              : {
                  scale: [1, 1.045, 1],
                }
          }
          transition={
            reducedMotion
              ? undefined
              : { duration: 3.6, repeat: Infinity, ease: "easeInOut" }
          }
        >
          <BeaconMark size={22} />
          <span className="mt-1 font-mono text-[9px] uppercase tracking-widest text-muted">
            {products.length} apps
          </span>
        </motion.div>
      </div>
    </div>
  );
}
