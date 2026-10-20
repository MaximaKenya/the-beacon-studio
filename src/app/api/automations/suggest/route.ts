import { NextResponse } from "next/server";
import { suggestAutomationFields } from "@/lib/automations/suggest";
import { parseRequestJson } from "@/lib/storage";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await parseRequestJson(request);
  const description = typeof body.description === "string" ? body.description.trim() : "";
  if (description.length < 8) {
    return NextResponse.json({ ok: false, message: "Describe the reminder or report in a sentence." }, { status: 400 });
  }
  const suggestion = await suggestAutomationFields(description);
  return NextResponse.json({ ok: true, ...suggestion, groq: Boolean(process.env.GROQ_API_KEY?.trim()) });
}
