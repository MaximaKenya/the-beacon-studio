import { Check, Clock, Inbox } from "lucide-react";
import { BeaconMark } from "@/components/brand/BeaconMark";

const ARRIVALS = ["Lead", "Message", "Invoice"] as const;

const ACTIONS = [
  "CRM updated",
  "Reply drafted",
  "WhatsApp / email sent",
  "Report generated",
] as const;

const FLOW_LABEL =
  "Workflow: a lead, message, or invoice arrives. Beacon AI classifies it and extracts the details. Actions then run: the CRM is updated, a reply is drafted, WhatsApp or email is sent, and a report is generated. Example outcome: hours saved.";

export function HeroAutomationFlow() {
  return (
    <div className="relative mx-auto w-full max-w-lg" role="img" aria-label={FLOW_LABEL}>
      <div className="hero-flow-wash" aria-hidden />
      <div className="sleek-card relative overflow-hidden rounded-[2rem] p-4 sm:p-5" aria-hidden>
        <div className="hero-flow-spine" />
        <div className="relative flex flex-col gap-3 pl-8">
          <article className="hero-flow-step p-4">
            <div className="flex items-center gap-2 text-accent">
              <Inbox className="h-4 w-4" aria-hidden />
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em]">Arrives</p>
            </div>
            <ul className="mt-3 flex flex-wrap gap-2">
              {ARRIVALS.map((item) => (
                <li key={item} className="hero-flow-chip">
                  {item}
                </li>
              ))}
            </ul>
          </article>

          <article className="hero-flow-step hero-flow-step-ai p-4">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-accent text-background shadow-[0_10px_24px_color-mix(in_srgb,var(--accent)_32%,transparent)]">
                <BeaconMark size={22} variant="mono" className="text-background" />
              </span>
              <div>
                <p className="font-display text-base font-semibold text-heading">Beacon AI</p>
                <p className="mt-1 text-sm leading-relaxed text-muted">
                  Classifies the message and extracts the details.
                </p>
              </div>
            </div>
          </article>

          <article className="hero-flow-step p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
              Actions run
            </p>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {ACTIONS.map((action) => (
                <li key={action} className="hero-flow-action">
                  <Check className="h-3.5 w-3.5 text-accent" aria-hidden />
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="hero-flow-step hero-flow-outcome p-4">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
                  <Clock className="h-3.5 w-3.5" aria-hidden />
                  Example outcome
                </p>
                <p className="mt-2 font-display text-4xl font-semibold tracking-tight text-heading">
                  12
                  <span className="ml-1 text-2xl text-accent">h</span>
                </p>
              </div>
              <p className="max-w-[9rem] text-right text-sm leading-snug text-muted">
                Hours saved on one workflow.
              </p>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
