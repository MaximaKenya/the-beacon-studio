import { NextResponse } from "next/server";
import { flushWaitingDeliveries, sendAdminDigest, sweepTrials, claimAutomationTick, finishAutomationTick } from "@/lib/automations/lifecycle";
import { runDueJobs } from "@/lib/automations/runtime";
import { loadAutomations, saveAutomations } from "@/lib/automations/store";
import { runAbandonedBookingNudges } from "@/lib/booking-drafts";
import { runBookingReminders } from "@/lib/booking-reminders";

export const runtime = "nodejs";

function authorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;
  const header = request.headers.get("authorization") || "";
  const url = new URL(request.url);
  return header === `Bearer ${secret}` || url.searchParams.get("secret") === secret;
}

async function handle(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const origin = new URL(request.url).origin;
  const claimed = await claimAutomationTick();
  if (!claimed) {
    return NextResponse.json({ ok: true, skipped: true, ran: 0, reason: "A tick is already running." });
  }
  try {
    const doc = await loadAutomations();
    await sweepTrials(doc, origin);
    const flushed = await flushWaitingDeliveries(doc);
    await saveAutomations(doc);
    const result = await runDueJobs(origin);
    const reminders = await runBookingReminders();
    const abandoned = await runAbandonedBookingNudges();
    const digestDoc = await loadAutomations();
    const digest = await sendAdminDigest(digestDoc);
    await saveAutomations(digestDoc);
    await finishAutomationTick(true);
    return NextResponse.json({ ok: true, ...result, reminders, abandoned, flushed, digest });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Tick failed";
    await finishAutomationTick(false, message);
    console.error("[automations/tick]", message);
    return NextResponse.json({ ok: false, error: "Tick failed" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  return handle(request);
}

export async function POST(request: Request) {
  return handle(request);
}
