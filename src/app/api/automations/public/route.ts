import { NextResponse } from "next/server";
import { bookSlot, bookingView, submitReview } from "@/lib/automations/runtime";
import { parseRequestJson } from "@/lib/storage";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const slug = new URL(request.url).searchParams.get("slug") || "";
  const view = await bookingView(slug);
  if (!view) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(view);
}

export async function POST(request: Request) {
  const body = await parseRequestJson(request);
  const slug = typeof body.slug === "string" ? body.slug : "";
  const origin = new URL(request.url).origin;
  if (body.action === "book") {
    const result = await bookSlot(
      slug,
      {
        start: String(body.start || ""),
        name: String(body.name || ""),
        email: typeof body.email === "string" ? body.email : undefined,
        phone: typeof body.phone === "string" ? body.phone : undefined,
        note: typeof body.note === "string" ? body.note : undefined,
      },
      origin
    );
    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  }
  if (body.action === "review") {
    const result = await submitReview(
      slug,
      {
        score: Number(body.score),
        comment: typeof body.comment === "string" ? body.comment : undefined,
        name: typeof body.name === "string" ? body.name : undefined,
        email: typeof body.email === "string" ? body.email : undefined,
      },
      origin
    );
    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  }
  return NextResponse.json({ error: "Unknown action." }, { status: 400 });
}
