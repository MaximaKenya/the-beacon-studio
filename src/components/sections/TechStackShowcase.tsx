"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { siteConfig } from "@/data/site";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

const categories = ["all", "language", "framework", "platform", "data", "design"] as const;

type Category = (typeof categories)[number];

/**
 * Filterable tech stack with "used in" product links.
 */
export function TechStackShowcase() {
  const [filter, setFilter] = useState<Category>("all");

  const items = useMemo(() => {
    if (filter === "all") return siteConfig.techStack;
    return siteConfig.techStack.filter((t) => t.category === filter);
  }, [filter]);

  return (
    <section id="stack" className="relative py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <ScrollReveal>
          <SectionHeading
            label="Stack"
            title="Technologies we ship with"
            description="Filter by layer. Click a product link to open suite details."
          />
        </ScrollReveal>

        <div
          className="mt-8 flex flex-wrap gap-2"
          role="tablist"
          aria-label="Tech stack filters"
        >
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              role="tab"
              aria-selected={filter === cat}
              onClick={() => setFilter(cat)}
              className={`rounded-md border px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                filter === cat
                  ? "border-accent/40 bg-accent/10 text-accent"
                  : "border-border text-muted hover:border-border hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((tech) => (
            <li
              key={tech.id}
              className="rounded-lg border border-border/80 bg-surface/30 p-4 transition-colors hover:border-accent/30"
            >
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="font-display text-base font-semibold text-foreground">
                  {tech.name}
                </h3>
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted">
                  {tech.category}
                </span>
              </div>
              <p className="mt-3 font-mono text-[10px] uppercase tracking-wider text-muted">
                Used in
              </p>
              <ul className="mt-1.5 flex flex-wrap gap-1.5">
                {tech.usedIn.map((pid) => {
                  const product = siteConfig.products.find((p) => p.id === pid);
                  if (!product) return null;
                  return (
                    <li key={pid}>
                      <Link
                        href={`/products/${pid}`}
                        className="rounded border border-border/70 bg-background/50 px-2 py-0.5 text-xs text-muted transition-colors hover:border-accent/40 hover:text-accent"
                      >
                        {product.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
