import { NextResponse } from "next/server";
import { ensureDataFiles, parseRequestJson, readJsonFile, writeJsonFile } from "@/lib/storage";
import {
  durationForMeeting,
  generateTimeSlots,
  isDayAvailable,
  parseDateKey,
  slotTaken,
} from "@/lib/booking-utils";
import { isValidEmail, normalizeEmail } from "@/lib/validation";
import { siteConfig } from "@/data/site";
import { attributionFromRecord, attributionNote, type LeadAttribution } from "@/lib/attribution";
import { brandedEmail } from "@/lib/email-html";
import { sendBookingClientEmail } from "@/lib/booking-mail";

export const runtime = "nodejs";

export type Booking = LeadAttribution & {
  id: string;
  date: string;
  time: string;
  durationMinutes: number;
  name: string;
  email: string;
  message?: string;
  phone?: string;
  meetingType: string;
  source?: string;
  createdAt: string;
  status?: string;
  read?: boolean;
  adminNotes?: string;
  rescheduleNote?: string;
};

export async function GET() {
  const bookings = await readJsonFile<Booking[]>("bookings.json", []);
  const slots = bookings.map((b) => ({
    date: b.date,
    time: b.time,
    durationMinutes: b.durationMinutes ?? siteConfig.booking.slotDuration,
  }));
  return NextResponse.json({ slots });
}

export async function POST(request: Request) {
  try {
    await ensureDataFiles();
    const body = await parseRequestJson(request);
    const date = typeof body.date === "string" ? body.date : "";
    const time = typeof body.time === "string" ? body.time : "";
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? normalizeEmail(body.email) : "";
    const message = typeof body.message === "string" ? body.message.trim() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";
    const meetingType =
      typeof body.meetingType === "string" ? body.meetingType : "intro";
    const source = typeof body.source === "string" ? body.source.trim().slice(0, 80) : "";
    const attribution = attributionFromRecord(body);
    const durationMinutes = durationForMeeting(meetingType);

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time) || !name || !isValidEmail(email)) {
      return NextResponse.json({ error: "Missing or invalid booking details." }, { status: 400 });
    }
    if (!isDayAvailable(parseDateKey(date))) {
      return NextResponse.json({ error: "That day is not open for booking." }, { status: 400 });
    }

    const bookings = await readJsonFile<Booking[]>("bookings.json", []);
    const open = generateTimeSlots(date, bookings, durationMinutes);
    if (!open.includes(time) || slotTaken(bookings, date, time, durationMinutes)) {
      return NextResponse.json(
        { error: "This time slot is no longer available.", code: "unavailable" },
        { status: 409 }
      );
    }

    const booking: Booking = {
      id: crypto.randomUUID(),
      date,
      time,
      durationMinutes,
      name,
      email,
      ...(message ? { message } : {}),
      ...(phone ? { phone } : {}),
      meetingType,
      ...(source ? { source } : {}),
      ...attribution,
      createdAt: new Date().toISOString(),
      status: "pending",
      read: false,
    };

    bookings.unshift(booking);
    await writeJsonFile("bookings.json", bookings);

    try {
      const { captureLead } = await import("@/lib/leads");
      await captureLead({
        kind: "booking",
        sourceId: booking.id,
        source: source || "booking",
        channel: "booking",
        name,
        email,
        phone,
        message: [meetingType, date, time, message].filter(Boolean).join("\n"),
      });
    } catch (error) {
      console.error("[book] lead", error instanceof Error ? error.message : "lead failed");
    }

    const { upsertClient } = await import("@/lib/clients");
    await upsertClient({
      email,
      name,
      ...(phone ? { phone } : {}),
    });

    const meeting =
      siteConfig.booking.meetingTypes.find((m) => m.id === meetingType) ??
      siteConfig.booking.meetingTypes.find((m) => m.label === meetingType);
    const meetingLabel = meeting?.label ?? meetingType;

    const when = `${date} at ${time} (Africa/Nairobi, EAT)`;
    const { recordSiteForm } = await import("@/lib/mailbox");
    try {
      await recordSiteForm({
        kind: "booking",
        sourceId: booking.id,
        name,
        email,
        ...(phone ? { phone } : {}),
        subject: `Booking — ${meetingLabel} — ${name}`,
        text: [`${meetingLabel} on ${when}.`, phone ? `Phone: ${phone}` : "", message].filter(Boolean).join("\n"),
        confirmationSubject: `Booking confirmed — ${meetingLabel}`,
        skipConfirmation: true,
      });
    } catch (error) {
      console.error("[book] mailbox", error instanceof Error ? error.message : "mailbox failed");
    }
    const visitorResult = await sendBookingClientEmail(
      {
        ...booking,
        durationMinutes: meeting?.duration ?? siteConfig.booking.slotDuration,
      },
      "confirmed",
      undefined,
      `booking-confirmed/${booking.id}/0`
    );
    const ics = visitorResult.ics;
    const emailSent = visitorResult.emailed;
    if (emailSent) {
      const { sendResendEmail } = await import("@/lib/resend");
      const campaign = attributionNote(attribution);
      const studio = brandedEmail({
        heading: "New booking",
        greeting: "Hello,",
        bodyText: `${name} (${email}) booked ${meetingLabel} for ${when}.${message ? `\n\n${message}` : ""}${campaign ? `\n\n${campaign}` : ""}`,
      });
      await sendResendEmail({
        to: siteConfig.email,
        replyTo: email,
        subject: `New booking — ${name} · ${meetingLabel}`,
        html: studio.html,
        text: studio.text,
        idempotencyKey: `booking-studio/${booking.id}`,
      });
    }

    return NextResponse.json({ success: true, booking, ics, emailSent });
  } catch {
    return NextResponse.json({ error: "Failed to create booking." }, { status: 500 });
  }
}
