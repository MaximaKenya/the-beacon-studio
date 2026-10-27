import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { parseRequestJson } from "@/lib/storage";
import {
  applySessionCookie,
  expireSessionCookie,
  sessionCookieOptionsFromRequest,
} from "@/lib/session-cookie";

export const runtime = "nodejs";

import { ADMIN_COOKIE as COOKIE, ADMIN_MAX_AGE as MAX_AGE, adminPasswordMatches, createAdminToken, verifyAdminToken } from "@/lib/admin-auth";

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
    if (!pin || pin.length > 256 || !adminPasswordMatches(pin)) {
      return NextResponse.json({ error: "Invalid password." }, { status: 401, headers: NO_STORE });
    }

    const response = NextResponse.json({ ok: true }, { headers: NO_STORE });
    applySessionCookie(
      response,
      COOKIE,
      createAdminToken() as string,
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
  const authenticated = verifyAdminToken(token);
  return NextResponse.json({ authenticated, configured: true }, { headers: NO_STORE });
}
