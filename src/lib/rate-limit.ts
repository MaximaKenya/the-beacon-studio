/**
 * Small in-memory fixed-window limiter. Per dyno, so it is a brake on
 * brute force and form spam, not a global quota.
 */
const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, limit: number, windowMs: number, now = Date.now()): { ok: boolean; retryAfter: number } {
  if (buckets.size > 10_000) {
    for (const [k, v] of buckets) if (v.resetAt <= now) buckets.delete(k);
  }
  const hit = buckets.get(key);
  if (!hit || hit.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfter: 0 };
  }
  hit.count += 1;
  return { ok: hit.count <= limit, retryAfter: Math.ceil((hit.resetAt - now) / 1000) };
}

export function clientIp(headers: Headers): string {
  return headers.get("x-forwarded-for")?.split(",")[0]?.trim() || headers.get("x-real-ip") || "local";
}

/** Limits for POST /api/* by path. Webhooks are signed and skipped. */
export function postLimitFor(pathname: string): { limit: number; windowMs: number } | null {
  if (/^\/api\/(paystack\/webhook|paystack\/callback|email\/inbound|whatsapp\/webhook|sms\/inbound|automations\/tick)/.test(pathname)) return null;
  if (pathname === "/api/admin/auth" || pathname.startsWith("/api/portal/auth") || pathname.startsWith("/api/portal/magic")) {
    return { limit: 8, windowMs: 10 * 60_000 };
  }
  if (pathname.startsWith("/api/admin/")) return { limit: 120, windowMs: 60_000 };
  if (pathname.startsWith("/api/analytics")) return { limit: 120, windowMs: 60_000 };
  return { limit: 20, windowMs: 60_000 };
}

/** Admin and portal APIs must come from our own pages when a browser says where it came from. */
export function crossOriginBlocked(pathname: string, origin: string | null, host: string | null): boolean {
  if (!origin || !host) return false;
  if (!pathname.startsWith("/api/admin/") && !pathname.startsWith("/api/portal/")) return false;
  try {
    const o = new URL(origin).host.toLowerCase();
    const h = host.split(",")[0].trim().toLowerCase();
    const strip = (v: string) => v.replace(/^www\./, "");
    return strip(o) !== strip(h);
  } catch {
    return true;
  }
}
