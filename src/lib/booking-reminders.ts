import { readBookings, sendBookingClientEmail, writeBookings, type BookingMailKind, type ClientBooking } from "@/lib/booking-mail";
import { nairobiStart } from "@/lib/booking-calendar";
import { durationForMeeting } from "@/lib/booking-utils";

const HOUR = 60 * 60 * 1000;
const SKIP = new Set(["declined", "cancelled", "closed"]);

export function reminderKind(
  booking: ClientBooking,
  nowMs: number
): Extract<BookingMailKind, "reminder-24h" | "reminder-1h" | "follow-up"> | null {
  if (!booking.date || !booking.time || !booking.id) return null;
  const status = (booking.status || "pending").toLowerCase();
  const start = nairobiStart(booking.date, booking.time).getTime();
  if (Number.isNaN(start)) return null;
  const duration = booking.durationMinutes || durationForMeeting(booking.meetingType || "intro");
  const end = start + duration * 60_000;
  const until = start - nowMs;
  if (!SKIP.has(status) && until <= HOUR && until > 0 && !booking.reminder1SentAt) return "reminder-1h";
  if (!SKIP.has(status) && until <= 24 * HOUR && until > HOUR && !booking.reminder24SentAt) return "reminder-24h";
  if (
    !booking.followUpOptOut &&
    !booking.followUpSentAt &&
    !SKIP.has(status) &&
    status !== "reschedule" &&
    nowMs >= end + 30 * 60 * 1000
  ) {
    return "follow-up";
  }
  return null;
}

export async function runBookingReminders(now = new Date()): Promise<{ sent: number; due: number }> {
  const rows = await readBookings();
  let sent = 0;
  let due = 0;
  let changed = false;
  const stamp = now.toISOString();
  for (const booking of rows) {
    const kind = reminderKind(booking, now.getTime());
    if (!kind || !booking.id) continue;
    due += 1;
    const result = await sendBookingClientEmail(booking, kind, undefined, `booking-${kind}/${booking.id}`);
    if (!result.emailed) continue;
    if (kind === "reminder-24h") booking.reminder24SentAt = stamp;
    if (kind === "reminder-1h") booking.reminder1SentAt = stamp;
    if (kind === "follow-up") booking.followUpSentAt = stamp;
    changed = true;
    sent += 1;
  }
  if (changed) await writeBookings(rows);
  return { sent, due };
}
