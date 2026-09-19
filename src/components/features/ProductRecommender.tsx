"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { siteConfig } from "@/data/site";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useFeatures } from "@/providers/FeatureProvider";
import { trackEvent } from "@/lib/analytics";

type Goal =
  | "sell"
  | "teach"
  | "schedule"
  | "rent"
  | "custom"
  | "unsure";

const QUESTIONS: {
  id: Goal;
  label: string;
  hint: string;
}[] = [
  { id: "sell", label: "Sell products or services online", hint: "Shop, creators, bookings" },
  { id: "teach", label: "Teach or train people", hint: "Courses, schools, tutors" },
  { id: "schedule", label: "Keep a team on rhythm", hint: "Planning & shipping cadence" },
  { id: "rent", label: "Rentals / listings with trust", hint: "Coming soon — ConfiRent" },
  { id: "custom", label: "Something custom for my org", hint: "SME, church, NGO, school, shop" },
  { id: "unsure", label: "I’m not sure yet", hint: "We’ll recommend a path" },
];

type Rec = {
  title: string;
  body: string;
  productId?: string;
  cta: "product" | "intake" | "book";
};

function recommend(goal: Goal): Rec {
  switch (goal) {
    case "sell":
      return {
        title: "LookFinesse",
        body: "A creator marketplace with shop, feed, and Kenya-ready payments — strong fit for selling fashion, beauty, fitness, or services.",
        productId: "lookfinesse",
        cta: "product",
      };
    case "teach":
      return {
        title: "ConfiLearn",
        body: "An LMS for live + on-demand learning with tutor studio, XP, certificates, and M-Pesa payouts — ideal for tutors, schools, and cohorts.",
        productId: "confilearn",
        cta: "product",
      };
    case "schedule":
      return {
        title: "CadenceApp",
        body: "Early Beacon product for team rhythm and shipping cadence. Explore the page, or start a custom build if you need ops tooling now.",
        productId: "cadenceapp",
        cta: "product",
      };
    case "rent":
      return {
        title: "ConfiRent (coming soon)",
        body: "Rentals with clarity between hosts and renters. Details land when the repo is ready — meanwhile we can scope a custom rental MVP.",
        productId: "confirent",
        cta: "product",
      };
    case "custom":
      return {
        title: "Custom build with Beacon",
        body: "Websites and apps for businesses, schools, churches, NGOs, and shops — plain-language intake, scoped quote, weekly demos.",
        cta: "intake",
      };
    default:
      return {
        title: "Let’s clarify together",
        body: "Book a short call or Start a Project — Glow and Max will help match you to a suite product or a custom build.",
        cta: "book",
      };
  }
}

export function ProductRecommender() {
  const [goal, setGoal] = useState<Goal | null>(null);
  const { openIntake, openBooking } = useFeatures();
  const rec = useMemo(() => (goal ? recommend(goal) : null), [goal]);

  return (
    <section id="recommend" className="relative py-24 lg:py-32">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <ScrollReveal>
          <SectionHeading
            label="AI product guide"
            title="What do you need?"
            description="A short quiz — we recommend a Beacon product or a custom build. No account required."
          />
        </ScrollReveal>

        <ScrollReveal delay={0.06}>
          <div className="mt-8 rounded-2xl border border-border bg-surface/40 p-5 sm:p-8">
            <div className="mb-5 flex items-center gap-2 text-accent">
              <Sparkles className="h-4 w-4" aria-hidden />
              <p className="font-mono text-[11px] uppercase tracking-wider">Glow-assisted</p>
            </div>

            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {QUESTIONS.map((q) => (
                <li key={q.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setGoal(q.id);
                      trackEvent("recommender_select", { goal: q.id });
                    }}
                    className={`h-full w-full rounded-xl border px-4 py-4 text-left transition-colors ${
                      goal === q.id
                        ? "border-accent/50 bg-accent/10"
                        : "border-border/70 bg-background/40 hover:border-accent/30"
                    }`}
                  >
                    <span className="block text-sm font-medium text-foreground">{q.label}</span>
                    <span className="mt-1 block text-xs text-muted">{q.hint}</span>
                  </button>
                </li>
              ))}
            </ul>

            {rec && (
              <div className="mt-8 rounded-xl border border-accent/30 bg-accent/5 p-5">
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
                  Recommendation
                </p>
                <h3 className="mt-2 font-display text-xl font-semibold text-foreground">
                  {rec.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{rec.body}</p>
                <div className="mt-5 flex flex-wrap gap-3">
                  {rec.cta === "product" && rec.productId && (
                    <Link
                      href={`/products/${rec.productId}`}
                      onClick={() =>
                        trackEvent("recommender_cta", {
                          type: "product",
                          product: rec.productId!,
                        })
                      }
                      className="inline-flex h-11 items-center gap-2 rounded-xl bg-accent px-5 text-sm font-semibold text-background hover:bg-accent-hover"
                    >
                      Open {siteConfig.products.find((p) => p.id === rec.productId)?.name ?? "product"}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  )}
                  {rec.cta === "intake" && (
                    <button
                      type="button"
                      onClick={() => {
                        trackEvent("recommender_cta", { type: "intake" });
                        openIntake();
                      }}
                      className="inline-flex h-11 items-center gap-2 rounded-xl bg-accent px-5 text-sm font-semibold text-background hover:bg-accent-hover"
                    >
                      Start a Project
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  )}
                  {rec.cta === "book" && (
                    <button
                      type="button"
                      onClick={() => {
                        trackEvent("recommender_cta", { type: "book" });
                        openBooking();
                      }}
                      className="inline-flex h-11 items-center gap-2 rounded-xl bg-accent px-5 text-sm font-semibold text-background hover:bg-accent-hover"
                    >
                      Book a Call
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => openIntake()}
                    className="inline-flex h-11 items-center rounded-xl border border-border px-5 text-sm font-semibold text-foreground hover:border-accent/40"
                  >
                    Or describe a custom build
                  </button>
                </div>
              </div>
            )}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
