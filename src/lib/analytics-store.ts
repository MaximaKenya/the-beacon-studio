import { readJsonFile, writeJsonFile } from "@/lib/storage";

export type AnalyticsEvent = {
  id: string;
  name: string;
  props: Record<string, string | number | boolean | undefined>;
  path: string;
  ts: number;
  visitorId: string;
};

export type ReactionEntry = {
  emoji: string;
  sentiment: "positive" | "neutral" | "negative";
  ts: number;
  visitorId: string;
};

export type AnalyticsStore = {
  events: AnalyticsEvent[];
  reactions: ReactionEntry[];
  updatedAt: string;
};

const FILE = "analytics.json";
const MAX_EVENTS = 5000;

const DEFAULT_STORE: AnalyticsStore = {
  events: [],
  reactions: [],
  updatedAt: new Date().toISOString(),
};

export const REACTION_SENTIMENT: Record<
  string,
  "positive" | "neutral" | "negative"
> = {
  "😍": "positive",
  "🔥": "positive",
  "✨": "positive",
  "👍": "positive",
  "😊": "positive",
  "😐": "neutral",
  "🤔": "neutral",
  "👀": "neutral",
  "😕": "negative",
  "👎": "negative",
  "😴": "negative",
};

export async function getAnalyticsStore(): Promise<AnalyticsStore> {
  const store = await readJsonFile<AnalyticsStore>(FILE, DEFAULT_STORE);
  // Normalize partially corrupted / legacy shapes
  if (!Array.isArray(store.events) || !Array.isArray(store.reactions)) {
    return {
      events: Array.isArray(store.events) ? store.events : [],
      reactions: Array.isArray(store.reactions) ? store.reactions : [],
      updatedAt:
        typeof store.updatedAt === "string"
          ? store.updatedAt
          : new Date().toISOString(),
    };
  }
  return store;
}

export async function appendAnalyticsEvent(
  event: Omit<AnalyticsEvent, "id">
): Promise<void> {
  const store = await getAnalyticsStore();
  store.events.push({
    ...event,
    id: `ev_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
  });
  if (store.events.length > MAX_EVENTS) {
    store.events = store.events.slice(-MAX_EVENTS);
  }
  store.updatedAt = new Date().toISOString();
  await writeJsonFile(FILE, store);
}

export async function appendReaction(
  reaction: Omit<ReactionEntry, "sentiment"> & { emoji: string }
): Promise<void> {
  const store = await getAnalyticsStore();
  // One vibe per visitor — changing replaces the previous reaction
  store.reactions = store.reactions.filter(
    (r) => r.visitorId !== reaction.visitorId
  );
  store.reactions.push({
    emoji: reaction.emoji,
    sentiment: REACTION_SENTIMENT[reaction.emoji] ?? "neutral",
    ts: reaction.ts,
    visitorId: reaction.visitorId,
  });
  if (store.reactions.length > 2000) {
    store.reactions = store.reactions.slice(-2000);
  }
  store.updatedAt = new Date().toISOString();
  await writeJsonFile(FILE, store);
}

export type AnalyticsSummary = {
  impressions: number;
  uniqueVisitors: number;
  productClicks: number;
  ctaClicks: number;
  intakeStarts: number;
  intakeSubmits: number;
  bookingClicks: number;
  productViews: number;
  funnel: {
    visit: number;
    productView: number;
    intakeStart: number;
    convert: number;
  };
  impressionsByDay: { day: string; count: number }[];
  topProducts: { id: string; clicks: number }[];
  ctr: {
    productClickRate: number;
    ctaClickRate: number;
  };
  reactions: {
    counts: Record<string, number>;
    sentiment: { positive: number; neutral: number; negative: number };
  };
  wingActivity: {
    wing: string;
    events: number;
  }[];
  recent: AnalyticsEvent[];
};

function dayKey(ts: number): string {
  return new Date(ts).toISOString().slice(0, 10);
}

export function summarizeAnalytics(store: AnalyticsStore): AnalyticsSummary {
  const events = store.events;
  const impressions = events.filter((e) => e.name === "page_view").length;
  const uniqueVisitors = new Set(
    events.filter((e) => e.name === "page_view").map((e) => e.visitorId)
  ).size;

  const productClicks = events.filter((e) => e.name === "product_click").length;
  const productViews = events.filter(
    (e) => e.name === "product_view" || e.path.startsWith("/products/")
  ).length;
  const ctaClicks = events.filter(
    (e) =>
      e.name === "cta_click" ||
      e.name === "booking_cta_click" ||
      e.name === "smart_cta"
  ).length;
  const intakeStarts = events.filter((e) => e.name === "intake_start").length;
  const intakeSubmits = events.filter((e) => e.name === "intake_submit").length;
  const bookingClicks = events.filter(
    (e) => e.name === "booking_cta_click" || e.name === "booking_confirmed"
  ).length;

  const convert = intakeSubmits + events.filter((e) => e.name === "booking_confirmed").length;

  const byDay = new Map<string, number>();
  for (const e of events.filter((ev) => ev.name === "page_view")) {
    const d = dayKey(e.ts);
    byDay.set(d, (byDay.get(d) ?? 0) + 1);
  }
  const impressionsByDay = [...byDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-14)
    .map(([day, count]) => ({ day, count }));

  const productCounts = new Map<string, number>();
  for (const e of events.filter((ev) => ev.name === "product_click" || ev.name === "product_view")) {
    const id = String(e.props.product ?? "unknown");
    productCounts.set(id, (productCounts.get(id) ?? 0) + 1);
  }
  const topProducts = [...productCounts.entries()]
    .map(([id, clicks]) => ({ id, clicks }))
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 8);

  const wings = ["lookfinesse", "confilearn", "cadence", "confirent"];
  const wingActivity = wings.map((wing) => ({
    wing,
    events: events.filter(
      (e) =>
        String(e.props.product ?? "") === wing ||
        e.path.includes(`/products/${wing}`)
    ).length,
  }));

  const reactionCounts: Record<string, number> = {};
  const sentiment = { positive: 0, neutral: 0, negative: 0 };
  for (const r of store.reactions) {
    reactionCounts[r.emoji] = (reactionCounts[r.emoji] ?? 0) + 1;
    sentiment[r.sentiment] += 1;
  }

  return {
    impressions,
    uniqueVisitors,
    productClicks,
    ctaClicks,
    intakeStarts,
    intakeSubmits,
    bookingClicks,
    productViews,
    funnel: {
      visit: Math.max(impressions, uniqueVisitors),
      productView: productViews || productClicks,
      intakeStart: intakeStarts,
      convert,
    },
    impressionsByDay,
    topProducts,
    ctr: {
      productClickRate: impressions
        ? Math.round((productClicks / impressions) * 1000) / 10
        : 0,
      ctaClickRate: impressions
        ? Math.round((ctaClicks / impressions) * 1000) / 10
        : 0,
    },
    reactions: { counts: reactionCounts, sentiment },
    wingActivity,
    recent: [...events].reverse().slice(0, 40),
  };
}
