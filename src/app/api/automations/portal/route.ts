import { NextResponse } from "next/server";
import { addInstanceNote, markOwnedCharge, portalSnapshot, rememberShare, requestOwnerInvoice, runOwnerHook, saveInstanceConfig, setInstanceStatus, stopFollowUps } from "@/lib/automations/runtime";
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
  if (action === "config") return NextResponse.json(await saveInstanceConfig(id, body.config, session.email, origin));
  if (action === "note") return NextResponse.json(await addInstanceNote(id, String(body.text || ""), "client", session.email));
  if (action === "stop") return NextResponse.json(await stopFollowUps(id, session.email));
  if (action === "mark-paid") return NextResponse.json(await markOwnedCharge(String(body.chargeId || ""), session.email, "client"));
  if (action === "shared") return NextResponse.json(await rememberShare(id, String(body.key || "link"), session.email));
  if (action === "request-invoice") return NextResponse.json(await requestOwnerInvoice(session.email));
  if (action === "inbox" || action === "notes") {
    return NextResponse.json(await runOwnerHook(session.email, id, action, body, origin));
  }
  return NextResponse.json({ error: "Unknown action." }, { status: 400 });
}
