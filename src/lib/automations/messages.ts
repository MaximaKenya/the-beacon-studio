import { nairobiDateKey } from "@/lib/time";

export function paymentReminderText(input: {
  step: number;
  escalate: boolean;
  name: string;
  amountKes: number;
  dueDate?: string;
  notice?: string;
  payUrl?: string;
}): string {
  const amount = `KES ${input.amountKes.toLocaleString("en-KE")}`;
  const due = input.dueDate ? ` on ${input.dueDate}` : "";
  const name = input.name || "there";
  const ladder = input.escalate
    ? [
        `Hello ${name}, a payment of ${amount} is coming due${due}.`,
        `Hello ${name}, ${amount} is now due. Please pay so we can close it.`,
        `Hello ${name}, this is a final reminder for ${amount}.`,
      ]
    : [
        `Hello ${name}, a payment of ${amount} is coming due${due}.`,
        `Hello ${name}, ${amount} is now due. Please pay so we can close it.`,
        `Hello ${name}, this is a follow-up. ${amount} is still open.`,
      ];
  const index = Math.min(Math.max(input.step, 0), ladder.length - 1);
  const notice = input.notice?.trim();
  const pay = input.payUrl ? `\nPay: ${input.payUrl}` : "\nReply to this message if you need an invoice.";
  return `${ladder[index]}${notice ? `\n${notice}` : ""}${pay}`;
}

/** Every comma, semicolon, or newline separated recipient. Falls back to one address. */
export function splitRecipients(value: string, fallback = ""): string[] {
  const parts = value
    .split(/[,;\n]/)
    .map((part) => part.trim())
    .filter(Boolean);
  const list = parts.length > 0 ? parts : fallback.trim() ? [fallback.trim()] : [];
  return [...new Set(list)];
}

export function isEmailAddress(value: string): boolean {
  return value.includes("@");
}

/** First custom reminder is due on the next tick, not one full period later. */
export function initialCustomReminderAt(now: Date): string {
  return now.toISOString();
}

export function recurrenceDays(recurrence: string): number {
  if (recurrence === "daily") return 1;
  if (recurrence === "monthly") return 30;
  return 7;
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function nairobiParts(date: Date): { year: number; month: number; day: number } {
  const key = nairobiDateKey(date);
  const [year, month, day] = key.split("-").map((part) => Number(part));
  return { year: year || 1970, month: month || 1, day: day || 1 };
}

/** Next 08:00 Africa/Nairobi on that month and day, strictly after `from`. */
export function nextYearlyIso(dateValue: string, from: Date): string | null {
  const match = /(\d{4})-(\d{2})-(\d{2})/.exec(dateValue.trim());
  if (!match) return null;
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const startYear = nairobiParts(from).year;
  for (let year = startYear; year <= startYear + 2; year += 1) {
    const candidateDay = month === 2 && day === 29 ? 28 : day;
    const at = Date.parse(`${year}-${pad(month)}-${pad(month === 2 && day === 29 ? candidateDay : day)}T08:00:00+03:00`);
    if (Number.isNaN(at)) continue;
    const parts = nairobiParts(new Date(at));
    if (parts.month !== month) continue;
    if (at > from.getTime()) return new Date(at).toISOString();
  }
  return null;
}
