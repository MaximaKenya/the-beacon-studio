import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { findAppByKey, resolveApps, type AppCreds } from "./apps";
import { ReplayGuard, verifySignature } from "./signature";
import { loadHub } from "./store";
import type { HubState } from "./state";

const replay = new ReplayGuard();

export type HubAuthed = { creds: AppCreds; apps: AppCreds[]; rawBody: string; state: HubState };

/** Bearer app key + HMAC timestamp/signature + replay + per-app rate limit. */
export async function authenticateHub(request: Request): Promise<HubAuthed | NextResponse> {
  const rawBody = request.method === "GET" ? "" : await request.text();
  const header = request.headers.get("authorization") || "";
  const key = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  const state = await loadHub();
  const apps = resolveApps(state);
  const creds = findAppByKey(apps, key);
  if (!creds) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const sig = request.headers.get("x-beacon-signature");
  const v = verifySignature(creds.secret, request.headers.get("x-beacon-timestamp"), sig, rawBody);
  if (!v.ok) return NextResponse.json({ error: "unauthorized", reason: v.reason }, { status: 401 });
  if (!replay.check(sig || "")) return NextResponse.json({ error: "unauthorized", reason: "replayed" }, { status: 401 });
  const hit = rateLimit(`hub:${creds.app}`, state.policy.appRatePerMinute, 60_000);
  if (!hit.ok) return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: { "Retry-After": String(hit.retryAfter) } });
  return { creds, apps, rawBody, state };
}
