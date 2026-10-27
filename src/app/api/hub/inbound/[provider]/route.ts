import { NextResponse } from "next/server";
import { safeEqual } from "@/lib/admin-auth";
import { resolveApps } from "@/lib/hub/apps";
import { normalizePhone, type Channel } from "@/lib/hub/policy";
import { addSuppression } from "@/lib/hub/service";
import { mutateHub } from "@/lib/hub/store";

export const runtime = "nodejs";

const STOP_WORDS = /^\s*(stop|stopall|unsubscribe|cancel|end|quit|acha|toka)\b/i;

/**
 * STUB inbound handler until a provider is chosen. Each real provider will
 * verify its own webhook signature here. Until then the caller must send
 * X-Hub-Inbound-Token = HUB_INBOUND_TOKEN. Body: {from, text, channel?, app?}.
 */
export async function POST(request: Request, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;
  const token = process.env.HUB_INBOUND_TOKEN?.trim();
  if (!token) return NextResponse.json({ error: "inbound_not_configured" }, { status: 503 });
  if (!safeEqual(request.headers.get("x-hub-inbound-token") || "", token)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const from = normalizePhone(body.from);
  const text = typeof body.text === "string" ? body.text : "";
  const channel: Channel = body.channel === "whatsapp" ? "whatsapp" : "sms";
  if (!from) return NextResponse.json({ error: "validation" }, { status: 400 });
  if (!STOP_WORDS.test(text)) return NextResponse.json({ ok: true, provider, optOut: false });
  const result = await mutateHub((s) => {
    const apps = resolveApps(s);
    // Explicit app, else every app that has messaged this number on this channel.
    const targets = typeof body.app === "string"
      ? [body.app]
      : [...new Set(s.messages.filter((m) => m.to === from && m.channel === channel).map((m) => m.app))];
    const done: string[] = [];
    for (const app of targets) {
      const creds = apps.find((a) => a.app === app);
      if (creds) { addSuppression(s, creds, from, channel, `inbound:${provider}`); done.push(app); }
    }
    return done;
  });
  return NextResponse.json({ ok: true, provider, optOut: true, apps: result });
}
