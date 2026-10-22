import { NextResponse } from "next/server";
import { logInboundChannel } from "@/lib/channel-log";
import { parseWhatsAppWebhook, whatsAppChallenge } from "@/lib/notify";

export const runtime = "nodejs";

/** Meta webhook verification. Requires WHATSAPP_VERIFY_TOKEN. */
export async function GET(request: Request) {
  const result = whatsAppChallenge(new URL(request.url));
  return new Response(result.body, { status: result.status, headers: { "Content-Type": "text/plain" } });
}

/** Inbound WhatsApp messages. Logged to Admin Mail and Leads. */
export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  const messages = parseWhatsAppWebhook(payload);
  try {
    const ids: string[] = [];
    for (const message of messages) {
      const saved = await logInboundChannel({ channel: "whatsapp", from: message.from, text: message.text });
      ids.push(saved.sourceId);
    }
    return NextResponse.json({ ok: true, logged: ids.length });
  } catch (error) {
    console.error("[whatsapp/webhook]", error instanceof Error ? error.message : "log failed");
    return NextResponse.json({ error: "Could not store the message." }, { status: 500 });
  }
}
