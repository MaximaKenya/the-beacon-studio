import { siteConfig } from "@/data/site";
import { brandedEmail } from "@/lib/email-html";
import { captureLead } from "@/lib/leads";
import { isResendConfigured, sendResendEmail } from "@/lib/resend";
import { readJsonFile, writeJsonFile } from "@/lib/storage";
import { isValidEmail } from "@/lib/validation";

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

function meetingLabel(booking: BookingRecord): string {
  const id = booking.meetingType || "call";
  return (
    siteConfig.booking.meetingTypes.find((item) => item.id === id)?.label ||
    siteConfig.booking.meetingTypes.find((item) => item.label === id)?.label ||
    id
  );
}

async function emailBookingStatus(booking: BookingRecord, status: string): Promise<{ emailed: boolean; emailNote: string }> {
  const email = typeof booking.email === "string" ? booking.email.trim() : "";
  if (!email || !isValidEmail(email)) return { emailed: false, emailNote: "" };
  if (!isResendConfigured()) {
    return { emailed: false, emailNote: "Email was not sent — Resend is not configured." };
  }
  const name = booking.name || "there";
  const when = [booking.date, booking.time].filter(Boolean).join(" at ");
  const label = meetingLabel(booking);
  let heading = "Booking update";
  let body = `Your ${label}${when ? ` on ${when}` : ""} has been updated.`;
  if (status === "confirmed") {
    heading = "Booking confirmed";
    body = `Your ${label}${when ? ` on ${when}` : ""} is confirmed.`;
  } else if (status === "declined" || status === "cancelled") {
    heading = "Booking declined";
    body = `We can't keep the ${label}${when ? ` on ${when}` : ""}. Reply to this email if you would like another time.`;
  } else if (status === "reschedule") {
    heading = "Please reschedule";
    const note = booking.rescheduleNote ? `\n\n${booking.rescheduleNote}` : "";
    body = `We need to move your ${label}${when ? ` (${when})` : ""}.${note}`;
  } else {
    return { emailed: false, emailNote: "" };
  }
  const letter = brandedEmail({ heading, greeting: `Hi ${name},`, bodyText: body });
  const result = await sendResendEmail({
    to: email,
    subject: `${heading} — ${siteConfig.brand.name}`,
    html: letter.html,
    text: letter.text,
    idempotencyKey: `booking-${status}/${booking.id}/${booking.rescheduleNote || when || "update"}`,
  });
  if (result.sent) return { emailed: true, emailNote: "A status email was sent." };
  return { emailed: false, emailNote: "Email was not sent." };
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
  if (typeof patch.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(patch.date)) current.date = patch.date;
  if (typeof patch.time === "string" && /^\d{2}:\d{2}$/.test(patch.time)) current.time = patch.time;
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
