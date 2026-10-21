import { NextResponse } from "next/server";
import { findBooking, readBookings, writeBookings } from "@/lib/booking-mail";
import { siteConfig } from "@/data/site";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const booking = await findBooking(id);
  if (!booking) {
    return new NextResponse("This booking was not found.", { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }
  const rows = await readBookings();
  const idx = rows.findIndex((row) => row.id === id);
  if (idx >= 0) {
    rows[idx] = { ...rows[idx], followUpOptOut: true };
    await writeBookings(rows);
  }
  const html = `<!DOCTYPE html><html lang="en"><body style="font-family:Georgia,serif;background:#f3f7f6;color:#1b2a33;padding:48px 16px;">
    <h1>Unsubscribed</h1>
    <p>You will not get a follow-up email for this ${siteConfig.brand.name} call. Reminders about the scheduled time can still arrive.</p>
  </body></html>`;
  return new NextResponse(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
