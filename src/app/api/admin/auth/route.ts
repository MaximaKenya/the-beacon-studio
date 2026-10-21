import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { parseRequestJson } from "@/lib/storage";
import {
  applySessionCookie,
  expireSessionCookie,
  sessionCookieOptionsFromRequest,
} from "@/lib/session-cookie";

export const runtime = "nodejs";

const COOKIE = "beacon_admin";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function sessionToken(password: string): string {
  // Lightweight opaque token — not cryptographic auth for high-security contexts
  return Buffer.from(`beacon:${password}`).toString("base64url");
}

const NO_STORE = { "Cache-Control": "no-store" };

export async function POST(request: Request) {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    return NextResponse.json(
      { error: "ADMIN_PASSWORD is not set on the server." },
      { status: 503, headers: NO_STORE }
    );
  }

  try {
    const body = await parseRequestJson(request);
    const pin = typeof body.password === "string" ? body.password : "";
    if (pin !== password) {
      return NextResponse.json({ error: "Invalid password." }, { status: 401, headers: NO_STORE });
    }

    const response = NextResponse.json({ ok: true }, { headers: NO_STORE });
    applySessionCookie(
      response,
      COOKIE,
      sessionToken(password),
      sessionCookieOptionsFromRequest(request, MAX_AGE)
    );
    return response;
  } catch {
    return NextResponse.json({ error: "Login failed." }, { status: 500, headers: NO_STORE });
  }
}

export async function DELETE(request: Request) {
  const response = NextResponse.json({ ok: true }, { headers: NO_STORE });
  expireSessionCookie(response, COOKIE, sessionCookieOptionsFromRequest(request, 0));
  return response;
}

export async function GET() {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    return NextResponse.json({ authenticated: false, configured: false }, { headers: NO_STORE });
  }
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  const authenticated = token === sessionToken(password);
  return NextResponse.json({ authenticated, configured: true }, { headers: NO_STORE });
}
