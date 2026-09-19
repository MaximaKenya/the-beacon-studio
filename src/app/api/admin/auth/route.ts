import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { parseRequestJson } from "@/lib/storage";

export const runtime = "nodejs";

const COOKIE = "beacon_admin";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function sessionToken(password: string): string {
  // Lightweight opaque token — not cryptographic auth for high-security contexts
  return Buffer.from(`beacon:${password}`).toString("base64url");
}

export async function POST(request: Request) {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    return NextResponse.json(
      { error: "ADMIN_PASSWORD is not set on the server." },
      { status: 503 }
    );
  }

  try {
    const body = await parseRequestJson(request);
    const pin = typeof body.password === "string" ? body.password : "";
    if (pin !== password) {
      return NextResponse.json({ error: "Invalid password." }, { status: 401 });
    }

    const jar = await cookies();
    jar.set(COOKIE, sessionToken(password), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: MAX_AGE,
      secure: process.env.NODE_ENV === "production",
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Login failed." }, { status: 500 });
  }
}

export async function DELETE() {
  const jar = await cookies();
  jar.delete(COOKIE);
  return NextResponse.json({ ok: true });
}

export async function GET() {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    return NextResponse.json({ authenticated: false, configured: false });
  }
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  const authenticated = token === sessionToken(password);
  return NextResponse.json({ authenticated, configured: true });
}
