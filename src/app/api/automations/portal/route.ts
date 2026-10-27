import { NextResponse } from "next/server";
import { addInstanceNote, markOwnedCharge, portalSnapshot, rememberShare, requestOwnerInvoice, runOwnerHook, saveInstanceConfig, saveOrgInputs, ownerSetStatus, stopFollowUps } from "@/lib/automations/runtime";
import { shareTokenMatches } from "@/lib/automations/share";
import { loadAutomations } from "@/lib/automations/store";
import { getPortalSession } from "@/lib/portal-auth";
import { parseRequestJson } from "@/lib/storage";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const demoEmail = url.searchParams.get("demo");
  if (demoEmail) {
    // Read-only demo view: signed link from /admin, and only for demo-only owners.
    const token = url.searchParams.get("t") || "";
    if (!shareTokenMatches("demo-portal", demoEmail, token) || !(await isDemoOnlyOwner(demoEmail))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ ...(await portalSnapshot(demoEmail, true)), readOnly: true });
  }
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
  if (action === "pause" || action === "resume") {
    const result = await ownerSetStatus(id, action === "pause" ? "paused" : "active", session.email, origin);
    return NextResponse.json(result, { status: result.ok ? 200 : 403 });
  }
  if (action === "config") return NextResponse.json(await saveInstanceConfig(id, body.config, session.email, origin));
  if (action === "org") {
    const result = await saveOrgInputs(id, body.org, session.email, origin);
    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  }
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

async function isDemoOnlyOwner(email: string): Promise<boolean> {
  const normalized = email.trim().toLowerCase();
  const doc = await loadAutomations();
  const owned = doc.instances.filter((item) => item.ownerEmail === normalized);
  return owned.length > 0 && owned.every((item) => item.demo);
}
