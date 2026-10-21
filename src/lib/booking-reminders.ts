import { BOOKING_FILE, readBookings, sendBookingClientEmail, type BookingMailKind, type ClientBooking } from "@/lib/booking-mail";
import { nairobiStart } from "@/lib/booking-calendar";
import { durationForMeeting } from "@/lib/booking-utils";
import { mutateJsonFile } from "@/lib/storage";
import { claimIsFresh } from "@/lib/tick-claim";

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

function claimKey(kind: "reminder-24h" | "reminder-1h" | "follow-up"): "reminder24ClaimAt" | "reminder1ClaimAt" | "followUpClaimAt" {
  if (kind === "reminder-24h") return "reminder24ClaimAt";
  if (kind === "reminder-1h") return "reminder1ClaimAt";
  return "followUpClaimAt";
}

function markSent(booking: ClientBooking, kind: "reminder-24h" | "reminder-1h" | "follow-up", stamp: string) {
  if (kind === "reminder-24h") booking.reminder24SentAt = stamp;
  if (kind === "reminder-1h") booking.reminder1SentAt = stamp;
  if (kind === "follow-up") booking.followUpSentAt = stamp;
}

export async function runBookingReminders(now = new Date()): Promise<{ sent: number; due: number }> {
  const rows = await readBookings();
  let sent = 0;
  let due = 0;
  const stamp = now.toISOString();
  for (const booking of rows) {
    const kind = reminderKind(booking, now.getTime());
    if (!kind || !booking.id) continue;
    due += 1;
    const id = booking.id;
    let claimed = false;
    await mutateJsonFile<ClientBooking[]>(BOOKING_FILE, [], (current) => {
      claimed = false;
      const row = current.find((item) => item.id === id);
      if (!row || reminderKind(row, now.getTime()) !== kind) return current;
      if (claimIsFresh(row[claimKey(kind)], now.getTime())) return current;
      row[claimKey(kind)] = stamp;
      claimed = true;
      return current;
    });
    if (!claimed) continue;
    const result = await sendBookingClientEmail(booking, kind, undefined, `booking-${kind}/${id}`);
    if (!result.emailed) continue;
    await mutateJsonFile<ClientBooking[]>(BOOKING_FILE, [], (current) => {
      const row = current.find((item) => item.id === id);
      if (row) markSent(row, kind, stamp);
      return current;
    });
    sent += 1;
  }
  return { sent, due };
}
