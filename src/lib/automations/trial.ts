/** One free month for every new automation signup. Change the length here only. */
export const TRIAL_DAYS = 30;

export const TRIAL_REMINDER_DAYS = [7, 3, 1] as const;
export type TrialReminderDay = (typeof TRIAL_REMINDER_DAYS)[number];

const DAY_MS = 24 * 60 * 60 * 1000;

export type TrialState = {
  start: string;
  endsAt: string;
  remindersSent: number[];
  endedAt?: string;
  paidUntil?: string;
};

export function trialWindow(start: Date): { start: string; endsAt: string } {
  return {
    start: start.toISOString(),
    endsAt: new Date(start.getTime() + TRIAL_DAYS * DAY_MS).toISOString(),
  };
}

/** Whole days left, rounded up. Zero once the end time has passed. */
export function trialDaysRemaining(endsAt: string, now = new Date()): number {
  const end = Date.parse(endsAt);
  if (Number.isNaN(end)) return 0;
  const ms = end - now.getTime();
  if (ms <= 0) return 0;
  return Math.ceil(ms / DAY_MS);
}

/**
 * The tightest reminder that is due and not yet sent.
 * Missed earlier reminders are skipped so a late tick does not send all three.
 */
export function nextTrialReminder(remindersSent: number[], daysLeft: number): TrialReminderDay | null {
  if (daysLeft <= 0) return null;
  const pending = TRIAL_REMINDER_DAYS.filter((day) => daysLeft <= day && !remindersSent.includes(day));
  if (pending.length === 0) return null;
  return pending[pending.length - 1] ?? null;
}

/** Mark the chosen reminder and any looser one that this send replaces. */
export function markTrialReminder(remindersSent: number[], chosen: TrialReminderDay): number[] {
  const next = new Set(remindersSent);
  for (const day of TRIAL_REMINDER_DAYS) {
    if (day >= chosen) next.add(day);
  }
  return [...next];
}

export function extendTrialEnd(endsAt: string, days: number, now = new Date()): string {
  const current = Date.parse(endsAt);
  const base = Number.isNaN(current) || current < now.getTime() ? now.getTime() : current;
  return new Date(base + Math.max(1, days) * DAY_MS).toISOString();
}

export function trialHasEnded(trial: TrialState | undefined, now = new Date()): boolean {
  if (!trial?.endsAt) return false;
  if (trial.paidUntil && Date.parse(trial.paidUntil) > now.getTime()) return false;
  return Date.parse(trial.endsAt) <= now.getTime();
}

/** Paid access starts when the trial ends, or now if the trial is already over. */
export function paidUntilFromTrial(trialEndsAt: string | undefined, billingDays: number, now = new Date()): string {
  const trialEnd = trialEndsAt ? Date.parse(trialEndsAt) : Number.NaN;
  const start = Number.isNaN(trialEnd) ? now.getTime() : Math.max(trialEnd, now.getTime());
  return new Date(start + billingDays * DAY_MS).toISOString();
}
