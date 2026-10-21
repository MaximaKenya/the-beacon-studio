import { NextResponse } from "next/server";
import { addInstanceNote, portalSnapshot, saveInstanceConfig, setInstanceStatus, stopFollowUps } from "@/lib/automations/runtime";
import { getPortalSession } from "@/lib/portal-auth";
import { parseRequestJson } from "@/lib/storage";

export const runtime = "nodejs";

export async function GET() {
  const session = await getPortalSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await portalSnapshot(session.email));
}

export async function POST(request: Request) {
  const session = await getPortalSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await parseRequestJson(request);
  const id = typeof body.id === "string" ? body.id : "";
  const action = typeof body.action === "string" ? body.action : "";
  const origin = new URL(request.url).origin;
  if (action === "pause") {
    await setInstanceStatus(id, "paused", origin);
    return NextResponse.json({ ok: true });
  }
  if (action === "resume") {
    await setInstanceStatus(id, "active", origin);
    return NextResponse.json({ ok: true });
  }
  if (action === "config") return NextResponse.json(await saveInstanceConfig(id, body.config, session.email));
  if (action === "note") return NextResponse.json(await addInstanceNote(id, String(body.text || ""), "client", session.email));
  if (action === "stop") return NextResponse.json(await stopFollowUps(id, session.email));
  return NextResponse.json({ error: "Unknown action." }, { status: 400 });
}
