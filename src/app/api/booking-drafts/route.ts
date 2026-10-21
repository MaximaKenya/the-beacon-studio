import { NextResponse } from "next/server";
import { saveBookingDraft } from "@/lib/booking-drafts";
import { parseRequestJson } from "@/lib/storage";
import { isValidEmail, normalizeEmail } from "@/lib/validation";

export const runtime = "nodejs";

/** A visitor started the booking form. The hourly tick sends one nudge if they never finish. */
export async function POST(request: Request) {
  const body = await parseRequestJson(request);
  const email = typeof body.email === "string" ? normalizeEmail(body.email) : "";
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Invalid email." }, { status: 400 });
  }
  const text = (value: unknown, max: number) => (typeof value === "string" ? value.trim().slice(0, max) : "");
  await saveBookingDraft({
    email,
    name: text(body.name, 120),
    phone: text(body.phone, 40),
    meetingType: text(body.meetingType, 80),
    date: text(body.date, 10),
    time: text(body.time, 5),
    source: text(body.source, 80),
  });
  return NextResponse.json({ ok: true });
}
