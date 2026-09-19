import { cookies } from "next/headers";

const COOKIE = "beacon_admin";

export async function isAdminAuthenticated(): Promise<boolean> {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return false;
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  const expected = Buffer.from(`beacon:${password}`).toString("base64url");
  return token === expected;
}

export function getAdminPassword(): string | undefined {
  return process.env.ADMIN_PASSWORD;
}
