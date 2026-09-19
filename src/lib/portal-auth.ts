import { createHmac, randomInt, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { readJsonFile, writeJsonFile } from "@/lib/storage";

const COOKIE = "beacon_portal";
const CODES_FILE = "portal-codes.json";

export type PortalCodeEntry = {
  email: string;
  code: string;
  expiresAt: string;
  createdAt: string;
};

function secret(): string {
  return process.env.PORTAL_SECRET || process.env.ADMIN_PASSWORD || "beacon-dev-secret";
}

export function signPortalToken(payload: {
  clientId: string;
  email: string;
  projectId?: string;
}): string {
  const body = Buffer.from(
    JSON.stringify({
      ...payload,
      exp: Date.now() + 1000 * 60 * 60 * 24 * 30, // 30 days
    })
  ).toString("base64url");
  const sig = createHmac("sha256", secret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verifyPortalToken(
  token: string
): { clientId: string; email: string; projectId?: string } | null {
  try {
    const [body, sig] = token.split(".");
    if (!body || !sig) return null;
    const expected = createHmac("sha256", secret()).update(body).digest("base64url");
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
    const data = JSON.parse(Buffer.from(body, "base64url").toString("utf-8")) as {
      clientId?: string;
      email?: string;
      projectId?: string;
      exp?: number;
    };
    if (!data.clientId || !data.email || !data.exp || data.exp < Date.now()) return null;
    return {
      clientId: data.clientId,
      email: data.email,
      projectId: data.projectId,
    };
  } catch {
    return null;
  }
}

/** Access token shown after intake — long-lived signed link. */
export function createAccessToken(clientId: string, email: string, projectId: string): string {
  return signPortalToken({ clientId, email, projectId });
}

export async function issueOneTimeCode(email: string): Promise<string> {
  const code = String(randomInt(100000, 999999));
  const normalized = email.trim().toLowerCase();
  const all = await readJsonFile<PortalCodeEntry[]>(CODES_FILE, []);
  const filtered = all.filter(
    (c) => c.email !== normalized && new Date(c.expiresAt).getTime() > Date.now()
  );
  filtered.push({
    email: normalized,
    code,
    expiresAt: new Date(Date.now() + 1000 * 60 * 15).toISOString(),
    createdAt: new Date().toISOString(),
  });
  await writeJsonFile(CODES_FILE, filtered);
  return code;
}

export async function verifyOneTimeCode(email: string, code: string): Promise<boolean> {
  const normalized = email.trim().toLowerCase();
  const all = await readJsonFile<PortalCodeEntry[]>(CODES_FILE, []);
  const hit = all.find(
    (c) =>
      c.email === normalized &&
      c.code === code.trim() &&
      new Date(c.expiresAt).getTime() > Date.now()
  );
  if (!hit) return false;
  await writeJsonFile(
    CODES_FILE,
    all.filter((c) => !(c.email === normalized && c.code === code.trim()))
  );
  return true;
}

export async function setPortalSessionCookie(token: string): Promise<void> {
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    secure: process.env.NODE_ENV === "production",
  });
}

export async function clearPortalSessionCookie(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function getPortalSession(): Promise<{
  clientId: string;
  email: string;
  projectId?: string;
} | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  return verifyPortalToken(token);
}

export { COOKIE as PORTAL_COOKIE };
