import { NextResponse } from "next/server";
import { logInboundChannel } from "@/lib/channel-log";
import { parseSmsInbound } from "@/lib/notify";

export const runtime = "nodejs";

/** Africa's Talking inbound SMS. Logged to Admin Mail and Leads. */
export async function POST(request: Request) {
  const raw = await request.text();
  const parsed = parseSmsInbound(raw, request.headers.get("content-type") || "");
  if (!parsed) return NextResponse.json({ error: "Missing from or text." }, { status: 400 });
  try {
    const saved = await logInboundChannel({ channel: "sms", from: parsed.from, text: parsed.text });
    return NextResponse.json({ ok: true, id: saved.sourceId });
  } catch (error) {
    console.error("[sms/inbound]", error instanceof Error ? error.message : "log failed");
    return NextResponse.json({ error: "Could not store the message." }, { status: 500 });
  }
}
