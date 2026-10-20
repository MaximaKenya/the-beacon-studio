import { NextResponse } from "next/server";
import { dispatchHook } from "@/lib/automations/runtime";
import { parseRequestJson } from "@/lib/storage";

export const runtime = "nodejs";

type Params = { params: Promise<{ kind: string; slug: string }> };

export async function POST(request: Request, { params }: Params) {
  const { kind, slug } = await params;
  const body = await parseRequestJson(request);
  const result = await dispatchHook(slug, kind, body, new URL(request.url).origin);
  return NextResponse.json({ ok: result.ok, message: result.message, reply: result.reply }, { status: result.status });
}
