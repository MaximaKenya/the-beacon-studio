import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildBookingIcs, googleCalendarUrl, outlookCalendarUrl } from "./booking-calendar";
import { brandedEmail } from "./email-html";
import { composeBookingEmail } from "./booking-mail";
import { reminderKind } from "./booking-reminders";

const booking = {
  id: "11111111-2222-4333-8444-555555555555",
  name: "Amina Wanjiku",
  email: "amina@example.com",
  date: "2026-10-22",
  time: "10:00",
  durationMinutes: 30,
  meetingType: "automation-audit",
  status: "confirmed",
};

describe("branded client email", () => {
  it("uses the lighthouse, footer, and a dark-mode block", () => {
    const letter = brandedEmail({
      heading: "We received your note",
      greeting: "Hi Amina,",
      bodyText: "Thanks for writing.",
    });
    assert.match(letter.html, /beacon-mark\.png/);
    assert.match(letter.html, /prefers-color-scheme: dark/);
    assert.match(letter.html, /0706 397 373/);
    assert.match(letter.html, /hello@thebeaconstudio\.co\.ke/);
    assert.match(letter.html, /Nairobi, Kenya/);
    assert.match(letter.text, /Thanks for writing/);
    assert.equal(letter.html.includes("border:1px"), false);
  });

  it("builds a booking confirmation with calendar links and an invite", () => {
    const letter = composeBookingEmail(booking, "confirmed");
    assert.match(letter.html, /Automation audit/);
    assert.match(letter.html, /Africa\/Nairobi, EAT/);
    assert.match(letter.html, /One repetitive task/);
    assert.match(letter.html, /\/bookings\/11111111-2222-4333-8444-555555555555/);
    assert.match(letter.html, /\/portal\/login/);
    assert.match(letter.html, /calendar\.google\.com/);
    assert.match(letter.html, /outlook\.live\.com/);
    assert.match(letter.html, /\/api\/bookings\/11111111-2222-4333-8444-555555555555\/ics/);
    assert.match(letter.html, /mailto:hello@thebeaconstudio\.co\.ke/);
    assert.match(letter.ics, /METHOD:REQUEST/);
    assert.match(letter.ics, /TRIGGER:-PT24H/);
    assert.match(letter.ics, /TRIGGER:-PT1H/);
    assert.match(letter.ics, /TZID:Africa\/Nairobi/);
    assert.match(letter.ics, /UID:11111111-2222-4333-8444-555555555555@thebeaconstudio\.co\.ke/);
    assert.equal(letter.html.includes("Unsubscribe"), false);
  });

  it("adds unsubscribe only on the follow-up", () => {
    const letter = composeBookingEmail(booking, "follow-up");
    assert.match(letter.html, /Unsubscribe/);
    assert.match(letter.html, /#pricing/);
    const ics = buildBookingIcs({
      id: booking.id,
      date: booking.date,
      time: booking.time,
      durationMinutes: 30,
      title: "Call",
      description: "Bring a sample.",
      organizerEmail: "hello@thebeaconstudio.co.ke",
      attendeeEmail: booking.email,
      attendeeName: booking.name,
      method: "CANCEL",
    });
    assert.match(ics, /METHOD:CANCEL/);
    assert.equal(ics.includes("BEGIN:VALARM"), false);
  });
});

describe("calendar links", () => {
  it("keeps the Nairobi slot in Google and Outlook links", () => {
    const input = {
      id: booking.id,
      date: booking.date,
      time: booking.time,
      durationMinutes: 30,
      title: "Automation audit",
      description: "Prepare a sample.",
      location: "WhatsApp",
      organizerEmail: "hello@thebeaconstudio.co.ke",
      attendeeEmail: booking.email,
      attendeeName: booking.name,
    };
    const google = new URL(googleCalendarUrl(input));
    assert.equal(google.searchParams.get("dates"), "20261022T100000/20261022T103000");
    assert.equal(google.searchParams.get("ctz"), "Africa/Nairobi");
    const outlook = new URL(outlookCalendarUrl(input));
    assert.equal(outlook.searchParams.get("startdt"), "2026-10-22T10:00:00+03:00");
    assert.equal(outlook.searchParams.get("enddt"), "2026-10-22T10:30:00+03:00");
  });
});

describe("booking reminders", () => {
  const start = new Date("2026-10-22T10:00:00+03:00").getTime();

  it("sends the 24 hour note inside the day before, and the 1 hour note inside the last hour", () => {
    assert.equal(reminderKind(booking, start - 20 * 60 * 60 * 1000), "reminder-24h");
    assert.equal(reminderKind(booking, start - 30 * 60 * 1000), "reminder-1h");
    assert.equal(reminderKind({ ...booking, reminder1SentAt: "sent" }, start - 30 * 60 * 1000), null);
    assert.equal(reminderKind({ ...booking, status: "declined" }, start - 30 * 60 * 1000), null);
  });

  it("sends one follow-up after the call", () => {
    assert.equal(reminderKind(booking, start + 90 * 60 * 1000), "follow-up");
    assert.equal(reminderKind({ ...booking, followUpOptOut: true }, start + 90 * 60 * 1000), null);
  });
});
