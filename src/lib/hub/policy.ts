/** Platform rules for the messaging hub. Pure functions; times are EAT (UTC+3, no DST). */

export type Channel = "sms" | "whatsapp";
export type Category = "utility" | "marketing" | "authentication" | "collection";
export const CHANNELS: Channel[] = ["sms", "whatsapp"];
export const CATEGORIES: Category[] = ["utility", "marketing", "authentication", "collection"];

export type PolicyConfig = {
  /** Collection window, EAT hours [start, end). */
  collectionStartHour: number;
  collectionEndHour: number;
  /** 0=Sun..6=Sat */
  collectionDays: number[];
  collectionPerDebtorPerDay: number;
  collectionPerDebtorPerWeek: number;
  /** Requests per minute per app. */
  appRatePerMinute: number;
  /** Extra YYYY-MM-DD dates (Eid, gazetted one-offs). */
  extraHolidays: string[];
};

export const DEFAULT_POLICY: PolicyConfig = {
  collectionStartHour: 8,
  collectionEndHour: 19,
  collectionDays: [1, 2, 3, 4, 5, 6],
  collectionPerDebtorPerDay: 1,
  collectionPerDebtorPerWeek: 3,
  appRatePerMinute: 120,
  extraHolidays: [],
};

const EAT_OFFSET_MS = 3 * 3600_000;

export function eatParts(now: Date): { y: number; m: number; d: number; hour: number; dow: number; ymd: string } {
  const e = new Date(now.getTime() + EAT_OFFSET_MS);
  const y = e.getUTCFullYear();
  const m = e.getUTCMonth() + 1;
  const d = e.getUTCDate();
  return { y, m, d, hour: e.getUTCHours(), dow: e.getUTCDay(), ymd: ymd(y, m, d) };
}

function ymd(y: number, m: number, d: number): string {
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function easterSunday(y: number): Date {
  const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4;
  const f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(Date.UTC(y, month - 1, day));
}

/** Kenyan public holidays (fixed + Easter) with Sunday→Monday substitution. Eid dates go in extraHolidays. */
export function kenyanHolidays(y: number, extra: string[] = []): Set<string> {
  const out = new Set<string>();
  const fixed: Array<[number, number]> = [[1, 1], [5, 1], [6, 1], [10, 10], [10, 20], [12, 12], [12, 25], [12, 26]];
  for (const [m, d] of fixed) {
    out.add(ymd(y, m, d));
    const dt = new Date(Date.UTC(y, m - 1, d));
    if (dt.getUTCDay() === 0) {
      const next = new Date(dt.getTime() + 86_400_000);
      // Boxing Day after a Sunday Christmas lands on Tuesday.
      if (out.has(ymd(next.getUTCFullYear(), next.getUTCMonth() + 1, next.getUTCDate()))) next.setUTCDate(next.getUTCDate() + 1);
      out.add(ymd(next.getUTCFullYear(), next.getUTCMonth() + 1, next.getUTCDate()));
    }
  }
  const easter = easterSunday(y);
  for (const off of [-2, 1]) {
    const dt = new Date(easter.getTime() + off * 86_400_000);
    out.add(ymd(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate()));
  }
  for (const x of extra) out.add(x);
  return out;
}

export function collectionWindowOpen(now: Date, cfg: PolicyConfig = DEFAULT_POLICY): { ok: boolean; reason?: string } {
  const p = eatParts(now);
  if (!cfg.collectionDays.includes(p.dow)) return { ok: false, reason: "collection_outside_days" };
  if (kenyanHolidays(p.y, cfg.extraHolidays).has(p.ymd)) return { ok: false, reason: "collection_public_holiday" };
  if (p.hour < cfg.collectionStartHour || p.hour >= cfg.collectionEndHour) return { ok: false, reason: "collection_outside_hours" };
  return { ok: true };
}

/** Collection caps per debtor (app + number), counting accepted collection messages. */
export function collectionCapReason(
  previousAt: string[],
  now: Date,
  cfg: PolicyConfig = DEFAULT_POLICY
): string | undefined {
  const today = eatParts(now).ymd;
  const weekAgo = now.getTime() - 7 * 86_400_000;
  const day = previousAt.filter((t) => eatParts(new Date(t)).ymd === today).length;
  if (day >= cfg.collectionPerDebtorPerDay) return "collection_daily_cap";
  const week = previousAt.filter((t) => new Date(t).getTime() > weekAgo).length;
  if (week >= cfg.collectionPerDebtorPerWeek) return "collection_weekly_cap";
  return undefined;
}

/** E.164; Kenyan local forms (07.., 01.., 7..., 254...) normalise to +254. */
export function normalizePhone(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const raw = input.trim().replace(/[\s()-]/g, "");
  let digits: string;
  if (raw.startsWith("+")) digits = raw.slice(1);
  else if (/^0[17]\d{8}$/.test(raw)) digits = `254${raw.slice(1)}`;
  else if (/^[17]\d{8}$/.test(raw)) digits = `254${raw}`;
  else digits = raw;
  if (!/^[1-9]\d{7,14}$/.test(digits)) return null;
  if (digits.startsWith("254") && !/^254[17]\d{8}$/.test(digits)) return null;
  return `+${digits}`;
}

/** Approximate Kenyan network from prefix; "other" when unknown or non-KE. */
export function kenyanNetwork(e164: string): "safaricom" | "airtel" | "other" {
  const m = e164.match(/^\+254(\d{3})/);
  if (!m) return "other";
  const p = Number(m[1]);
  if ((p >= 700 && p <= 729) || (p >= 740 && p <= 748) || (p >= 757 && p <= 759) || p === 768 || p === 769 || (p >= 790 && p <= 799) || p === 110 || p === 111) return "safaricom";
  if ((p >= 730 && p <= 739) || (p >= 750 && p <= 756) || p === 762 || (p >= 780 && p <= 789) || (p >= 100 && p <= 102)) return "airtel";
  return "other";
}
