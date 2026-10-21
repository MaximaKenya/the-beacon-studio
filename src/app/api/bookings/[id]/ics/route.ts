import { NextResponse } from "next/server";
import { buildBookingIcs } from "@/lib/booking-calendar";
import { calendarInputFor, findBooking } from "@/lib/booking-mail";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

/** Shareable calendar file for a booking. The id is an unguessable UUID. */
export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const booking = await findBooking(id);
  const cancelled = booking?.status === "declined" || booking?.status === "cancelled";
  const input = booking ? calendarInputFor(booking, cancelled ? "CANCEL" : "REQUEST") : null;
  if (!booking || !input) {
    return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  }
  const ics = buildBookingIcs(input);
  return new NextResponse(ics, {
    headers: {
      "Content-Type": `text/calendar; charset=utf-8; method=${cancelled ? "CANCEL" : "REQUEST"}`,
      "Content-Disposition": `attachment; filename="beacon-${id.slice(0, 8)}.ics"`,
      "Cache-Control": "no-store",
    },
  });
}
