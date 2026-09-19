"use client";

import Link from "next/link";
import { siteConfig } from "@/data/site";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

/**
 * Compact FAQ teaser placed near Pricing — points to full /#faq.
 */
export function PricingFaqTeaser() {
  const items = siteConfig.faq.slice(0, 3);
  if (items.length === 0) return null;

  return (
    <section
      aria-label="Pricing FAQ"
      className="relative border-t border-border/50 bg-surface/30 py-16 lg:py-20"
    >
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <ScrollReveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-accent">
                Before you decide
              </p>
              <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                Quick answers on pricing & process
              </h2>
            </div>
            <Link
              href="/#faq"
              className="text-sm font-medium text-accent hover:underline"
            >
              Full FAQ →
            </Link>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.06}>
          <ul className="mt-8 grid gap-4 md:grid-cols-3">
            {items.map((item) => (
              <li
                key={item.id}
                className="soft-panel rounded-2xl border border-border/60 p-5"
              >
                <p className="font-display text-sm font-semibold text-foreground">
                  {item.question}
                </p>
                <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-muted">
                  {item.answer}
                </p>
              </li>
            ))}
          </ul>
        </ScrollReveal>
      </div>
    </section>
  );
}
