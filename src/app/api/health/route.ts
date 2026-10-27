import { NextResponse } from "next/server";
import { getStorageHealth } from "@/lib/storage";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { healthBody, healthDetailAllowed } from "@/lib/health";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Public: {ok} only (503 when storage is down). Storage detail for admin or CRON_SECRET bearer. */
export async function GET(request: Request) {
  const health = await getStorageHealth();
  const detail = healthDetailAllowed(request.headers.get("authorization"), await isAdminAuthenticated().catch(() => false));
  return NextResponse.json(healthBody(health, detail), {
    status: health.ok ? 200 : 503,
    headers: { "Cache-Control": "no-store" },
  });
}
