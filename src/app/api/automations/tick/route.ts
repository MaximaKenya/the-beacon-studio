import { NextResponse } from "next/server";
import { runDueJobs } from "@/lib/automations/runtime";
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
  const result = await runDueJobs(new URL(request.url).origin);
  const reminders = await runBookingReminders();
  return NextResponse.json({ ok: true, ...result, reminders });
}

export async function GET(request: Request) {
  return handle(request);
}

export async function POST(request: Request) {
  return handle(request);
}
