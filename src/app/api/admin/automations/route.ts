import { NextResponse } from "next/server";
import { markReferralRedeemed } from "@/lib/referrals";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { createNamedDemo, resetDemoSandbox, runSandboxNow } from "@/lib/automations/sandbox";
import { addInstanceNote, adminSnapshot, changeTrial, markBundleInvoicePaid, markLeadRead, markOwnedCharge, retryFailedJobs, saveInstanceConfig, saveOrgInputs, setInstanceStatus, stopFollowUps } from "@/lib/automations/runtime";
import { shareToken } from "@/lib/automations/share";
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
  if (action === "config") return NextResponse.json(await saveInstanceConfig(id, body.config, undefined, origin));
  if (action === "org") {
    const result = await saveOrgInputs(id, body.org, undefined, origin);
    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  }
  if (action === "note") return NextResponse.json(await addInstanceNote(id, String(body.text || ""), "studio"));
  if (action === "stop") return NextResponse.json(await stopFollowUps(id));
  if (action === "run") return NextResponse.json(await runSandboxNow(id, body.sendToMe === true));
  if (action === "create-demo") {
    const templates = Array.isArray(body.templates) ? body.templates.map(String).slice(0, 60) : [];
    const result = await createNamedDemo(String(body.name || ""), templates);
    const viewUrl = result.email ? `/portal/demo?e=${encodeURIComponent(result.email)}&t=${shareToken("demo-portal", result.email)}` : undefined;
    return NextResponse.json({ ...result, viewUrl }, { status: result.ok ? 200 : 400 });
  }
  if (action === "reset-demo") return NextResponse.json(await resetDemoSandbox());
  if (action === "mark-paid") return NextResponse.json(await markOwnedCharge(String(body.chargeId || ""), undefined, "studio"));
  if (action === "redeem-referral") return NextResponse.json(await markReferralRedeemed(String(body.referralId || "")));
  if (action === "mark-invoice") return NextResponse.json(await markBundleInvoicePaid(String(body.paymentId || "")));
  if (action === "extend-trial") return NextResponse.json(await changeTrial(id, "extend", Number(body.days) || 14));
  if (action === "end-trial") return NextResponse.json(await changeTrial(id, "end"));
  if (action === "retry-failed") return NextResponse.json(await retryFailedJobs());
  if (action === "mark-lead-read") return NextResponse.json(await markLeadRead(String(body.leadId || id)));
  return NextResponse.json({ error: "Unknown action." }, { status: 400 });
}
