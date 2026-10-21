"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { siteConfig } from "@/data/site";
import { readStoredAttribution } from "@/lib/attribution-client";
import {
  durationForMeeting,
  formatDateDisplay,
  formatDateKey,
  formatTimeDisplay,
  generateTimeSlots,
  getTimezoneLabel,
  isDayAvailable,
  type BookedSlot,
} from "@/lib/booking-utils";
import { rememberBookingDraft } from "@/lib/booking-draft-client";
import { VisitorTimeZone } from "@/components/booking/VisitorTimeZone";

const AUDIT_ID = "automation-audit";

export function AuditBooking() {
  const duration = durationForMeeting(AUDIT_ID);
  const [booked, setBooked] = useState<BookedSlot[]>([]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ when: string; emailSent: boolean } | null>(null);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      void fetch("/api/book")
        .then((res) => res.json())
        .then((data: { slots?: BookedSlot[] }) => setBooked(data.slots ?? []))
        .catch(() => setBooked([]));
    }, 0);
    return () => window.clearTimeout(handle);
  }, []);

  const days = useMemo(() => {
    const keys: string[] = [];
    const cursor = new Date();
    for (let offset = 0; offset < 28 && keys.length < 8; offset += 1) {
      const next = new Date(cursor);
      next.setDate(cursor.getDate() + offset);
      if (!isDayAvailable(next)) continue;
      const key = formatDateKey(next);
      if (generateTimeSlots(key, booked, duration).length === 0) continue;
      keys.push(key);
    }
    return keys;
  }, [booked, duration]);

  const slots = date ? generateTimeSlots(date, booked, duration) : [];

  useEffect(() => {
    rememberBookingDraft({
      email,
      name,
      phone,
      meetingType: AUDIT_ID,
      date,
      time,
      source: "audit-booking",
    });
  }, [email, name, phone, date, time]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!date || !time) {
      setError("Pick a day and a time.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          time,
          name,
          email,
          phone,
          message,
          meetingType: AUDIT_ID,
          source: "audit-booking",
          ...readStoredAttribution(),
        }),
      });
      const data = (await res.json()) as { error?: string; emailSent?: boolean };
      if (!res.ok) {
        setError(data.error || "That slot is no longer open.");
        return;
      }
      setDone({
        when: `${formatDateDisplay(date)} at ${formatTimeDisplay(time)}`,
        emailSent: Boolean(data.emailSent),
      });
    } catch {
      setError("Could not save the booking. Try again.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="sleek-card rounded-3xl p-6 sm:p-8" role="status">
        <h2 className="font-display text-2xl font-semibold text-heading">You are booked</h2>
        <p className="mt-3 text-sm leading-relaxed text-foreground">
          Free 20-minute automation audit on {done.when} ({getTimezoneLabel()}).
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          {done.emailSent
            ? "A confirmation email with a calendar file is on its way."
            : "The slot is saved. A confirmation email is sent when email delivery is configured."}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="sleek-card rounded-3xl p-6 sm:p-8">
      <h2 className="font-display text-2xl font-semibold text-heading">Pick a 20-minute slot</h2>
      <p className="mt-2 text-sm text-muted">
        {siteConfig.booking.hoursStart}–{siteConfig.booking.hoursEnd}, weekdays, {getTimezoneLabel()}.
      </p>
      <VisitorTimeZone date={date} time={time} />

      <fieldset className="mt-6">
        <legend className="text-sm font-medium text-foreground">Day</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {days.length === 0 && <p className="text-sm text-muted">No open days in the next few weeks.</p>}
          {days.map((key) => (
            <button
              key={key}
              type="button"
              aria-pressed={date === key}
              onClick={() => {
                setDate(key);
                setTime("");
              }}
              className={`rounded-2xl px-4 py-2 text-sm ${
                date === key ? "bg-accent text-background" : "bg-surface-elevated/80 text-foreground"
              }`}
            >
              {formatDateDisplay(key, { weekday: "short", month: "short", day: "numeric" })}
            </button>
          ))}
        </div>
      </fieldset>

      {date && (
        <fieldset className="mt-6">
          <legend className="text-sm font-medium text-foreground">Time</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {slots.map((slot) => (
              <button
                key={slot}
                type="button"
                aria-pressed={time === slot}
                onClick={() => setTime(slot)}
                className={`rounded-2xl px-4 py-2 text-sm ${
                  time === slot ? "bg-accent text-background" : "bg-surface-elevated/80 text-foreground"
                }`}
              >
                {formatTimeDisplay(slot)}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium text-foreground" htmlFor="audit-name">
          Name
          <input
            id="audit-name"
            required
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="field mt-2 w-full px-4 py-3"
          />
        </label>
        <label className="text-sm font-medium text-foreground" htmlFor="audit-email">
          Email
          <input
            id="audit-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            onBlur={() =>
              rememberBookingDraft(
                { email, name, phone, meetingType: AUDIT_ID, date, time, source: "audit-booking" },
                true
              )
            }
            className="field mt-2 w-full px-4 py-3"
          />
        </label>
        <label className="text-sm font-medium text-foreground sm:col-span-2" htmlFor="audit-phone">
          Phone <span className="font-normal text-muted">(optional)</span>
          <input
            id="audit-phone"
            type="tel"
            autoComplete="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            className="field mt-2 w-full px-4 py-3"
          />
        </label>
        <label className="text-sm font-medium text-foreground sm:col-span-2" htmlFor="audit-note">
          The job you want off the team’s plate
          <textarea
            id="audit-note"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={4}
            className="field mt-2 w-full px-4 py-3"
          />
        </label>
      </div>
      {error && (
        <p className="mt-4 text-sm text-accent-warm" role="alert">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={busy}
        className="mt-6 inline-flex h-12 items-center rounded-2xl bg-accent px-5 text-sm font-semibold text-background disabled:opacity-60"
      >
        {busy ? "Saving the slot…" : "Book the free audit"}
      </button>
    </form>
  );
}
