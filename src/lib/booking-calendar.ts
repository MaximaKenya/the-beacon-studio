import { siteConfig } from "@/data/site";

const TZID = "Africa/Nairobi";

export type CalendarMethod = "REQUEST" | "CANCEL";

export type BookingCalendarInput = {
  id?: string;
  date: string;
  time: string;
  durationMinutes: number;
  title: string;
  description: string;
  location?: string;
  url?: string;
  organizerEmail: string;
  attendeeEmail: string;
  attendeeName: string;
  sequence?: number;
  method?: CalendarMethod;
};

export function nairobiStart(date: string, time: string): Date {
  return new Date(`${date}T${time}:00+03:00`);
}

export function formatNairobiWhen(date: string, time: string, durationMinutes = 30): string {
  const start = nairobiStart(date, time);
  if (Number.isNaN(start.getTime())) return `${date} ${time} (Africa/Nairobi, EAT)`;
  const end = new Date(start.getTime() + durationMinutes * 60_000);
  const dateFmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: TZID,
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const timeFmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: TZID,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  return `${dateFmt.format(start)}, ${timeFmt.format(start)}–${timeFmt.format(end)} (Africa/Nairobi, EAT)`;
}

function nairobiStamp(ms: number): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TZID,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(ms));
  const get = (type: string) => parts.find((part) => part.type === type)?.value || "00";
  return `${get("year")}${get("month")}${get("day")}T${get("hour")}${get("minute")}${get("second")}`;
}

function icsEscape(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\r\n|\n|\r/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function fold(line: string): string {
  if (Buffer.byteLength(line) <= 75) return line;
  let out = "";
  let width = 0;
  for (const char of line) {
    const size = Buffer.byteLength(char);
    if (width + size > 75) {
      out += "\r\n ";
      width = 1;
    }
    out += char;
    width += size;
  }
  return out;
}

function quoteParam(value: string): string {
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, "")}"`;
}

export function buildBookingIcs(input: BookingCalendarInput): string {
  const start = nairobiStart(input.date, input.time);
  const end = new Date(start.getTime() + input.durationMinutes * 60_000);
  const method = input.method || "REQUEST";
  const uid = `${input.id || `${input.date}-${input.time}-${input.attendeeEmail}`}@thebeaconstudio.co.ke`;
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//The Beacon Studio//Booking//EN",
    "CALSCALE:GREGORIAN",
    `METHOD:${method}`,
    "BEGIN:VTIMEZONE",
    `TZID:${TZID}`,
    "BEGIN:STANDARD",
    "DTSTART:19700101T000000",
    "TZOFFSETFROM:+0300",
    "TZOFFSETTO:+0300",
    "TZNAME:EAT",
    "END:STANDARD",
    "END:VTIMEZONE",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `SEQUENCE:${input.sequence || 0}`,
    `DTSTAMP:${nairobiStamp(Date.now())}`,
    `DTSTART;TZID=${TZID}:${nairobiStamp(start.getTime())}`,
    `DTEND;TZID=${TZID}:${nairobiStamp(end.getTime())}`,
    `SUMMARY:${icsEscape(input.title)}`,
    `DESCRIPTION:${icsEscape(input.description)}`,
    `LOCATION:${icsEscape(input.location || "WhatsApp")}`,
    ...(input.url ? [`URL:${input.url}`] : []),
    `ORGANIZER;CN=${quoteParam(siteConfig.brand.name)}:mailto:${input.organizerEmail}`,
    `ATTENDEE;CN=${quoteParam(input.attendeeName)};ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=TRUE:mailto:${input.attendeeEmail}`,
    method === "CANCEL" ? "STATUS:CANCELLED" : "STATUS:CONFIRMED",
  ];
  if (method === "REQUEST") {
    lines.push(
      "BEGIN:VALARM",
      "TRIGGER:-PT24H",
      "ACTION:DISPLAY",
      "DESCRIPTION:Call in 24 hours",
      "END:VALARM",
      "BEGIN:VALARM",
      "TRIGGER:-PT1H",
      "ACTION:DISPLAY",
      "DESCRIPTION:Call in 1 hour",
      "END:VALARM"
    );
  }
  lines.push("END:VEVENT", "END:VCALENDAR");
  return lines.map(fold).join("\r\n");
}

function googleRange(date: string, time: string, durationMinutes: number): string {
  const start = nairobiStart(date, time);
  const end = new Date(start.getTime() + durationMinutes * 60_000);
  return `${nairobiStamp(start.getTime()).slice(0, 15)}/${nairobiStamp(end.getTime()).slice(0, 15)}`;
}

export function googleCalendarUrl(input: BookingCalendarInput): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: input.title,
    dates: googleRange(input.date, input.time, input.durationMinutes),
    ctz: TZID,
    details: input.description,
    location: input.location || "",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function outlookCalendarUrl(input: BookingCalendarInput): string {
  const start = nairobiStart(input.date, input.time);
  const end = new Date(start.getTime() + input.durationMinutes * 60_000);
  const iso = (ms: number) => {
    const stamp = nairobiStamp(ms);
    return `${stamp.slice(0, 4)}-${stamp.slice(4, 6)}-${stamp.slice(6, 8)}T${stamp.slice(9, 11)}:${stamp.slice(11, 13)}:${stamp.slice(13, 15)}+03:00`;
  };
  const params = new URLSearchParams({
    rru: "addevent",
    startdt: iso(start.getTime()),
    enddt: iso(end.getTime()),
    subject: input.title,
    body: input.description,
    location: input.location || "",
    allday: "false",
  });
  return `https://outlook.live.com/calendar/0/action/compose?${params.toString()}`;
}
