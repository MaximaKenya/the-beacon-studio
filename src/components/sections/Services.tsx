"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { siteConfig } from "@/data/site";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useFeatures } from "@/providers/FeatureProvider";
import { trackEvent } from "@/lib/analytics";

export function Services() {
  const { openBooking, openIntake } = useFeatures();
  const studio = siteConfig.services.filter((service) => service.group !== "managed-it");
  const managed = siteConfig.services.filter((service) => service.group === "managed-it");
  const [automation, custom] = studio;

  return (
    <section id="services" className="relative border-t border-border py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <SectionHeading
          label="Services"
          title="How we can help"
          description="Automate a task, build software, or hand us the day-to-day IT."
        />

        <div className="grid gap-6 md:grid-cols-2">
          {automation && (
            <article className="flex h-full flex-col rounded-2xl border border-border bg-surface p-7">
              <h3 className="font-display text-2xl font-semibold text-foreground">{automation.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{automation.description}</p>
              <p className="mt-4 text-sm leading-relaxed text-foreground">
                {siteConfig.automation.toolsLine}
              </p>
              <div className="mt-auto flex flex-wrap gap-3 pt-8">
                <Link
                  href="/automation"
                  className="inline-flex h-11 items-center gap-2 rounded-xl bg-accent px-4 text-sm font-semibold text-background hover:bg-accent-hover"
                >
                  See how it works
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    trackEvent("cta_click", { type: "book", source: "services_automation" });
                    openBooking("automation-audit");
                  }}
                  className="inline-flex h-11 items-center rounded-xl border border-border px-4 text-sm font-medium text-foreground hover:border-accent/40"
                >
                  Free 20-min audit
                </button>
              </div>
            </article>
          )}

          {custom && (
            <article className="flex h-full flex-col rounded-2xl border border-border bg-surface p-7">
              <h3 className="font-display text-2xl font-semibold text-foreground">{custom.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{custom.description}</p>
              <p className="mt-4 text-sm leading-relaxed text-foreground">
                Websites, internal tools, and new products. We agree the work before we start.
              </p>
              <div className="mt-auto flex flex-wrap gap-3 pt-8">
                <button
                  type="button"
                  onClick={() => {
                    trackEvent("cta_click", { type: "book", source: "services_custom" });
                    openBooking();
                  }}
                  className="inline-flex h-11 items-center gap-2 rounded-xl bg-accent px-4 text-sm font-semibold text-background hover:bg-accent-hover"
                >
                  Book a free call
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    trackEvent("cta_click", { type: "intake", source: "services_custom" });
                    openIntake();
                  }}
                  className="inline-flex h-11 items-center rounded-xl border border-border px-4 text-sm font-medium text-foreground hover:border-accent/40"
                >
                  Start a project
                </button>
              </div>
            </article>
          )}
        </div>

        {managed.length > 0 && (
          <div className="mt-6 rounded-2xl border border-border bg-surface p-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h3 className="font-display text-2xl font-semibold text-foreground">Managed IT</h3>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
                  Outsourced IT for the systems you already run. Quoted after a free assessment.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  trackEvent("cta_click", { type: "book", source: "services_it" });
                  openBooking("it-assessment");
                }}
                className="inline-flex h-11 shrink-0 items-center gap-2 rounded-xl bg-accent px-4 text-sm font-semibold text-background hover:bg-accent-hover"
              >
                Book a free assessment
                <ArrowRight className="h-4 w-4" aria-hidden />
              </button>
            </div>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2">
              {managed.map((service) => (
                <li key={service.id} className="rounded-xl border border-border bg-background/40 p-4">
                  <p className="font-display text-base font-semibold text-foreground">{service.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{service.description}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
