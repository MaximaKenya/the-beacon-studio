import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "beacon_admin";
export const ADMIN_MAX_AGE = 60 * 60 * 12; // 12 hours

function key(): string | null {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return null;
  // Changing ADMIN_PASSWORD or ADMIN_SESSION_SECRET signs every admin out.
  return `${process.env.ADMIN_SESSION_SECRET || ""}:${password}`;
}

function sign(body: string, k: string): string {
  return createHmac("sha256", k).update(`admin:${body}`).digest("base64url");
}

export function safeEqual(a: string, b: string): boolean {
  const ha = createHmac("sha256", "cmp").update(a).digest();
  const hb = createHmac("sha256", "cmp").update(b).digest();
  return timingSafeEqual(ha, hb) && a.length === b.length;
}

/** Random nonce + expiry, HMAC-signed. Never contains the password. */
export function createAdminToken(now = Date.now()): string | null {
  const k = key();
  if (!k) return null;
  const body = `${now + ADMIN_MAX_AGE * 1000}.${randomBytes(16).toString("base64url")}`;
  return `${body}.${sign(body, k)}`;
}

export function verifyAdminToken(token: string | undefined, now = Date.now()): boolean {
  const k = key();
  if (!k || !token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const body = `${parts[0]}.${parts[1]}`;
  if (!safeEqual(parts[2], sign(body, k))) return false;
  const exp = Number(parts[0]);
  return Number.isFinite(exp) && exp > now;
}

export function adminPasswordMatches(input: string): boolean {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return false;
  return safeEqual(input, password);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const jar = await cookies();
  return verifyAdminToken(jar.get(ADMIN_COOKIE)?.value);
}

export function getAdminPassword(): string | undefined {
  return process.env.ADMIN_PASSWORD;
}
