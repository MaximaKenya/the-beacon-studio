import Link from "next/link";
import { notFound } from "next/navigation";
import { siteConfig } from "@/data/site";
import { formatNairobiWhen, googleCalendarUrl, outlookCalendarUrl } from "@/lib/booking-calendar";
import { bookingLinks, calendarInputFor, findBooking, meetingLabelFor, prepareFor } from "@/lib/booking-mail";
import { durationForMeeting } from "@/lib/booking-utils";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export default async function BookingRequestPage({ params }: Params) {
  const { id } = await params;
  const booking = await findBooking(id);
  if (!booking?.date || !booking.time) notFound();
  const label = meetingLabelFor(booking.meetingType);
  const duration = booking.durationMinutes || durationForMeeting(booking.meetingType || "intro");
  const when = formatNairobiWhen(booking.date, booking.time, duration);
  const links = bookingLinks(id);
  const calendar = calendarInputFor(booking);
  const where = booking.meetingUrl || `WhatsApp ${siteConfig.phoneDisplay}`;

  return (
    <main className="mx-auto max-w-xl px-6 pb-24 pt-28">
      <p className="text-sm font-medium text-accent">{siteConfig.brand.name}</p>
      <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-heading">{label}</h1>
      <p className="mt-3 text-muted">{when}</p>
      <div className="sleek-card mt-8 rounded-3xl p-6">
        <dl className="space-y-4 text-sm">
          <div>
            <dt className="text-muted">Service</dt>
            <dd className="mt-1 text-foreground">{label}</dd>
          </div>
          <div>
            <dt className="text-muted">Where</dt>
            <dd className="mt-1 text-foreground">{where}</dd>
          </div>
          <div>
            <dt className="text-muted">Prepare</dt>
            <dd className="mt-1 text-foreground">{prepareFor(booking.meetingType)}</dd>
          </div>
        </dl>
        <div className="mt-6 flex flex-col gap-2">
          <Link href="/portal/login" className="inline-flex h-11 items-center justify-center rounded-2xl bg-accent text-sm font-semibold text-background">
            Open the client portal
          </Link>
          <a href={links.ics} className="inline-flex h-11 items-center justify-center rounded-2xl bg-surface-elevated/80 text-sm font-semibold text-foreground">
            Download calendar file
          </a>
          {calendar && (
            <>
              <a href={googleCalendarUrl(calendar)} className="text-sm font-semibold text-accent">
                Add to Google Calendar
              </a>
              <a href={outlookCalendarUrl(calendar)} className="text-sm font-semibold text-accent">
                Add to Outlook
              </a>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
