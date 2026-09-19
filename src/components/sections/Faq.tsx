"use client";

import { useId, useState } from "react";
import { siteConfig } from "@/data/site";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ChevronDown } from "lucide-react";

export function Faq() {
  const [openId, setOpenId] = useState<string | null>(siteConfig.faq[0]?.id ?? null);
  const baseId = useId();

  return (
    <section id="faq" className="relative overflow-hidden py-24 lg:py-32">
      <div className="relative mx-auto max-w-3xl px-6 lg:px-8">
        <ScrollReveal>
          <SectionHeading
            label="FAQ"
            title="Questions, answered"
            description="Straight answers for founders evaluating The Beacon Studio — products, pricing, and how we work."
          />
        </ScrollReveal>

        <ScrollReveal delay={0.06}>
          <div className="mt-2 divide-y divide-border rounded-2xl border border-border bg-surface/80">
            {siteConfig.faq.map((item) => {
              const isOpen = openId === item.id;
              const panelId = `${baseId}-${item.id}`;
              return (
                <div key={item.id}>
                  <h3>
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => setOpenId(isOpen ? null : item.id)}
                      className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left sm:px-6 sm:py-5"
                    >
                      <span className="font-display text-base font-semibold text-foreground sm:text-lg">
                        {item.question}
                      </span>
                      <ChevronDown
                        className={`h-5 w-5 shrink-0 text-muted transition-transform ${
                          isOpen ? "rotate-180" : ""
                        }`}
                        aria-hidden
                      />
                    </button>
                  </h3>
                  <div
                    id={panelId}
                    role="region"
                    hidden={!isOpen}
                    className="px-5 pb-5 sm:px-6 sm:pb-6"
                  >
                    <p className="text-sm leading-relaxed text-muted sm:text-base">
                      {item.answer}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
