import { NextResponse } from "next/server";
import { buildBookingIcs } from "@/lib/booking-calendar";
import { loadAutomations } from "@/lib/automations/store";
import { siteConfig } from "@/data/site";
import { nairobiDateKey } from "@/lib/time";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const doc = await loadAutomations();
  const booking = doc.bookings.find((item) => item.id === id);
  const instance = booking ? doc.instances.find((item) => item.id === booking.instanceId) : undefined;
  if (!booking || !instance) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  const start = new Date(booking.start);
  const time = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Nairobi",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(start);
  const ics = buildBookingIcs({
    id: booking.id,
    date: nairobiDateKey(start),
    time,
    durationMinutes: Number(instance.config.slotMinutes) || 30,
    title: `${instance.businessName} appointment`,
    description: `Booked with ${instance.businessName}. The Beacon Studio · hello@thebeaconstudio.co.ke · thebeaconstudio.co.ke. Times are Africa/Nairobi.`,
    location: instance.businessName,
    organizerEmail: siteConfig.email,
    attendeeEmail: booking.email || instance.ownerEmail,
    attendeeName: booking.name,
  });
  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="beacon-${booking.id.slice(0, 8)}.ics"`,
    },
  });
}
