"use client";

import Link from "next/link";
import { siteConfig, type OperationalStatus } from "@/data/site";
import { trackEvent } from "@/lib/analytics";

const opLabel: Record<OperationalStatus, string> = {
  operational: "Operational",
  degraded: "Degraded",
  maintenance: "Maintenance",
  building: "Building",
};

const opDot: Record<OperationalStatus, string> = {
  operational: "bg-emerald-500",
  degraded: "bg-amber-500",
  maintenance: "bg-accent-violet",
  building: "bg-accent",
};

/** Live suite status strip — config-driven from products[].operationalStatus */
export function SuiteStatusStrip() {
  return (
    <section
      aria-label="Suite status"
      className="border-y border-border/50 bg-surface/30 backdrop-blur-sm"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:gap-6 lg:px-8">
        <p className="shrink-0 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
          Suite status · {siteConfig.products.length} apps
        </p>
        <ul className="flex flex-1 flex-wrap items-center gap-x-5 gap-y-2">
          {siteConfig.products.map((product) => (
            <li key={product.id}>
              <Link
                href={`/products/${product.id}`}
                onClick={() =>
                  trackEvent("product_click", {
                    product: product.id,
                    source: "status_strip",
                  })
                }
                className="group inline-flex items-center gap-2 text-left transition-colors"
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${opDot[product.operationalStatus]}`}
                  aria-hidden
                />
                <span className="text-sm text-foreground group-hover:text-accent">
                  {product.name}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted">
                  {opLabel[product.operationalStatus]}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
