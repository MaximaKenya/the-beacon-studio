import { NextResponse } from "next/server";
import { listApprovedReviews } from "@/lib/projects";

export const runtime = "nodejs";

/** Public testimonials. Only reviews an admin has approved. */
export async function GET() {
  const reviews = await listApprovedReviews();
  return NextResponse.json({ reviews });
}
