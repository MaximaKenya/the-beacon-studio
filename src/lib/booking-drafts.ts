import { renderBrandEmail, publicSiteUrl } from "@/lib/brand-email";
import { readBookings } from "@/lib/booking-mail";
import { isResendConfigured, sendResendEmail } from "@/lib/resend";
import { mutateJsonFile, readJsonFile } from "@/lib/storage";
import { claimIsFresh } from "@/lib/tick-claim";
import { isValidEmail, normalizeEmail } from "@/lib/validation";

export const DRAFT_FILE = "booking-drafts.json";
export const NUDGE_AFTER_MS = 2 * 60 * 60 * 1000;
const REPEAT_GAP_MS = 30 * 24 * 60 * 60 * 1000;

export type BookingDraft = {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  meetingType?: string;
  date?: string;
  time?: string;
  source?: string;
  startedAt: string;
  updatedAt: string;
  completedAt?: string;
  nudgeSentAt?: string;
  nudgeClaimAt?: string;
  nudgeOptOut?: boolean;
};

export type BookingDraftInput = {
  email: string;
  name?: string;
  phone?: string;
  meetingType?: string;
  date?: string;
  time?: string;
  source?: string;
};

export function abandonedNudgeDue(draft: BookingDraft, nowMs: number, alreadyBooked = false): boolean {
  if (!draft.email || draft.nudgeOptOut || draft.nudgeSentAt || draft.completedAt || alreadyBooked) return false;
  const activity = Date.parse(draft.updatedAt || draft.startedAt);
  if (Number.isNaN(activity)) return false;
  return nowMs - activity >= NUDGE_AFTER_MS;
}

export function draftWasBooked(
  draft: BookingDraft,
  bookings: { email?: string; createdAt?: string }[]
): boolean {
  const start = Date.parse(draft.startedAt);
  return bookings.some((booking) => {
    if ((booking.email || "").trim().toLowerCase() !== draft.email) return false;
    const at = Date.parse(booking.createdAt || "");
    if (Number.isNaN(at) || Number.isNaN(start)) return true;
    return at >= start - 60_000;
  });
}

function clip(value: string | undefined, max: number): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, max);
}

export async function saveBookingDraft(input: BookingDraftInput): Promise<void> {
  const email = normalizeEmail(input.email);
  if (!isValidEmail(email)) return;
  const now = new Date().toISOString();
  await mutateJsonFile<BookingDraft[]>(DRAFT_FILE, [], (rows) => {
    const opted = rows.some((row) => row.email === email && row.nudgeOptOut);
    let draft = rows.find((row) => row.email === email && !row.completedAt && !row.nudgeSentAt);
    if (!draft) {
      const recentNudge = rows.some((row) => {
        if (row.email !== email || !row.nudgeSentAt) return false;
        return Date.now() - Date.parse(row.nudgeSentAt) < REPEAT_GAP_MS;
      });
      if (recentNudge || opted) return rows;
      draft = { id: crypto.randomUUID(), email, startedAt: now, updatedAt: now };
      rows.push(draft);
    }
    draft.updatedAt = now;
    draft.name = clip(input.name, 120) || draft.name;
    draft.phone = clip(input.phone, 40) || draft.phone;
    draft.meetingType = clip(input.meetingType, 80) || draft.meetingType;
    draft.date = clip(input.date, 10) || draft.date;
    draft.time = clip(input.time, 5) || draft.time;
    draft.source = clip(input.source, 80) || draft.source;
    if (opted) draft.nudgeOptOut = true;
    return rows;
  });
}

export async function completeBookingDrafts(email: string): Promise<void> {
  const normalized = normalizeEmail(email);
  if (!normalized) return;
  const now = new Date().toISOString();
  await mutateJsonFile<BookingDraft[]>(DRAFT_FILE, [], (rows) => {
    for (const row of rows) {
      if (row.email === normalized && !row.completedAt) row.completedAt = now;
    }
    return rows;
  });
}

export async function optOutBookingDraft(id: string): Promise<boolean> {
  let found = false;
  await mutateJsonFile<BookingDraft[]>(DRAFT_FILE, [], (rows) => {
    const hit = rows.find((row) => row.id === id);
    if (!hit) return rows;
    found = true;
    for (const row of rows) {
      if (row.email === hit.email) row.nudgeOptOut = true;
    }
    return rows;
  });
  return found;
}

export function composeAbandonedEmail(draft: BookingDraft): { html: string; text: string; subject: string } {
  const origin = publicSiteUrl();
  const unsubscribe = `${origin}/api/booking-drafts/${draft.id}/unsubscribe`;
  const letter = renderBrandEmail({
    heading: "Still want that call?",
    preview: "You started a booking and did not finish it. One note, then we stop.",
    greeting: `Hi ${draft.name || "there"},`,
    paragraphs: [
      "You started a booking with The Beacon Studio and did not finish it. The free 20-minute audit is still open on weekday mornings and afternoons, Nairobi time.",
      "If now is not the time, you can ignore this. We will not send another note about this draft.",
    ],
    actions: [{ label: "Pick a time", href: `${origin}/book` }],
    unsubscribeUrl: unsubscribe,
    unsubscribeNote: "from notes about an unfinished booking.",
  });
  return { ...letter, subject: "Still want that call? — The Beacon Studio" };
}

async function sendAbandonedEmail(draft: BookingDraft): Promise<boolean> {
  if (!isValidEmail(draft.email) || !isResendConfigured()) return false;
  const letter = composeAbandonedEmail(draft);
  const result = await sendResendEmail({
    to: draft.email,
    subject: letter.subject,
    html: letter.html,
    text: letter.text,
    idempotencyKey: `booking-abandoned/${draft.id}`,
    headers: { "List-Unsubscribe": `<${publicSiteUrl()}/api/booking-drafts/${draft.id}/unsubscribe>` },
  });
  return result.sent;
}

export async function runAbandonedBookingNudges(now = new Date()): Promise<{ sent: number; due: number }> {
  const drafts = await readJsonFile<BookingDraft[]>(DRAFT_FILE, []);
  const bookings = await readBookings();
  let sent = 0;
  let due = 0;
  for (const draft of drafts) {
    const booked = draftWasBooked(draft, bookings);
    if (!abandonedNudgeDue(draft, now.getTime(), booked)) continue;
    due += 1;
    let claimed = false;
    await mutateJsonFile<BookingDraft[]>(DRAFT_FILE, [], (rows) => {
      claimed = false;
      const row = rows.find((item) => item.id === draft.id);
      if (!row || !abandonedNudgeDue(row, now.getTime(), draftWasBooked(row, bookings))) return rows;
      if (claimIsFresh(row.nudgeClaimAt, now.getTime())) return rows;
      row.nudgeClaimAt = now.toISOString();
      claimed = true;
      return rows;
    });
    if (!claimed) continue;
    const emailed = await sendAbandonedEmail(draft);
    if (!emailed) continue;
    await mutateJsonFile<BookingDraft[]>(DRAFT_FILE, [], (rows) => {
      const row = rows.find((item) => item.id === draft.id);
      if (row) row.nudgeSentAt = now.toISOString();
      return rows;
    });
    sent += 1;
  }
  return { sent, due };
}
