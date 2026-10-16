import { NextResponse } from "next/server";
import { getStorageHealth } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Process health plus which storage backend is active. */
export async function GET() {
  const health = await getStorageHealth();
  return NextResponse.json(health, {
    status: health.ok ? 200 : 503,
    headers: { "Cache-Control": "no-store" },
  });
}
