import type { ReactNode } from "react";
import {
  BookOpen,
  Calendar,
  Heart,
  Home,
  Mic2,
  Play,
  ShoppingBag,
  Trophy,
} from "lucide-react";
import type { Product } from "@/data/site";

function BrowserChrome({
  product,
  children,
}: {
  product: Product;
  children: ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/80 bg-background shadow-[0_18px_50px_-24px_rgba(0,0,0,0.55)]">
      <div className="flex items-center gap-2 border-b border-border/70 bg-surface-elevated/90 px-3 py-2">
        <span className="h-2 w-2 rounded-full bg-[#f87171]/80" aria-hidden />
        <span className="h-2 w-2 rounded-full bg-[#fbbf24]/80" aria-hidden />
        <span className="h-2 w-2 rounded-full bg-[#34d399]/80" aria-hidden />
        <span className="ml-1 min-w-0 flex-1 truncate rounded-lg border border-border/60 bg-background/70 px-2.5 py-1 text-center font-mono text-[10px] text-muted">
          {product.name} · marketing preview
        </span>
      </div>
      <div className="bg-surface/40">{children}</div>
    </div>
  );
}

function MockCta({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex h-8 items-center rounded-xl bg-accent px-3 text-[11px] font-semibold text-background">
      {children}
    </span>
  );
}

function MockGhost({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex h-8 items-center rounded-xl border border-border/80 bg-background/50 px-3 text-[11px] font-medium text-foreground">
      {children}
    </span>
  );
}

function LookFinesseHome() {
  const items = [
    { title: "Silk wrap dress", price: "KSh 4,200", vibe: "Fashion" },
    { title: "Glow facial set", price: "KSh 2,850", vibe: "Beauty" },
    { title: "Sunrise HIIT", price: "KSh 1,500", vibe: "Fitness" },
  ];
  return (
    <>
      <div className="border-b border-border/50 bg-gradient-to-br from-accent-warm/15 via-surface to-accent/10 px-4 py-4 sm:px-5 sm:py-5">
        <div className="mb-3 flex items-center justify-between gap-2">
          <span className="font-display text-sm font-semibold tracking-tight text-foreground">
            LookFinesse
          </span>
          <span className="hidden font-mono text-[10px] uppercase tracking-wider text-muted sm:inline">
            Shop · Book · Grow
          </span>
        </div>
        <p className="font-display text-xl font-bold leading-tight tracking-tight text-foreground sm:text-2xl">
          Sell fashion, beauty &amp; fitness — pay with M-Pesa.
        </p>
        <p className="mt-1.5 max-w-md text-xs leading-relaxed text-muted sm:text-sm">
          Creator marketplace with Kenya-ready payments (M-Pesa + Stripe).
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <MockCta>
            <ShoppingBag className="mr-1.5 h-3 w-3" aria-hidden />
            Shop looks
          </MockCta>
          <MockGhost>Open a stall</MockGhost>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 p-3 sm:gap-3 sm:p-4">
        {items.map((item) => (
          <div
            key={item.title}
            className="overflow-hidden rounded-xl border border-border/70 bg-background/70"
          >
            <div className="flex h-14 items-end bg-gradient-to-br from-accent-warm/20 via-surface to-accent/10 p-2 sm:h-16">
              <span className="rounded-md border border-border/60 bg-surface/80 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-muted">
                {item.vibe}
              </span>
            </div>
            <div className="p-2">
              <p className="truncate text-[11px] font-medium text-foreground sm:text-xs">
                {item.title}
              </p>
              <div className="mt-1 flex items-center justify-between gap-1">
                <span className="font-mono text-[10px] text-accent">{item.price}</span>
                <Heart className="h-3 w-3 text-muted" aria-hidden />
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function ConfiLearnHome() {
  return (
    <>
      <div className="border-b border-border/50 bg-gradient-to-br from-accent/15 via-surface to-accent-violet/10 px-4 py-4 sm:px-5 sm:py-5">
        <div className="mb-3 flex items-center justify-between gap-2">
          <span className="font-display text-sm font-semibold tracking-tight text-foreground">
            ConfiLearn
          </span>
          <span className="hidden items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-muted sm:flex">
            <BookOpen className="h-3 w-3 text-accent" aria-hidden />
            LMS
          </span>
        </div>
        <p className="font-display text-xl font-bold leading-tight tracking-tight text-foreground sm:text-2xl">
          Live classes and courses. Tutors paid via M-Pesa.
        </p>
        <p className="mt-1.5 max-w-md text-xs leading-relaxed text-muted sm:text-sm">
          An LMS for tutors and learners — sessions, progress, and payouts in one place.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <MockCta>
            <Play className="mr-1.5 h-3 w-3" fill="currentColor" aria-hidden />
            Join live class
          </MockCta>
          <MockGhost>Browse courses</MockGhost>
        </div>
      </div>
      <div className="grid gap-3 p-3 sm:grid-cols-[1.2fr_0.8fr] sm:p-4">
        <div className="overflow-hidden rounded-xl border border-border/70 bg-background/70">
          <div className="relative flex h-20 items-center justify-center bg-gradient-to-br from-accent-violet/25 via-surface to-accent/10 sm:h-24">
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-accent/40 bg-accent/20 text-accent">
              <Play className="ml-0.5 h-4 w-4" fill="currentColor" aria-hidden />
            </span>
          </div>
          <div className="space-y-2 p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-medium text-foreground">Module 3 · Live tutoring</p>
              <span className="font-mono text-[10px] text-accent">+40 XP</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-border/60">
              <div className="h-full w-[62%] rounded-full bg-accent" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-1">
          {[
            { label: "Streak", value: "7 days" },
            { label: "Payout", value: "M-Pesa" },
            { label: "Certs", value: "2" },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-border/70 bg-background/70 p-2.5 text-center sm:text-left"
            >
              <p className="font-mono text-[9px] uppercase tracking-wider text-muted">{s.label}</p>
              <p className="mt-1 font-display text-sm font-semibold text-foreground">{s.value}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function CadenceAppHome() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const blocks = [
    { label: "Plan", h: "40%" },
    { label: "Build", h: "70%" },
    { label: "Demo", h: "55%" },
    { label: "Ship", h: "85%" },
    { label: "Retro", h: "45%" },
  ];
  return (
    <>
      <div className="border-b border-border/50 bg-gradient-to-br from-accent-amber/15 via-surface to-accent/10 px-4 py-4 sm:px-5 sm:py-5">
        <div className="mb-3 flex items-center justify-between gap-2">
          <span className="font-display text-sm font-semibold tracking-tight text-foreground">
            CadenceApp
          </span>
          <span className="hidden items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-muted sm:flex">
            <Calendar className="h-3 w-3 text-accent-amber" aria-hidden />
            Ops rhythm
          </span>
        </div>
        <p className="font-display text-xl font-bold leading-tight tracking-tight text-foreground sm:text-2xl">
          Planning rhythm for teams that ship on schedule.
        </p>
        <p className="mt-1.5 max-w-md text-xs leading-relaxed text-muted sm:text-sm">
          See the week, own the plan, and keep delivery moving.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <MockCta>Open this week</MockCta>
          <MockGhost>View cadence</MockGhost>
        </div>
      </div>
      <div className="p-3 sm:p-4">
        <div className="rounded-xl border border-border/70 bg-background/70 p-3 sm:p-4">
          <div className="mb-3 flex gap-1">
            {days.map((d) => (
              <span
                key={d}
                className="flex-1 text-center font-mono text-[9px] uppercase tracking-wider text-muted"
              >
                {d}
              </span>
            ))}
          </div>
          <div className="flex h-20 items-end gap-1.5 sm:h-24 sm:gap-2">
            {blocks.map((b) => (
              <div key={b.label} className="flex flex-1 flex-col items-center gap-1.5">
                <div
                  className="w-full rounded-t-md bg-gradient-to-t from-accent to-accent/55"
                  style={{ height: b.h }}
                />
                <span className="text-[10px] font-medium text-foreground">{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function ConfiRentHome() {
  return (
    <>
      <div className="border-b border-border/50 bg-gradient-to-br from-accent-violet/15 via-surface to-accent/10 px-4 py-4 sm:px-5 sm:py-5">
        <div className="mb-3 flex items-center justify-between gap-2">
          <span className="font-display text-sm font-semibold tracking-tight text-foreground">
            ConfiRent
          </span>
          <span className="rounded-md border border-accent-amber/40 bg-accent-amber/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-accent-amber">
            Coming soon
          </span>
        </div>
        <p className="font-display text-xl font-bold leading-tight tracking-tight text-foreground sm:text-2xl">
          Rental ops with clearer trust.
        </p>
        <p className="mt-1.5 max-w-md text-xs leading-relaxed text-muted sm:text-sm">
          Hosts and renters see listings, deposits, and handoffs without the usual fog.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <MockCta>
            <Home className="mr-1.5 h-3 w-3" aria-hidden />
            Browse stays
          </MockCta>
          <MockGhost>Host a listing</MockGhost>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 p-3 sm:gap-3 sm:p-4">
        {["Westlands loft", "Kilimani studio"].map((place) => (
          <div
            key={place}
            className="overflow-hidden rounded-xl border border-border/70 bg-background/70"
          >
            <div className="flex h-16 items-end bg-gradient-to-br from-accent/10 via-surface to-accent-violet/15 p-2.5">
              <Home className="h-4 w-4 text-accent" aria-hidden />
            </div>
            <div className="p-2.5">
              <p className="text-xs font-medium text-foreground">{place}</p>
              <p className="mt-0.5 font-mono text-[9px] uppercase tracking-wider text-muted">
                Verified host
              </p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function TriviaYardHome() {
  return (
    <>
      <div className="border-b border-border/50 bg-gradient-to-br from-accent-amber/20 via-surface to-accent-warm/10 px-4 py-4 sm:px-5 sm:py-5">
        <div className="mb-3 flex items-center justify-between gap-2">
          <span className="font-display text-sm font-semibold tracking-tight text-foreground">
            TriviaYard
          </span>
          <span className="rounded-md border border-accent-amber/40 bg-accent-amber/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-accent-amber">
            Coming soon
          </span>
        </div>
        <p className="font-display text-xl font-bold leading-tight tracking-tight text-foreground sm:text-2xl">
          Live trivia. Audience play. Entertainment that sticks.
        </p>
        <p className="mt-1.5 max-w-md text-xs leading-relaxed text-muted sm:text-sm">
          Host a round, keep the room playing, and bring people back next week.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <MockCta>
            <Mic2 className="mr-1.5 h-3 w-3" aria-hidden />
            Start a round
          </MockCta>
          <MockGhost>Join as player</MockGhost>
        </div>
      </div>
      <div className="grid gap-2 p-3 sm:grid-cols-[1.15fr_0.85fr] sm:p-4">
        <div className="rounded-xl border border-border/70 bg-background/70 p-3">
          <p className="font-mono text-[9px] uppercase tracking-wider text-muted">Live question</p>
          <p className="mt-1.5 text-sm font-medium text-foreground">
            Which Nairobi neighbourhood is this skyline from?
          </p>
          <ul className="mt-2 grid grid-cols-2 gap-1.5">
            {["Westlands", "Kilimani", "Karen", "CBD"].map((opt, i) => (
              <li
                key={opt}
                className={`rounded-lg border px-2 py-1.5 text-[11px] ${
                  i === 0
                    ? "border-accent/40 bg-accent/10 text-foreground"
                    : "border-border/70 text-muted"
                }`}
              >
                {opt}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-border/70 bg-background/70 p-3">
          <div className="mb-2 flex items-center gap-1.5 text-accent-amber">
            <Trophy className="h-3.5 w-3.5" aria-hidden />
            <p className="font-mono text-[9px] uppercase tracking-wider">Leaderboard</p>
          </div>
          <ul className="space-y-1.5">
            {[
              { team: "The Beacons", pts: "420" },
              { team: "Nairobi Night", pts: "390" },
              { team: "Table 4", pts: "310" },
            ].map((row, i) => (
              <li key={row.team} className="flex items-center justify-between text-xs">
                <span className="text-foreground">
                  {i + 1}. {row.team}
                </span>
                <span className="font-mono text-[10px] text-muted">{row.pts}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}

function previewFor(id: Product["id"]) {
  switch (id) {
    case "lookfinesse":
      return <LookFinesseHome />;
    case "confilearn":
      return <ConfiLearnHome />;
    case "cadenceapp":
      return <CadenceAppHome />;
    case "confirent":
      return <ConfiRentHome />;
    case "triviayard":
      return <TriviaYardHome />;
    default:
      return <LookFinesseHome />;
  }
}

export function ProductLandingPreview({ product }: { product: Product }) {
  return (
    <div aria-hidden>
      <BrowserChrome product={product}>{previewFor(product.id)}</BrowserChrome>
    </div>
  );
}
