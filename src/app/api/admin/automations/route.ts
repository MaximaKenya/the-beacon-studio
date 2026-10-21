import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { addInstanceNote, adminSnapshot, saveInstanceConfig, setInstanceStatus, stopFollowUps } from "@/lib/automations/runtime";
import { parseRequestJson } from "@/lib/storage";

export const runtime = "nodejs";

export async function GET() {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await adminSnapshot());
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await parseRequestJson(request);
  const id = typeof body.id === "string" ? body.id : "";
  const action = typeof body.action === "string" ? body.action : "";
  const origin = new URL(request.url).origin;
  if (action === "activate") {
    await setInstanceStatus(id, "active", origin);
    return NextResponse.json({ ok: true });
  }
  if (action === "pause") {
    await setInstanceStatus(id, "paused", origin);
    return NextResponse.json({ ok: true });
  }
  if (action === "resume") {
    await setInstanceStatus(id, "active", origin);
    return NextResponse.json({ ok: true });
  }
  if (action === "config") return NextResponse.json(await saveInstanceConfig(id, body.config));
  if (action === "note") return NextResponse.json(await addInstanceNote(id, String(body.text || ""), "studio"));
  if (action === "stop") return NextResponse.json(await stopFollowUps(id));
  return NextResponse.json({ error: "Unknown action." }, { status: 400 });
}
