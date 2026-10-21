"use client";

export type BookingDraftPayload = {
  email: string;
  name?: string;
  phone?: string;
  meetingType?: string;
  date?: string;
  time?: string;
  source?: string;
};

let timer: ReturnType<typeof setTimeout> | undefined;
let lastKey = "";

function payloadKey(input: BookingDraftPayload): string {
  return JSON.stringify({
    email: input.email.trim().toLowerCase(),
    name: input.name?.trim() || "",
    phone: input.phone?.trim() || "",
    meetingType: input.meetingType || "",
    date: input.date || "",
    time: input.time || "",
    source: input.source || "",
  });
}

/** Remember a started booking so the hourly tick can send one nudge. */
export function rememberBookingDraft(input: BookingDraftPayload, immediate = false) {
  const email = input.email.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
  const key = payloadKey(input);
  if (key === lastKey) return;
  if (timer) clearTimeout(timer);
  const send = () => {
    lastKey = key;
    void fetch("/api/booking-drafts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...input, email }),
      keepalive: true,
    }).catch(() => undefined);
  };
  if (immediate) {
    send();
    return;
  }
  timer = setTimeout(send, 700);
}
