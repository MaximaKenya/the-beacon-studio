/** Africa/Nairobi (EAT, UTC+3) helpers for display + filenames. */

export const NAIROBI_TZ = "Africa/Nairobi";

export function formatNairobi(
  d: Date | string = new Date(),
  opts?: Intl.DateTimeFormatOptions
): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: NAIROBI_TZ,
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    ...opts,
  }).format(date);
}

/** User-facing appointment time. Always Africa/Nairobi, never a raw UTC string. */
export function formatBookingWhen(d: Date | string): string {
  return `${formatNairobi(d, { second: undefined })} (Africa/Nairobi)`;
}

export function formatNairobiDate(d: Date | string = new Date()): string {
  return formatNairobi(d, {
    hour: undefined,
    minute: undefined,
    second: undefined,
  });
}

/** YYYY-MM-DD in Africa/Nairobi. Date inputs and lead filters use this. */
export function nairobiDateKey(d: Date | string = new Date()): string {
  const date = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return "";
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: NAIROBI_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  const year = get("year");
  const month = get("month");
  const day = get("day");
  if (!year || !month || !day) return "";
  return `${year}-${month}-${day}`;
}

/** Compact stamp for filenames: YYYYMMDD */
export function fileDateStamp(d: Date | string = new Date()): string {
  const date = typeof d === "string" ? new Date(d) : d;
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: NAIROBI_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "00";
  return `${get("year")}${get("month")}${get("day")}`;
}

export function addDaysIso(days: number, from = new Date()): string {
  const d = new Date(from);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString();
}

export function daysUntil(iso: string, from = new Date()): number {
  const target = new Date(iso).getTime();
  const now = from.getTime();
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
}

export function slugifyFilename(value: string): string {
  return (
    value
      .trim()
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "client"
  );
}
