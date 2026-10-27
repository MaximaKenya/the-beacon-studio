import { NextResponse } from "next/server";
import { safeEqual } from "@/lib/admin-auth";
import { resolveApps } from "@/lib/hub/apps";
import { deliverCallbacks, dispatchQueued } from "@/lib/hub/service";
import { mutateHub } from "@/lib/hub/store";

export const runtime = "nodejs";

/** Cron: dispatch (only if HUB_SENDING_ENABLED=true) and retry signed callbacks. Bearer CRON_SECRET. */
async function handle(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret || !safeEqual(request.headers.get("authorization") || "", `Bearer ${secret}`)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const result = await mutateHub(async (s) => {
    const apps = resolveApps(s);
    const dispatch = await dispatchQueued(s, apps);
    const callbacks = await deliverCallbacks(s, apps);
    return { dispatch, callbacks };
  });
  return NextResponse.json({ ok: true, ...result });
}

export const GET = handle;
export const POST = handle;
