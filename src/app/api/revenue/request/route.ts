import { NextResponse } from "next/server";
import { parseRevenueRequest } from "@/lib/revenue-requests-rules";
import { saveRevenueRequest } from "@/lib/revenue-requests";
import { parseRequestJson } from "@/lib/storage";

export const runtime = "nodejs";

/** Public add-on, partner and partnership requests. Saves a lead and alerts admin. No payment is taken. */
export async function POST(request: Request) {
  try {
    const parsed = parseRevenueRequest(await parseRequestJson(request));
    if (!parsed.ok) return NextResponse.json({ ok: false, error: parsed.error }, { status: 400 });
    if (parsed.value.kind === "template") return NextResponse.json({ ok: false, error: "Use the templates form." }, { status: 400 });
    await saveRevenueRequest(parsed.value);
    return NextResponse.json({ ok: true, message: "Thanks. We will reply by email within one working day." });
  } catch (error) {
    console.error("[revenue-request]", error instanceof Error ? error.message : "failed");
    return NextResponse.json({ ok: false, error: "Could not send that. Try again." }, { status: 500 });
  }
}
