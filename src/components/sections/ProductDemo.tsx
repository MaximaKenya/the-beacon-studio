"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { useFeatures } from "@/providers/FeatureProvider";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  Heart,
  Home,
  Play,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { trackEvent } from "@/lib/analytics";

type DemoProductId = "lookfinesse" | "confilearn" | "cadence" | "confirent";

type Slide = {
  id: string;
  title: string;
  caption: string;
  content: ReactNode;
};

const PRODUCT_TABS: { id: DemoProductId; label: string; craft: string }[] = [
  { id: "lookfinesse", label: "LookFinesse", craft: "Commerce surfaces" },
  { id: "confilearn", label: "ConfiLearn", craft: "Learning surfaces" },
  { id: "cadenceapp", label: "CadenceApp", craft: "Planning surfaces" },
  { id: "confirent", label: "ConfiRent", craft: "Rental surfaces" },
];

function LookFinesseSlides(): Slide[] {
  const items = [
    { title: "Silk wrap dress", price: "KSh 4,200", vibe: "Fashion" },
    { title: "Glow facial set", price: "KSh 2,850", vibe: "Beauty" },
    { title: "Sunrise HIIT", price: "KSh 1,500", vibe: "Fitness" },
  ];
  return [
    {
      id: "lf-feed",
      title: "Creator commerce feed",
      caption: "Shop · follow · book — mobile-first social commerce.",
      content: (
        <div className="grid gap-3 sm:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.title}
              className="overflow-hidden rounded-2xl border border-border bg-background/70"
            >
              <div className="flex h-24 items-end bg-gradient-to-br from-accent/15 via-surface to-accent-warm/10 p-3">
                <span className="rounded-xl border border-border/60 bg-surface/80 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted">
                  {item.vibe}
                </span>
              </div>
              <div className="p-3">
                <p className="text-sm font-medium text-foreground">{item.title}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="font-mono text-xs text-accent">{item.price}</span>
                  <Heart className="h-3.5 w-3.5 text-muted" aria-hidden />
                </div>
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: "lf-vendor",
      title: "Vendor dashboard",
      caption: "Orders, ads, and Kenya-ready payouts at a glance.",
      content: (
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { label: "Orders today", value: "28" },
            { label: "M-Pesa settled", value: "KSh 84k" },
            { label: "Ad reach", value: "12.4k" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-border bg-background/70 p-4"
            >
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted">
                {stat.label}
              </p>
              <p className="mt-2 font-display text-2xl font-semibold text-foreground">
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: "lf-checkout",
      title: "Checkout with M-Pesa + Stripe",
      caption: "Pay how your customers already pay.",
      content: (
        <div className="rounded-2xl border border-border bg-background/70 p-5">
          <div className="flex items-center gap-2 text-accent">
            <ShoppingBag className="h-5 w-5" aria-hidden />
            <p className="font-display text-lg font-semibold text-foreground">
              Secure checkout
            </p>
          </div>
          <ul className="mt-4 space-y-2 text-sm text-muted">
            <li className="rounded-xl border border-border/70 bg-surface/40 px-3 py-2">
              M-Pesa STK Push · instant confirmation
            </li>
            <li className="rounded-xl border border-border/70 bg-surface/40 px-3 py-2">
              Stripe cards · receipts & refunds
            </li>
            <li className="rounded-xl border border-border/70 bg-surface/40 px-3 py-2">
              Vendor split · clear fee line items
            </li>
          </ul>
        </div>
      ),
    },
  ];
}

function ConfiLearnSlides(): Slide[] {
  return [
    {
      id: "sn-player",
      title: "Course player",
      caption: "Live + on-demand with XP and streaks.",
      content: (
        <div className="overflow-hidden rounded-2xl border border-border bg-background/70">
          <div className="relative flex h-36 items-center justify-center bg-gradient-to-br from-accent-violet/20 via-surface to-accent/10">
            <span className="flex h-12 w-12 items-center justify-center rounded-full border border-accent/40 bg-accent/20 text-accent">
              <Play className="ml-0.5 h-5 w-5" fill="currentColor" />
            </span>
          </div>
          <div className="space-y-3 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-foreground">Module 3 · Live tutoring</p>
              <span className="font-mono text-[10px] text-accent">+40 XP</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-border/60">
              <div className="h-full w-[62%] rounded-full bg-accent" />
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "sn-tutor",
      title: "Tutor payouts",
      caption: "Classes, attendance, and M-Pesa payouts.",
      content: (
        <div className="rounded-2xl border border-border bg-background/70 p-5">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-accent" aria-hidden />
            <p className="font-display text-lg font-semibold text-foreground">
              Tutor console
            </p>
          </div>
          <ul className="mt-4 grid gap-2 sm:grid-cols-3">
            {["Live seat map", "Certificate track", "M-Pesa payout"].map((f) => (
              <li
                key={f}
                className="rounded-xl border border-border/70 bg-surface/40 px-3 py-2 text-xs text-muted"
              >
                {f}
              </li>
            ))}
          </ul>
        </div>
      ),
    },
    {
      id: "sn-progress",
      title: "Learner progress",
      caption: "Streaks and module completion at a glance.",
      content: (
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { label: "Streak", value: "7 days" },
            { label: "Modules", value: "12/18" },
            { label: "Certificates", value: "2" },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-border bg-background/70 p-4 text-center"
            >
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted">
                {s.label}
              </p>
              <p className="mt-2 font-display text-xl font-semibold text-foreground">
                {s.value}
              </p>
            </div>
          ))}
        </div>
      ),
    },
  ];
}

function CadenceSlides(): Slide[] {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const blocks = [
    { label: "Plan", h: "40%" },
    { label: "Build", h: "70%" },
    { label: "Demo", h: "55%" },
    { label: "Ship", h: "85%" },
    { label: "Retro", h: "45%" },
  ];
  return [
    {
      id: "cd-rhythm",
      title: "Team rhythm board",
      caption: "Weekly cadence for teams that ship.",
      content: (
        <div className="rounded-2xl border border-border bg-background/70 p-4 sm:p-5">
          <div className="mb-4 flex gap-2">
            {days.map((d) => (
              <span
                key={d}
                className="flex-1 text-center font-mono text-[10px] uppercase tracking-wider text-muted"
              >
                {d}
              </span>
            ))}
          </div>
          <div className="flex h-32 items-end gap-2">
            {blocks.map((b) => (
              <div key={b.label} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-md bg-gradient-to-t from-accent/70 to-accent/30"
                  style={{ height: b.h }}
                />
                <span className="text-[11px] font-medium text-foreground">{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: "cd-plan",
      title: "Sprint plan",
      caption: "Scope slices with clear owners.",
      content: (
        <div className="space-y-2">
          {["Discovery call notes → brief", "Build slice A", "Demo Friday"].map((row, i) => (
            <div
              key={row}
              className="flex items-center gap-3 rounded-2xl border border-border bg-background/70 px-4 py-3"
            >
              <Calendar className="h-4 w-4 text-accent" aria-hidden />
              <span className="text-sm text-foreground">{row}</span>
              <span className="ml-auto font-mono text-[10px] text-muted">D{i + 1}</span>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: "cd-pulse",
      title: "Weekly pulse",
      caption: "Ship signal without the noise.",
      content: (
        <div className="rounded-2xl border border-border bg-background/70 p-5">
          <p className="font-display text-lg font-semibold text-foreground">Pulse this week</p>
          <p className="mt-2 text-sm text-muted">
            3 demos · 1 ship · 0 blockers — CadenceApp keeps the rhythm visible for founders and
            teams.
          </p>
        </div>
      ),
    },
  ];
}

function ConfiRentSlides(): Slide[] {
  return [
    {
      id: "cr-listings",
      title: "Trusted listings",
      caption: "Clearer trust between hosts and renters.",
      content: (
        <div className="grid gap-3 sm:grid-cols-2">
          {["Westlands loft", "Kilimani studio"].map((place) => (
            <div
              key={place}
              className="overflow-hidden rounded-2xl border border-border bg-background/70"
            >
              <div className="flex h-24 items-end bg-gradient-to-br from-accent/10 via-surface to-accent-violet/10 p-3">
                <Home className="h-4 w-4 text-accent" aria-hidden />
              </div>
              <div className="p-3">
                <p className="text-sm font-medium text-foreground">{place}</p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-muted">
                  Verified host
                </p>
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: "cr-trust",
      title: "Deposit & handoff",
      caption: "Transparent deposits and check-in steps.",
      content: (
        <ul className="space-y-2">
          {["ID + deposit held", "Check-in checklist", "Dispute trail"].map((step) => (
            <li
              key={step}
              className="rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm text-foreground"
            >
              {step}
            </li>
          ))}
        </ul>
      ),
    },
    {
      id: "cr-ops",
      title: "Host ops",
      caption: "Bookings, payouts, and maintenance signals.",
      content: (
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { label: "Active stays", value: "6" },
            { label: "Pending payout", value: "KSh 42k" },
            { label: "Open tickets", value: "1" },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-border bg-background/70 p-4"
            >
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted">
                {s.label}
              </p>
              <p className="mt-2 font-display text-xl font-semibold text-foreground">
                {s.value}
              </p>
            </div>
          ))}
        </div>
      ),
    },
  ];
}

function slidesFor(id: DemoProductId): Slide[] {
  switch (id) {
    case "lookfinesse":
      return LookFinesseSlides();
    case "confilearn":
      return ConfiLearnSlides();
    case "cadence":
      return CadenceSlides();
    case "confirent":
      return ConfiRentSlides();
  }
}

function ProductSlideshow({ productId }: { productId: DemoProductId }) {
  const slides = slidesFor(productId);
  const reducedMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(!reducedMotion);

  useEffect(() => {
    setIndex(0);
  }, [productId]);

  useEffect(() => {
    if (!autoPlay || reducedMotion || slides.length < 2) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 4500);
    return () => window.clearInterval(id);
  }, [autoPlay, reducedMotion, slides.length, productId]);

  const go = useCallback(
    (i: number) => {
      setIndex(i);
      setAutoPlay(false);
    },
    []
  );

  const slide = slides[index] ?? slides[0];

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-xl font-semibold text-foreground">{slide.title}</h3>
          <p className="mt-1 text-sm text-muted">{slide.caption}</p>
        </div>
        {!reducedMotion && (
          <button
            type="button"
            onClick={() => setAutoPlay((v) => !v)}
            className="rounded-xl border border-border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-muted hover:text-foreground"
          >
            {autoPlay ? "Pause" : "Auto-play"}
          </button>
        )}
      </div>
      <div className="min-h-[180px]">{slide.content}</div>
      <div className="mt-5 flex items-center justify-center gap-2" role="tablist" aria-label="Slides">
        {slides.map((s, i) => (
          <button
            key={s.id}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={`Slide ${i + 1}: ${s.title}`}
            onClick={() => go(i)}
            className={`h-2.5 rounded-full transition-all ${
              i === index ? "w-6 bg-accent" : "w-2.5 bg-border hover:bg-muted"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export function ProductDemo() {
  const [tab, setTab] = useState<DemoProductId>("lookfinesse");
  const { openIntake, openBooking } = useFeatures();
  const active = PRODUCT_TABS.find((p) => p.id === tab)!;

  return (
    <section id="demo" className="relative overflow-hidden py-28 lg:py-36">
      <div className="relative mx-auto max-w-6xl px-6 lg:px-8">
        <ScrollReveal>
          <SectionHeading
            label="Built with Beacon"
            title="Surfaces we ship"
            description="UI craft previews for LookFinesse, ConfiLearn, CadenceApp, and ConfiRent — not production data."
          />
        </ScrollReveal>

        <ScrollReveal delay={0.08}>
          <div className="mt-4 overflow-hidden rounded-3xl border border-border bg-surface shadow-lg shadow-black/5">
            <div className="relative flex flex-wrap items-center justify-between gap-3 border-b border-border bg-gradient-to-r from-accent/8 via-surface-elevated/80 to-accent-violet/8 px-4 py-3 sm:px-5">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-accent" aria-hidden />
                <p className="font-mono text-[11px] text-muted">
                  Craft playground · {active.craft}
                </p>
              </div>
              <div
                className="flex flex-wrap gap-1 rounded-2xl border border-border bg-background/60 p-0.5"
                role="tablist"
              >
                {PRODUCT_TABS.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    role="tab"
                    aria-selected={tab === t.id}
                    onClick={() => {
                      setTab(t.id);
                      trackEvent("demo_tab", { product: t.id });
                    }}
                    className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-colors ${
                      tab === t.id
                        ? "bg-accent text-background"
                        : "text-muted hover:text-foreground"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-5 sm:p-6 lg:p-8" role="tabpanel">
              <ProductSlideshow productId={tab} />

              <div className="mt-10 flex flex-wrap gap-3 border-t border-border/60 pt-6">
                <Link
                  href={`/products/${tab}`}
                  onClick={() =>
                    trackEvent("cta_click", {
                      type: "open_product",
                      product: tab,
                      source: "demo",
                    })
                  }
                  className="inline-flex h-11 items-center gap-2 rounded-2xl bg-accent px-5 text-sm font-semibold text-background hover:bg-accent-hover"
                >
                  Open {active.label} page
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    trackEvent("cta_click", { type: "intake", source: "demo" });
                    openIntake();
                  }}
                  className="inline-flex h-11 items-center rounded-2xl border border-border bg-surface px-5 text-sm font-semibold text-foreground hover:border-accent/40"
                >
                  Start a Project
                </button>
                <button
                  type="button"
                  onClick={() => {
                    trackEvent("cta_click", { type: "book", source: "demo" });
                    openBooking();
                  }}
                  className="inline-flex h-11 items-center rounded-2xl border border-border bg-surface px-5 text-sm font-semibold text-foreground hover:border-accent/40"
                >
                  Book a Call
                </button>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
