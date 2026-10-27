import { NextResponse } from "next/server";
import { authenticateHub } from "@/lib/hub/auth";
import { acceptMessage, parseSendBody } from "@/lib/hub/service";
import { mutateHub } from "@/lib/hub/store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const auth = await authenticateHub(request);
  if (auth instanceof NextResponse) return auth;
  let json: unknown;
  try {
    json = JSON.parse(auth.rawBody);
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const parsed = parseSendBody(json);
  if (!parsed.ok) return NextResponse.json({ error: "validation", reason: parsed.error }, { status: 400 });
  if (parsed.input.app !== auth.creds.app) return NextResponse.json({ error: "app_mismatch" }, { status: 403 });
  const result = await mutateHub((s) => acceptMessage(s, auth.creds, parsed.input));
  return NextResponse.json({ id: result.id, status: result.status, ...(result.reason ? { reason: result.reason } : {}) }, { status: 202 });
}
