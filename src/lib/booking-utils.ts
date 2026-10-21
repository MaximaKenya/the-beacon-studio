import { siteConfig } from "@/data/site";
import { buildBookingIcs } from "@/lib/booking-calendar";

export type BookedSlot = { date: string; time: string; durationMinutes?: number };

export function durationForMeeting(meetingType: string): number {
  const meeting =
    siteConfig.booking.meetingTypes.find((item) => item.id === meetingType) ??
    siteConfig.booking.meetingTypes.find((item) => item.label === meetingType);
  return meeting?.duration ?? siteConfig.booking.slotDuration;
}

export function clockMinutes(time: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time);
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > 23 || minute > 59) return null;
  return hour * 60 + minute;
}

export function rangesOverlap(startA: number, durationA: number, startB: number, durationB: number): boolean {
  return startA < startB + durationB && startB < startA + durationA;
}

export function slotTaken(
  booked: BookedSlot[],
  date: string,
  time: string,
  durationMinutes: number
): boolean {
  const start = clockMinutes(time);
  if (start === null) return true;
  return booked.some((slot) => {
    if (slot.date !== date) return false;
    const other = clockMinutes(slot.time);
    if (other === null) return false;
    return rangesOverlap(
      start,
      durationMinutes,
      other,
      slot.durationMinutes ?? siteConfig.booking.slotDuration
    );
  });
}

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

export function generateTimeSlots(
  dateKey: string,
  booked: BookedSlot[],
  duration: number = siteConfig.booking.slotDuration
): string[] {
  const { hoursStart, hoursEnd } = siteConfig.booking;
  const slotDuration = duration;
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
    if (!slotTaken(booked, dateKey, time, slotDuration)) slots.push(time);
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
  id?: string;
  sequence?: number;
  location?: string;
  url?: string;
}): string {
  return buildBookingIcs({
    id: params.id,
    date: params.date,
    time: params.time,
    durationMinutes: params.durationMinutes,
    title: params.title,
    description: params.description,
    location: params.location,
    url: params.url,
    organizerEmail: params.organizerEmail,
    attendeeEmail: params.attendeeEmail,
    attendeeName: params.attendeeName,
    sequence: params.sequence,
    method: "REQUEST",
  });
}
