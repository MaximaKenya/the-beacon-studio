import { NextResponse } from "next/server";
import { authenticateHub } from "@/lib/hub/auth";
import { CHANNELS, normalizePhone, type Channel } from "@/lib/hub/policy";
import { addSuppression } from "@/lib/hub/service";
import { mutateHub } from "@/lib/hub/store";

export const runtime = "nodejs";

/** Body: {app, to, channel?: 'sms'|'whatsapp' (omit for both)}. */
export async function POST(request: Request) {
  const auth = await authenticateHub(request);
  if (auth instanceof NextResponse) return auth;
  let body: Record<string, unknown>;
  try {
    body = JSON.parse(auth.rawBody);
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  if (body.app !== auth.creds.app) return NextResponse.json({ error: "app_mismatch" }, { status: 403 });
  const to = normalizePhone(body.to);
  if (!to) return NextResponse.json({ error: "validation", reason: "to must be E.164" }, { status: 400 });
  if (body.channel !== undefined && !CHANNELS.includes(body.channel as Channel)) {
    return NextResponse.json({ error: "validation", reason: "bad channel" }, { status: 400 });
  }
  const channels = body.channel ? [body.channel as Channel] : CHANNELS;
  await mutateHub((s) => channels.forEach((c) => addSuppression(s, auth.creds, to, c, "api")));
  return NextResponse.json({ ok: true, app: auth.creds.app, to, channels });
}
