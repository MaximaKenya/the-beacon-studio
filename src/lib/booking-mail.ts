import { siteConfig } from "@/data/site";
import {
  buildBookingIcs,
  formatNairobiWhen,
  googleCalendarUrl,
  outlookCalendarUrl,
  type BookingCalendarInput,
} from "@/lib/booking-calendar";
import { renderBrandEmail, publicSiteUrl, type BrandEmailRow } from "@/lib/brand-email";
import { durationForMeeting } from "@/lib/booking-utils";
import { isResendConfigured, sendResendEmail } from "@/lib/resend";
import { readJsonFile, writeJsonFile } from "@/lib/storage";
import { isValidEmail } from "@/lib/validation";

export const BOOKING_FILE = "bookings.json";

export type BookingMailKind =
  | "confirmed"
  | "reschedule"
  | "declined"
  | "cancelled"
  | "reply"
  | "reminder-24h"
  | "reminder-1h"
  | "follow-up";

export type ClientBooking = {
  id?: string;
  date?: string;
  time?: string;
  durationMinutes?: number;
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
  meetingType?: string;
  meetingUrl?: string;
  status?: string;
  rescheduleNote?: string;
  calendarSequence?: number;
  reminder24SentAt?: string;
  reminder1SentAt?: string;
  followUpSentAt?: string;
  reminder24ClaimAt?: string;
  reminder1ClaimAt?: string;
  followUpClaimAt?: string;
  followUpOptOut?: boolean;
  createdAt?: string;
};

const PREPARE: Record<string, string> = {
  intro: "What you want to build, and a rough budget if you have one.",
  "automation-audit": "One repetitive task, the tools you use today, and a sample message.",
  "it-assessment": "How many people use email, and where the files live today.",
  project: "The outcome you want, and who will use it.",
};

export function meetingLabelFor(meetingType?: string): string {
  const id = meetingType || "call";
  return (
    siteConfig.booking.meetingTypes.find((item) => item.id === id)?.label ||
    siteConfig.booking.meetingTypes.find((item) => item.label === id)?.label ||
    id
  );
}

export function prepareFor(meetingType?: string): string {
  const id = meetingType || "";
  return PREPARE[id] || "A short note on what you want from the call.";
}

function durationOf(booking: ClientBooking): number {
  if (booking.durationMinutes && booking.durationMinutes > 0) return booking.durationMinutes;
  return durationForMeeting(booking.meetingType || "intro");
}

export function bookingLinks(id: string) {
  const origin = publicSiteUrl();
  return {
    request: `${origin}/bookings/${id}`,
    portal: `${origin}/portal/login`,
    ics: `${origin}/api/bookings/${id}/ics`,
    reply: `mailto:${siteConfig.email}?subject=${encodeURIComponent(`Re: Booking ${id.slice(0, 8)}`)}`,
    unsubscribe: `${origin}/api/bookings/${id}/unsubscribe`,
  };
}

export function calendarInputFor(booking: ClientBooking, method: "REQUEST" | "CANCEL" = "REQUEST"): BookingCalendarInput | null {
  if (!booking.id || !booking.date || !booking.time || !booking.email) return null;
  const label = meetingLabelFor(booking.meetingType);
  const links = bookingLinks(booking.id);
  const location = booking.meetingUrl || `WhatsApp ${siteConfig.phoneDisplay}`;
  return {
    id: booking.id,
    date: booking.date,
    time: booking.time,
    durationMinutes: durationOf(booking),
    title: `${label} with ${siteConfig.brand.name}`,
    description: `${label}. ${prepareFor(booking.meetingType)} Request: ${links.request}`,
    location,
    url: booking.meetingUrl || links.request,
    organizerEmail: siteConfig.email,
    attendeeEmail: booking.email,
    attendeeName: booking.name || "Guest",
    sequence: booking.calendarSequence || 0,
    method,
  };
}

function headingFor(kind: BookingMailKind, label: string): string {
  if (kind === "confirmed") return `${label} confirmed`;
  if (kind === "reschedule") return `Let's move your ${label}`;
  if (kind === "declined" || kind === "cancelled") return `${label} declined`;
  if (kind === "reminder-24h") return `${label} is tomorrow`;
  if (kind === "reminder-1h") return `${label} is in one hour`;
  if (kind === "follow-up") return `Next step after your ${label}`;
  return `Reply about your ${label}`;
}

function introFor(kind: BookingMailKind, label: string, when: string): string {
  if (kind === "confirmed") return `You are booked for ${label} on ${when}.`;
  if (kind === "reschedule") return `We need a new time for your ${label}. The current slot is ${when}.`;
  if (kind === "declined" || kind === "cancelled") return `We can't keep the ${label} on ${when}. Reply if you want another time.`;
  if (kind === "reminder-24h") return `Your ${label} is in about 24 hours, on ${when}.`;
  if (kind === "reminder-1h") return `Your ${label} starts in about an hour, at ${when}.`;
  if (kind === "follow-up") return `Thanks for the ${label} on ${when}. Here is a clear next step.`;
  return `A note about your ${label} on ${when}.`;
}

export function composeBookingEmail(booking: ClientBooking, kind: BookingMailKind, note?: string) {
  const id = booking.id || "booking";
  const label = meetingLabelFor(booking.meetingType);
  const when =
    booking.date && booking.time
      ? formatNairobiWhen(booking.date, booking.time, durationOf(booking))
      : "a time we'll confirm";
  const links = bookingLinks(id);
  const location = booking.meetingUrl || `WhatsApp call · ${siteConfig.phoneDisplay}`;
  const active = kind !== "declined" && kind !== "cancelled";
  const calendar = calendarInputFor(booking, active ? "REQUEST" : "CANCEL");
  const rows: BrandEmailRow[] = [
    { label: "Booking", value: label },
    { label: "Service", value: label },
    { label: "When", value: when },
    { label: "Where", value: location },
    { label: "Prepare", value: prepareFor(booking.meetingType) },
  ];
  const paragraphs = [introFor(kind, label, when)];
  if (note?.trim()) paragraphs.push(note.trim());
  if (booking.rescheduleNote && kind === "reschedule") paragraphs.push(booking.rescheduleNote);
  const proposal = `${publicSiteUrl()}/#pricing`;
  const actions = [
    { label: "View your request", href: links.request },
    { label: "Open the client portal", href: links.portal },
    { label: "Reply to the studio", href: links.reply },
  ];
  if (calendar && active) {
    actions.push(
      { label: "Add to Google Calendar", href: googleCalendarUrl(calendar) },
      { label: "Add to Outlook", href: outlookCalendarUrl(calendar) },
      { label: "Download the calendar file", href: links.ics }
    );
  }
  if (kind === "follow-up") {
    actions.unshift({ label: "See pricing and next steps", href: proposal });
  }
  const letter = renderBrandEmail({
    heading: headingFor(kind, label),
    preview: introFor(kind, label, when),
    greeting: `Hi ${booking.name || "there"},`,
    paragraphs,
    card: rows,
    actions,
    ...(kind === "follow-up" ? { unsubscribeUrl: links.unsubscribe } : {}),
  });
  const ics = calendar ? buildBookingIcs(calendar) : "";
  return { ...letter, ics, links, subject: `${headingFor(kind, label)} — ${siteConfig.brand.name}` };
}

export async function readBookings(): Promise<ClientBooking[]> {
  const rows = await readJsonFile<ClientBooking[]>(BOOKING_FILE, []);
  return Array.isArray(rows) ? rows : [];
}

export async function writeBookings(rows: ClientBooking[]): Promise<void> {
  await writeJsonFile(BOOKING_FILE, rows);
}

export async function findBooking(id: string): Promise<ClientBooking | null> {
  if (!id) return null;
  const rows = await readBookings();
  return rows.find((row) => row.id === id) || null;
}

export async function sendBookingClientEmail(
  booking: ClientBooking,
  kind: BookingMailKind,
  note?: string,
  idempotencyKey?: string
): Promise<{ emailed: boolean; emailNote: string; ics: string }> {
  const email = booking.email?.trim() || "";
  const letter = composeBookingEmail(booking, kind, note);
  if (!email || !isValidEmail(email)) return { emailed: false, emailNote: "", ics: letter.ics };
  if (!isResendConfigured()) {
    return { emailed: false, emailNote: "Email was not sent — Resend is not configured.", ics: letter.ics };
  }
  const active = kind !== "declined" && kind !== "cancelled";
  const result = await sendResendEmail({
    to: email,
    subject: letter.subject,
    html: letter.html,
    text: letter.text,
    idempotencyKey: idempotencyKey || `booking-${kind}/${booking.id || email}`,
    ...(kind === "follow-up" ? { headers: { "List-Unsubscribe": `<${letter.links.unsubscribe}>` } } : {}),
    ...(letter.ics
      ? {
          attachments: [
            {
              filename: active ? "beacon-booking.ics" : "beacon-booking-cancel.ics",
              content: Buffer.from(letter.ics, "utf8"),
              contentType: `text/calendar; charset=utf-8; method=${active ? "REQUEST" : "CANCEL"}`,
            },
          ],
        }
      : {}),
  });
  if (result.sent) return { emailed: true, emailNote: "A status email was sent.", ics: letter.ics };
  return { emailed: false, emailNote: "Email was not sent.", ics: letter.ics };
}
