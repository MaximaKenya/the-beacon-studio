"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  Loader2,
  X,
} from "lucide-react";
import { siteConfig } from "@/data/site";
import { useFeatures } from "@/providers/FeatureProvider";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import {
  formatDateDisplay,
  formatDateKey,
  formatTimeDisplay,
  generateTimeSlots,
  getMonthDays,
  getNowInTimezone,
  getTimezoneLabel,
  isDayAvailable,
  type BookedSlot,
} from "@/lib/booking-utils";
import { trackEvent } from "@/lib/analytics";
import { fetchWithTimeout, FetchTimeoutError } from "@/lib/fetch-with-timeout";
import { fireConfetti } from "@/lib/confetti";

type Step = "calendar" | "details" | "confirmed";

type BookingResult = {
  booking: {
    id: string;
    date: string;
    time: string;
    name: string;
    email: string;
    meetingType: string;
  };
  ics: string;
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const BOOK_TIMEOUT_MS = 15_000;

export function BookingModal() {
  const { bookingOpen, closeBooking } = useFeatures();
  const reducedMotion = useReducedMotion();
  const trapRef = useFocusTrap(bookingOpen);
  const [step, setStep] = useState<Step>("calendar");
  const [viewDate, setViewDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [meetingType, setMeetingType] = useState<string>(
    siteConfig.booking.meetingTypes[0]?.id ?? ""
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [booked, setBooked] = useState<BookedSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<BookingResult | null>(null);

  const fetchBooked = useCallback(async () => {
    try {
      const res = await fetchWithTimeout("/api/book", {}, 10_000);
      const data = await res.json();
      setBooked(data.slots ?? []);
    } catch {
      setBooked([]);
    }
  }, []);

  useEffect(() => {
    if (bookingOpen) {
      fetchBooked();
      setStep("calendar");
      setSelectedDate(null);
      setSelectedTime(null);
      setError("");
      setResult(null);
    }
  }, [bookingOpen, fetchBooked]);

  const monthDays = useMemo(
    () => getMonthDays(viewDate.getFullYear(), viewDate.getMonth()),
    [viewDate]
  );

  const leadingBlanks = monthDays[0]?.getDay() ?? 0;
  const todayKey = getNowInTimezone().dateKey;

  const timeSlots = useMemo(() => {
    if (!selectedDate) return [];
    return generateTimeSlots(selectedDate, booked);
  }, [selectedDate, booked]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!selectedDate || !selectedTime) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetchWithTimeout(
        "/api/book",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            date: selectedDate,
            time: selectedTime,
            name,
            email,
            message: message || undefined,
            meetingType,
          }),
        },
        BOOK_TIMEOUT_MS
      );

      let data: BookingResult & { error?: string; code?: string } = {} as BookingResult;
      try {
        data = await res.json();
      } catch {
        throw new Error("Invalid server response.");
      }

      if (!res.ok) {
        setError(data.error ?? "Booking failed.");
        if (data.code === "unavailable") fetchBooked();
        return;
      }

      setResult(data);
      setStep("confirmed");
      if (!reducedMotion) fireConfetti();
      trackEvent("booking_confirmed", { date: selectedDate, time: selectedTime });
    } catch (err) {
      if (err instanceof FetchTimeoutError) {
        setError("Request timed out. Please try again.");
      } else {
        setError("Network error. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  function downloadICS() {
    if (!result?.ics) return;
    const blob = new Blob([result.ics], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `meeting-${result.booking.date}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleClose() {
    closeBooking();
    document.body.style.overflow = "";
  }

  useEffect(() => {
    document.body.style.overflow = bookingOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [bookingOpen]);

  if (!siteConfig.booking.enabled) return null;

  const motionProps = reducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 24 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 24 },
      };

  const meetingLabel =
    siteConfig.booking.meetingTypes.find((m) => m.id === meetingType)?.label ?? meetingType;

  return (
    <AnimatePresence>
      {bookingOpen && (
        <motion.div
          key="booking-backdrop"
          initial={reducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reducedMotion ? undefined : { opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[170] flex items-end justify-center bg-background/70 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="booking-title"
          onClick={handleClose}
        >
          <motion.div
            ref={trapRef}
            {...motionProps}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="glass-panel flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10">
                  <Calendar className="h-4 w-4 text-accent" aria-hidden />
                </div>
                <div>
                  <h2 id="booking-title" className="font-display text-base font-semibold text-foreground">
                    Book a Call
                  </h2>
                  <p className="text-xs text-muted">{getTimezoneLabel()} (EAT)</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="rounded-lg p-1.5 text-muted hover:bg-surface hover:text-foreground"
                aria-label="Close booking"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="overflow-y-auto p-5">
              {step === "confirmed" && result ? (
                <div className="py-6 text-center">
                  <CheckCircle2 className="mx-auto h-12 w-12 text-accent" aria-hidden />
                  <h3 className="mt-4 font-display text-lg font-semibold text-foreground">
                    You&apos;re booked!
                  </h3>
                  <p className="mt-2 text-sm text-muted">
                    {meetingLabel} on{" "}
                    <span className="text-foreground">
                      {formatDateDisplay(result.booking.date)} at{" "}
                      {formatTimeDisplay(result.booking.time)}
                    </span>
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    Confirmation sent to {result.booking.email}
                  </p>
                  <button
                    type="button"
                    onClick={downloadICS}
                    className="mt-6 inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-5 py-2.5 text-sm font-medium text-foreground hover:border-accent/30"
                  >
                    <Download className="h-4 w-4" aria-hidden />
                    Add to calendar (.ics)
                  </button>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="mt-3 block w-full rounded-xl bg-accent py-2.5 text-sm font-semibold text-background hover:bg-accent-hover"
                  >
                    Done
                  </button>
                </div>
              ) : step === "details" ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <p className="text-sm text-muted">
                    {meetingLabel} ·{" "}
                    {selectedDate && formatDateDisplay(selectedDate, { weekday: "short", month: "short", day: "numeric" })}{" "}
                    at {selectedTime && formatTimeDisplay(selectedTime)}
                  </p>

                  <div>
                    <label htmlFor="booking-name" className="mb-1.5 block text-sm font-medium">
                      Name
                    </label>
                    <input
                      id="booking-name"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/20"
                    />
                  </div>
                  <div>
                    <label htmlFor="booking-email" className="mb-1.5 block text-sm font-medium">
                      Email
                    </label>
                    <input
                      id="booking-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/20"
                    />
                  </div>
                  <div>
                    <label htmlFor="booking-message" className="mb-1.5 block text-sm font-medium">
                      Message (optional)
                    </label>
                    <textarea
                      id="booking-message"
                      rows={3}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="What would you like to discuss?"
                      className="w-full resize-none rounded-xl border border-border bg-surface px-4 py-2.5 text-sm focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/20"
                    />
                  </div>

                  {error && (
                    <p className="text-sm text-accent-warm" role="alert">
                      {error}
                    </p>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep("calendar")}
                      className="flex-1 rounded-xl border border-border py-2.5 text-sm font-medium text-muted hover:text-foreground"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-accent py-2.5 text-sm font-semibold text-background hover:bg-accent-hover disabled:opacity-60"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                          Booking...
                        </>
                      ) : (
                        "Confirm booking"
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  {siteConfig.booking.meetingTypes.length > 1 && (
                    <div className="mb-4 flex flex-wrap gap-2">
                      {siteConfig.booking.meetingTypes.map((type) => (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => setMeetingType(type.id)}
                          className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                            meetingType === type.id
                              ? "border-accent bg-accent/10 text-accent"
                              : "border-border text-muted hover:border-accent/30"
                          }`}
                        >
                          {type.label}
                          <span className="ml-1 text-muted">({type.duration}m)</span>
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="mb-4 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() =>
                        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))
                      }
                      className="rounded-lg p-1.5 text-muted hover:bg-surface hover:text-foreground"
                      aria-label="Previous month"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="font-display text-sm font-semibold">
                      {viewDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))
                      }
                      className="rounded-lg p-1.5 text-muted hover:bg-surface hover:text-foreground"
                      aria-label="Next month"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mb-2 grid grid-cols-7 gap-1 text-center">
                    {WEEKDAYS.map((d) => (
                      <span key={d} className="py-1 font-mono text-[10px] uppercase text-muted">
                        {d}
                      </span>
                    ))}
                  </div>

                  <div className="mb-4 grid grid-cols-7 gap-1">
                    {Array.from({ length: leadingBlanks }).map((_, i) => (
                      <span key={`blank-${i}`} />
                    ))}
                    {monthDays.map((day) => {
                      const key = formatDateKey(day);
                      const isPast = key < todayKey;
                      const available = isDayAvailable(day) && !isPast;
                      const isSelected = selectedDate === key;

                      return (
                        <button
                          key={key}
                          type="button"
                          disabled={!available}
                          onClick={() => {
                            setSelectedDate(key);
                            setSelectedTime(null);
                          }}
                          className={`aspect-square rounded-lg text-sm transition-colors ${
                            isSelected
                              ? "bg-accent font-semibold text-background"
                              : available
                                ? "text-foreground hover:bg-accent/10"
                                : "cursor-not-allowed text-muted/30"
                          }`}
                        >
                          {day.getDate()}
                        </button>
                      );
                    })}
                  </div>

                  {selectedDate && (
                    <div>
                      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted">
                        Available times ({getTimezoneLabel()})
                      </p>
                      {timeSlots.length === 0 ? (
                        <p className="text-sm text-muted">No slots available this day.</p>
                      ) : (
                        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                          {timeSlots.map((time) => (
                            <button
                              key={time}
                              type="button"
                              onClick={() => setSelectedTime(time)}
                              className={`rounded-lg border py-2 text-xs font-medium transition-colors ${
                                selectedTime === time
                                  ? "border-accent bg-accent/10 text-accent"
                                  : "border-border text-foreground hover:border-accent/30"
                              }`}
                            >
                              {formatTimeDisplay(time)}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    type="button"
                    disabled={!selectedDate || !selectedTime}
                    onClick={() => setStep("details")}
                    className="mt-5 w-full rounded-xl bg-accent py-2.5 text-sm font-semibold text-background transition-all hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Continue
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
