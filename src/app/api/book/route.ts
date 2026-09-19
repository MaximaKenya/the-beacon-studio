import { NextResponse } from "next/server";
import { ensureDataFiles, parseRequestJson, readJsonFile, writeJsonFile } from "@/lib/storage";
import { generateICS } from "@/lib/booking-utils";
import { isValidEmail, normalizeEmail } from "@/lib/validation";
import { siteConfig } from "@/data/site";

export const runtime = "nodejs";

export type Booking = {
  id: string;
  date: string;
  time: string;
  name: string;
  email: string;
  message?: string;
  meetingType: string;
  createdAt: string;
  status?: string;
  read?: boolean;
  adminNotes?: string;
  rescheduleNote?: string;
};

export async function GET() {
  const bookings = await readJsonFile<Booking[]>("bookings.json", []);
  const slots = bookings.map((b) => ({ date: b.date, time: b.time }));
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
    const meetingType =
      typeof body.meetingType === "string" ? body.meetingType : "Intro Call";

    if (!date || !time || !name || !isValidEmail(email)) {
      return NextResponse.json({ error: "Missing or invalid booking details." }, { status: 400 });
    }

    const bookings = await readJsonFile<Booking[]>("bookings.json", []);

    if (bookings.some((b) => b.date === date && b.time === time)) {
      return NextResponse.json(
        { error: "This time slot is no longer available.", code: "unavailable" },
        { status: 409 }
      );
    }

    const booking: Booking = {
      id: crypto.randomUUID(),
      date,
      time,
      name,
      email,
      ...(message ? { message } : {}),
      meetingType,
      createdAt: new Date().toISOString(),
      status: "pending",
      read: false,
    };

    bookings.unshift(booking);
    await writeJsonFile("bookings.json", bookings);

    const meetingLabel =
      siteConfig.booking.meetingTypes.find((m) => m.id === meetingType)?.label ??
      meetingType;

    const ics = generateICS({
      date,
      time,
      durationMinutes: siteConfig.booking.slotDuration,
      title: `${meetingLabel} with ${siteConfig.brand.name}`,
      description: message || `${meetingLabel} booked via The Beacon Studio.`,
      organizerEmail: siteConfig.email,
      attendeeEmail: email,
      attendeeName: name,
    });

    // Confirm to guest + notify studio (optional Resend)
    const { sendResendEmail, isResendConfigured } = await import("@/lib/resend");
    if (isResendConfigured()) {
      const when = `${date} at ${time} (${siteConfig.booking.timezone.replace("_", " ")})`;
      await sendResendEmail({
        to: email,
        subject: `Booking confirmed — ${meetingLabel}`,
        html: `<p>Hi ${name},</p><p>Your <strong>${meetingLabel}</strong> with ${siteConfig.brand.name} is booked for <strong>${when}</strong>.</p><p>Add it to your calendar with the ICS from the booking confirmation page.</p>`,
        text: `Hi ${name}, your ${meetingLabel} with ${siteConfig.brand.name} is booked for ${when}.`,
      });
      await sendResendEmail({
        to: siteConfig.email,
        subject: `New booking — ${name} · ${meetingLabel}`,
        html: `<p>${name} (${email}) booked ${meetingLabel} for ${when}.</p>${message ? `<p>${message}</p>` : ""}`,
        text: `${name} (${email}) booked ${meetingLabel} for ${when}.`,
      });
    }

    return NextResponse.json({ success: true, booking, ics });
  } catch {
    return NextResponse.json({ error: "Failed to create booking." }, { status: 500 });
  }
}
