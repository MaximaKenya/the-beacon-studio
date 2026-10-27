import { trialDaysRemaining } from "@/lib/automations/trial";

/**
 * Trial-to-paid nurture. Day 0 is the existing welcome (now with a setup checklist).
 * Days 7 and 21 send a usage digest. "keep" goes out 3 days before the end and
 * replaces the 3-day reminder so owners never get two notes on one day.
 */
export type TrialStage = "digest-7" | "digest-21" | "keep";

export const KEEP_DAYS_LEFT = 3;
const DAY_MS = 86_400_000;

export function trialDayNumber(start: string, now: Date) {
  return Math.floor((now.getTime() - Date.parse(start)) / DAY_MS);
}

export function nextTrialStage(
  trial: { start: string; endsAt: string; stagesSent?: TrialStage[]; endedAt?: string; paidUntil?: string },
  now: Date
): TrialStage | null {
  if (trial.endedAt || trial.paidUntil) return null;
  const sent = new Set(trial.stagesSent || []);
  const left = trialDaysRemaining(trial.endsAt, now);
  if (left <= 0) return null;
  if (left <= KEEP_DAYS_LEFT) {
    // At 1 day left the existing last-day reminder is enough.
    if (left <= 1 || sent.has("keep")) return null;
    return "keep";
  }
  const day = trialDayNumber(trial.start, now);
  if (day >= 21 && !sent.has("digest-21")) return "digest-21";
  if (day >= 7 && day < 21 && !sent.has("digest-7")) return "digest-7";
  return null;
}

/** Recording a stage also retires stages it supersedes, so a late tick never back-fills. */
export function markTrialStage(sent: TrialStage[] | undefined, stage: TrialStage): TrialStage[] {
  const next = new Set(sent || []);
  next.add(stage);
  if (stage === "digest-21" || stage === "keep") next.add("digest-7");
  if (stage === "keep") next.add("digest-21");
  return [...next];
}

export type TrialPortalStage = "setup" | "running" | "ending" | "ended" | "paid";

export function trialPortalStage(
  trial: { start: string; endsAt: string; endedAt?: string; paidUntil?: string },
  now: Date
): TrialPortalStage {
  if (trial.paidUntil) return "paid";
  if (trial.endedAt) return "ended";
  const left = trialDaysRemaining(trial.endsAt, now);
  if (left <= 0) return "ended";
  if (left <= 7) return "ending";
  return trialDayNumber(trial.start, now) < 7 ? "setup" : "running";
}

export const TRIAL_STAGE_LABEL: Record<TrialPortalStage, string> = {
  setup: "Week 1 · setup",
  running: "Running",
  ending: "Ending soon",
  ended: "Ended",
  paid: "Paid",
};
