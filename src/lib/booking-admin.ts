import { sendBookingClientEmail, type BookingMailKind, type ClientBooking } from "@/lib/booking-mail";
import { captureLead } from "@/lib/leads";
import { readJsonFile, writeJsonFile } from "@/lib/storage";

export const BOOKING_STATUSES = [
  "pending",
  "confirmed",
  "reschedule",
  "declined",
  "cancelled",
  "completed",
  "closed",
  "converted",
] as const;

export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export type BookingRecord = {
  id?: string;
  date?: string;
  time?: string;
  durationMinutes?: number;
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
  meetingType?: string;
  source?: string;
  status?: string;
  read?: boolean;
  replied?: boolean;
  adminNotes?: string;
  rescheduleNote?: string;
  meetingUrl?: string;
  calendarSequence?: number;
  reminder24SentAt?: string;
  reminder1SentAt?: string;
  followUpSentAt?: string;
  followUpOptOut?: boolean;
  convertedToLead?: boolean;
  createdAt?: string;
};

const FILE = "bookings.json";

export function isBookingStatus(value: string): value is BookingStatus {
  return (BOOKING_STATUSES as readonly string[]).includes(value);
}

export type BookingPatch = {
  status?: string;
  adminNotes?: string;
  rescheduleNote?: string;
  date?: string;
  time?: string;
  /** Mark read and close a still-pending booking. */
  close?: boolean;
};

async function readBookings(): Promise<BookingRecord[]> {
  const rows = await readJsonFile<BookingRecord[]>(FILE, []);
  return Array.isArray(rows) ? rows : [];
}

function mailKind(status: string): BookingMailKind | null {
  if (status === "confirmed") return "confirmed";
  if (status === "reschedule") return "reschedule";
  if (status === "declined") return "declined";
  if (status === "cancelled") return "cancelled";
  return null;
}

async function emailBookingStatus(booking: BookingRecord, status: string): Promise<{ emailed: boolean; emailNote: string }> {
  const kind = mailKind(status);
  if (!kind) return { emailed: false, emailNote: "" };
  const when = [booking.date, booking.time].filter(Boolean).join(" ");
  const result = await sendBookingClientEmail(
    booking as ClientBooking,
    kind,
    undefined,
    `booking-${status}/${booking.id}/${booking.calendarSequence || 0}/${booking.rescheduleNote || when || "update"}`
  );
  return { emailed: result.emailed, emailNote: result.emailNote };
}

export async function updateBookingAdmin(
  id: string,
  patch: BookingPatch
): Promise<{ booking: BookingRecord; emailed: boolean; emailNote: string } | null> {
  if (!id) return null;
  const bookings = await readBookings();
  const idx = bookings.findIndex((row) => row.id === id);
  if (idx < 0) return null;
  const current = bookings[idx];
  const previous = current.status || "pending";
  if (typeof patch.adminNotes === "string") current.adminNotes = patch.adminNotes;
  if (typeof patch.rescheduleNote === "string") current.rescheduleNote = patch.rescheduleNote;
  const nextDate = typeof patch.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(patch.date) ? patch.date : current.date;
  const nextTime = typeof patch.time === "string" && /^\d{2}:\d{2}$/.test(patch.time) ? patch.time : current.time;
  const moved = nextDate !== current.date || nextTime !== current.time || patch.status === "reschedule";
  if (typeof patch.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(patch.date)) current.date = patch.date;
  if (typeof patch.time === "string" && /^\d{2}:\d{2}$/.test(patch.time)) current.time = patch.time;
  if (moved) current.calendarSequence = (current.calendarSequence || 0) + 1;
  if (patch.close) {
    current.read = true;
    if (!current.status || current.status === "pending" || current.status === "new") current.status = "closed";
  }
  if (patch.status && isBookingStatus(patch.status)) current.status = patch.status;
  current.read = true;
  bookings[idx] = current;
  await writeJsonFile(FILE, bookings);
  const next = current.status || previous;
  const mail =
    next !== previous && (next === "confirmed" || next === "declined" || next === "cancelled" || next === "reschedule")
      ? await emailBookingStatus(current, next)
      : { emailed: false, emailNote: "" };
  return { booking: current, ...mail };
}

export async function convertBookingToLead(
  id: string
): Promise<{ booking: BookingRecord; created: boolean } | null> {
  const bookings = await readBookings();
  const idx = bookings.findIndex((row) => row.id === id);
  if (idx < 0) return null;
  const booking = bookings[idx];
  const when = [booking.meetingType, booking.date, booking.time].filter(Boolean).join(" ");
  const lead = await captureLead(
    {
      kind: "booking",
      sourceId: id,
      source: booking.source || "booking",
      channel: "booking",
      name: booking.name,
      email: booking.email,
      phone: booking.phone,
      message: [when, booking.message || "", booking.adminNotes || ""].filter(Boolean).join("\n"),
    },
    { ai: true }
  );
  booking.convertedToLead = Boolean(lead);
  booking.read = true;
  if (!booking.status || booking.status === "pending") booking.status = "converted";
  bookings[idx] = booking;
  await writeJsonFile(FILE, bookings);
  return { booking, created: Boolean(lead) };
}
