import { siteConfig } from "@/data/site";

export type BookedSlot = { date: string; time: string };

const TZ = siteConfig.booking.timezone;

export function formatDateKey(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const y = parts.find((p) => p.type === "year")?.value ?? "0000";
  const m = parts.find((p) => p.type === "month")?.value ?? "01";
  const d = parts.find((p) => p.type === "day")?.value ?? "01";
  return `${y}-${m}-${d}`;
}

export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function getMonthDays(year: number, month: number): Date[] {
  const days: Date[] = [];
  const date = new Date(year, month, 1);
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
}

export function isDayAvailable(date: Date): boolean {
  const { availableDays } = siteConfig.booking;
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    weekday: "short",
  }).format(date);
  const dayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  const day = dayMap[weekday] ?? date.getDay();
  return (availableDays as readonly number[]).includes(day);
}

export function getNowInTimezone(): { dateKey: string; minutes: number } {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);

  const dateKey = `${parts.find((p) => p.type === "year")?.value}-${parts.find((p) => p.type === "month")?.value}-${parts.find((p) => p.type === "day")?.value}`;
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? 0);

  return { dateKey, minutes: hour * 60 + minute };
}

export function formatTimeDisplay(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const ref = new Date(
    `${getNowInTimezone().dateKey}T${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00+03:00`
  );
  return new Intl.DateTimeFormat("en-KE", {
    timeZone: TZ,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(ref);
}

export function formatDateDisplay(
  dateKey: string,
  options?: Intl.DateTimeFormatOptions
): string {
  const date = parseDateKey(dateKey);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    ...options,
  });
}

export function getTimezoneLabel(): string {
  return "East Africa Time (EAT)";
}

export function generateTimeSlots(dateKey: string, booked: BookedSlot[]): string[] {
  const { hoursStart, hoursEnd, slotDuration } = siteConfig.booking;
  const [startH, startM] = hoursStart.split(":").map(Number);
  const [endH, endM] = hoursEnd.split(":").map(Number);
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;
  const slots: string[] = [];

  const { dateKey: todayKey, minutes: nowMinutes } = getNowInTimezone();
  const isToday = dateKey === todayKey;

  for (let m = startMinutes; m + slotDuration <= endMinutes; m += slotDuration) {
    if (isToday && m <= nowMinutes) continue;

    const h = Math.floor(m / 60);
    const min = m % 60;
    const time = `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
    const taken = booked.some((b) => b.date === dateKey && b.time === time);
    if (!taken) slots.push(time);
  }

  return slots;
}

export function generateICS(params: {
  date: string;
  time: string;
  durationMinutes: number;
  title: string;
  description: string;
  organizerEmail: string;
  attendeeEmail: string;
  attendeeName: string;
}): string {
  const start = new Date(`${params.date}T${params.time}:00+03:00`);
  const end = new Date(start.getTime() + params.durationMinutes * 60_000);

  const fmt = (d: Date) =>
    d
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "");

  const uid = `${Date.now()}@${siteConfig.seo.siteUrl.replace(/^https?:\/\//, "")}`;

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Portfolio//Booking//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:REQUEST",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:${params.title}`,
    `DESCRIPTION:${params.description.replace(/\n/g, "\\n")}`,
    `ORGANIZER;CN=${siteConfig.brand.name}:mailto:${params.organizerEmail}`,
    `ATTENDEE;CN=${params.attendeeName}:mailto:${params.attendeeEmail}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}
