import { NextResponse } from "next/server";
import {
  appendAnalyticsEvent,
  appendReaction,
  getAnalyticsStore,
  summarizeAnalytics,
  REACTION_SENTIMENT,
} from "@/lib/analytics-store";
import { parseRequestJson } from "@/lib/storage";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await parseRequestJson(request);

    const emojiFromBody =
      typeof body.emoji === "string"
        ? body.emoji
        : typeof (body.props as { emoji?: unknown } | undefined)?.emoji === "string"
          ? (body.props as { emoji: string }).emoji
          : null;

    const isReaction =
      body.type === "reaction" ||
      body.name === "emoji_reaction" ||
      body.name === "vibe_check" ||
      (emojiFromBody && body.name === "reaction");

    if (isReaction && emojiFromBody) {
      await appendReaction({
        emoji: emojiFromBody,
        ts: typeof body.ts === "number" ? body.ts : Date.now(),
        visitorId:
          typeof body.visitorId === "string" ? body.visitorId : "anonymous",
      });

      await appendAnalyticsEvent({
        name: "emoji_reaction",
        props: { emoji: emojiFromBody },
        path: typeof body.path === "string" ? body.path : "/",
        ts: typeof body.ts === "number" ? body.ts : Date.now(),
        visitorId:
          typeof body.visitorId === "string" ? body.visitorId : "anonymous",
      });

      return NextResponse.json({
        ok: true,
        sentiment: REACTION_SENTIMENT[emojiFromBody] ?? "neutral",
      });
    }

    const name = typeof body.name === "string" ? body.name : null;
    if (!name) {
      return NextResponse.json({ error: "Missing event name." }, { status: 400 });
    }

    const props =
      typeof body.props === "object" && body.props && !Array.isArray(body.props)
        ? (body.props as Record<string, string | number | boolean | undefined>)
        : {};

    if (
      (name === "emoji_reaction" || name === "vibe_check") &&
      typeof props.emoji === "string"
    ) {
      await appendReaction({
        emoji: props.emoji,
        ts: typeof body.ts === "number" ? body.ts : Date.now(),
        visitorId:
          typeof body.visitorId === "string" ? body.visitorId : "anonymous",
      });
    }

    await appendAnalyticsEvent({
      name,
      props,
      path: typeof body.path === "string" ? body.path : "/",
      ts: typeof body.ts === "number" ? body.ts : Date.now(),
      visitorId:
        typeof body.visitorId === "string" ? body.visitorId : "anonymous",
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to record event." }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const auth = request.headers.get("x-admin-token");
  const password = process.env.ADMIN_PASSWORD;
  if (!password || auth !== password) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const store = await getAnalyticsStore();
  const summary = summarizeAnalytics(store);
  return NextResponse.json({ summary, store });
}
