import { BookOpen, Calendar, Home, Play } from "lucide-react";
import type { PlaceholderKind } from "@/data/product-screens";

/**
 * Compact device-frame UI chrome for wings without a live screenshot yet.
 * Tasteful panels — not wordmarks or giant logos.
 */
export function ProductPlaceholderPanel({ kind }: { kind: PlaceholderKind }) {
  switch (kind) {
    case "confilearn":
      return <ConfiLearnPanel />;
    case "cadenceapp":
      return <CadenceAppPanel />;
    case "confirent":
      return <ConfiRentPanel />;
  }
}

function ConfiLearnPanel() {
  return (
    <div className="flex h-full flex-col bg-gradient-to-br from-accent/12 via-surface to-accent-violet/10">
      <div className="flex items-center justify-between border-b border-border/50 px-3 py-2">
        <span className="inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-wider text-muted">
          <BookOpen className="h-3 w-3 text-accent" aria-hidden />
          Live class
        </span>
        <span className="rounded-md border border-border/60 bg-background/50 px-1.5 py-0.5 font-mono text-[9px] text-muted">
          Studio preview
        </span>
      </div>
      <div className="grid flex-1 grid-cols-[1.2fr_0.8fr] gap-2 p-2.5">
        <div className="flex flex-col overflow-hidden rounded-xl border border-border/70 bg-background/55">
          <div className="relative flex flex-1 items-center justify-center bg-gradient-to-br from-accent-violet/25 via-surface to-accent/15">
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-accent/40 bg-accent/20 text-accent">
              <Play className="ml-0.5 h-3.5 w-3.5" fill="currentColor" aria-hidden />
            </span>
          </div>
          <div className="space-y-1.5 p-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-[11px] font-medium text-foreground">
                Module 3 · Tutoring
              </span>
              <span className="font-mono text-[9px] text-accent">62%</span>
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-border/60">
              <div className="h-full w-[62%] rounded-full bg-accent" />
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          {[
            { label: "Streak", value: "7 days" },
            { label: "Payout", value: "M-Pesa" },
            { label: "Certs", value: "2" },
          ].map((s) => (
            <div
              key={s.label}
              className="flex-1 rounded-xl border border-border/70 bg-background/55 px-2.5 py-2"
            >
              <p className="font-mono text-[8px] uppercase tracking-wider text-muted">{s.label}</p>
              <p className="mt-0.5 text-xs font-semibold text-foreground">{s.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CadenceAppPanel() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const heights = ["40%", "70%", "55%", "85%", "45%"];
  return (
    <div className="flex h-full flex-col bg-gradient-to-br from-accent-amber/12 via-surface to-accent/10">
      <div className="flex items-center justify-between border-b border-border/50 px-3 py-2">
        <span className="inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-wider text-muted">
          <Calendar className="h-3 w-3 text-accent-amber" aria-hidden />
          This week
        </span>
        <span className="rounded-md border border-border/60 bg-background/50 px-1.5 py-0.5 font-mono text-[9px] text-muted">
          Studio preview
        </span>
      </div>
      <div className="flex flex-1 flex-col p-3">
        <div className="flex flex-1 flex-col rounded-xl border border-border/70 bg-background/55 p-3">
          <div className="mb-2 flex gap-1">
            {days.map((d) => (
              <span
                key={d}
                className="flex-1 text-center font-mono text-[8px] uppercase tracking-wider text-muted"
              >
                {d}
              </span>
            ))}
          </div>
          <div className="flex flex-1 items-end gap-1.5">
            {heights.map((h, i) => (
              <div
                key={days[i]}
                className="w-full rounded-t-md bg-gradient-to-t from-accent to-accent/50"
                style={{ height: h }}
              />
            ))}
          </div>
          <div className="mt-2 flex justify-between font-mono text-[8px] uppercase tracking-wider text-muted">
            <span>Plan</span>
            <span>Ship</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConfiRentPanel() {
  return (
    <div className="flex h-full flex-col bg-gradient-to-br from-accent-violet/12 via-surface to-accent/10">
      <div className="flex items-center justify-between border-b border-border/50 px-3 py-2">
        <span className="inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-wider text-muted">
          <Home className="h-3 w-3 text-accent-violet" aria-hidden />
          Listings
        </span>
        <span className="rounded-md border border-accent-amber/40 bg-accent-amber/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-accent-amber">
          Coming soon
        </span>
      </div>
      <div className="grid flex-1 grid-cols-2 gap-2 p-2.5">
        {[
          { place: "Westlands loft", note: "Deposit tracked" },
          { place: "Kilimani studio", note: "Verified host" },
        ].map((item) => (
          <div
            key={item.place}
            className="flex flex-col overflow-hidden rounded-xl border border-border/70 bg-background/55"
          >
            <div className="flex flex-1 items-end bg-gradient-to-br from-accent/10 via-surface to-accent-violet/20 p-2">
              <span className="rounded-md border border-border/60 bg-surface/80 px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-wider text-muted">
                {item.note}
              </span>
            </div>
            <p className="truncate px-2 py-2 text-[11px] font-medium text-foreground">{item.place}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
