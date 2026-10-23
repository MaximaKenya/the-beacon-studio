import { templateById } from "@/automations/templates/public";
import { nairobiDateKey } from "@/lib/time";

export type DayBucket = {
  date: string;
  runs: number;
  messages: number;
  leads: number;
  bookings: number;
  reviews: number;
  byInstance: Record<string, { runs: number; messages: number; leads: number; bookings: number; reviews: number }>;
};

export type NamedValue = { label: string; value: number };

export type AutomationAnalytics = {
  days: DayBucket[];
  channels: NamedValue[];
  types: NamedValue[];
  collectedKes: number;
  outstandingKes: number;
  nps: number | null;
  reviewCount: number;
  month: { runs: number; messages: number; leads: number; bookings: number; collectedKes: number };
};

type LogLike = { instanceId: string; at: string; level?: string };
type DeliveryLike = { instanceId: string; at: string; channel: string; status: string };
type LeadLike = { instanceId: string; at: string };
type BookingLike = { instanceId: string; start: string };
type ReviewLike = { instanceId: string; at: string; score: number };
type ChargeLike = { instanceId: string; status: string; amountKes: number; paidAt?: string };
type InstanceLike = { id: string; templateId: string };

function emptyCell(): DayBucket["byInstance"][string] {
  return { runs: 0, messages: 0, leads: 0, bookings: 0, reviews: 0 };
}

function bump(bucket: DayBucket, instanceId: string, key: keyof ReturnType<typeof emptyCell>) {
  bucket[key] += 1;
  const cell = bucket.byInstance[instanceId] || emptyCell();
  cell[key] += 1;
  bucket.byInstance[instanceId] = cell;
}

export function npsFromScores(scores: number[]): number | null {
  if (scores.length === 0) return null;
  const promoters = scores.filter((score) => score >= 9).length;
  const detractors = scores.filter((score) => score <= 6).length;
  return Math.round(((promoters - detractors) / scores.length) * 100);
}

export function buildAnalytics(input: {
  instances: InstanceLike[];
  logs: LogLike[];
  deliveries: DeliveryLike[];
  leads: LeadLike[];
  bookings: BookingLike[];
  reviews: ReviewLike[];
  charges: ChargeLike[];
  now?: Date;
  days?: number;
}): AutomationAnalytics {
  const now = input.now ?? new Date();
  const span = input.days ?? 90;
  const ids = new Set(input.instances.map((item) => item.id));
  const days: DayBucket[] = [];
  const index = new Map<string, DayBucket>();
  for (let offset = span - 1; offset >= 0; offset -= 1) {
    const date = nairobiDateKey(new Date(now.getTime() - offset * 24 * 60 * 60 * 1000));
    const bucket: DayBucket = { date, runs: 0, messages: 0, leads: 0, bookings: 0, reviews: 0, byInstance: {} };
    days.push(bucket);
    index.set(date, bucket);
  }
  const monthKey = nairobiDateKey(now).slice(0, 7);
  const month = { runs: 0, messages: 0, leads: 0, bookings: 0, collectedKes: 0 };

  for (const log of input.logs) {
    if (!ids.has(log.instanceId) || log.level === "error") continue;
    const bucket = index.get(nairobiDateKey(log.at));
    if (!bucket) continue;
    bump(bucket, log.instanceId, "runs");
    if (nairobiDateKey(log.at).startsWith(monthKey)) month.runs += 1;
  }
  const channels = new Map<string, number>();
  const types = new Map<string, number>();
  for (const delivery of input.deliveries) {
    if (!ids.has(delivery.instanceId) || delivery.status !== "sent") continue;
    channels.set(delivery.channel, (channels.get(delivery.channel) || 0) + 1);
    const bucket = index.get(nairobiDateKey(delivery.at));
    if (bucket) bump(bucket, delivery.instanceId, "messages");
    if (nairobiDateKey(delivery.at).startsWith(monthKey)) month.messages += 1;
    const templateId = input.instances.find((item) => item.id === delivery.instanceId)?.templateId;
    const name = (templateId && templateById(templateId)?.name) || templateId || "Automation";
    types.set(name, (types.get(name) || 0) + 1);
  }
  for (const lead of input.leads) {
    if (!ids.has(lead.instanceId)) continue;
    const bucket = index.get(nairobiDateKey(lead.at));
    if (bucket) bump(bucket, lead.instanceId, "leads");
    if (nairobiDateKey(lead.at).startsWith(monthKey)) month.leads += 1;
  }
  for (const booking of input.bookings) {
    if (!ids.has(booking.instanceId)) continue;
    const bucket = index.get(nairobiDateKey(booking.start));
    if (bucket) bump(bucket, booking.instanceId, "bookings");
    if (nairobiDateKey(booking.start).startsWith(monthKey)) month.bookings += 1;
  }
  for (const review of input.reviews) {
    if (!ids.has(review.instanceId)) continue;
    const bucket = index.get(nairobiDateKey(review.at));
    if (bucket) bump(bucket, review.instanceId, "reviews");
  }

  let collectedKes = 0;
  let outstandingKes = 0;
  for (const charge of input.charges) {
    if (!ids.has(charge.instanceId)) continue;
    if (charge.status === "paid") {
      collectedKes += charge.amountKes;
      if (charge.paidAt && nairobiDateKey(charge.paidAt).startsWith(monthKey)) month.collectedKes += charge.amountKes;
    } else outstandingKes += charge.amountKes;
  }
  const scores = input.reviews.filter((review) => ids.has(review.instanceId)).map((review) => review.score);

  const toSlices = (map: Map<string, number>): NamedValue[] =>
    [...map.entries()].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);

  return {
    days,
    channels: toSlices(channels),
    types: toSlices(types),
    collectedKes,
    outstandingKes,
    nps: npsFromScores(scores),
    reviewCount: scores.length,
    month,
  };
}

export function filterDays(days: DayBucket[], from: string, to: string, instanceId?: string): DayBucket[] {
  return days
    .filter((day) => day.date >= from && day.date <= to)
    .map((day) => {
      if (!instanceId) return day;
      const cell = day.byInstance[instanceId] || emptyCell();
      return {
        ...day,
        runs: cell.runs,
        messages: cell.messages,
        leads: cell.leads,
        bookings: cell.bookings,
        reviews: cell.reviews,
      };
    });
}
