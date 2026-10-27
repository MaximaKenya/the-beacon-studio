import { safeEqual } from "./admin-auth";

/** Public callers get only {ok}. Detail needs `Authorization: Bearer $CRON_SECRET` or an admin session. */
export function healthDetailAllowed(authorization: string | null, isAdmin: boolean, secret = process.env.CRON_SECRET): boolean {
  if (isAdmin) return true;
  if (!secret || !authorization) return false;
  const token = authorization.replace(/^Bearer\s+/i, "").trim();
  return token.length > 0 && safeEqual(token, secret);
}

export function healthBody<T extends { ok: boolean }>(health: T, detail: boolean): T | { ok: boolean } {
  return detail ? health : { ok: health.ok };
}
