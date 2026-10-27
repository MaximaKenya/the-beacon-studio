import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { httpsRedirectTarget } from "@/lib/session-cookie";
import { clientIp, crossOriginBlocked, postLimitFor, rateLimit } from "@/lib/rate-limit";
import { normalizeReferralCode, REFERRAL_COOKIE, REFERRAL_COOKIE_DAYS } from "@/lib/referral-rules";

/**
 * Force HTTP → HTTPS on thebeaconstudio.co.ke and www.
 * Heroku's router sets x-forwarded-proto to the browser's scheme. 308 keeps
 * the method and body if an API call is made before the document redirect.
 */
export function proxy(request: NextRequest) {
  const target = httpsRedirectTarget({
    forwardedProto: request.headers.get("x-forwarded-proto"),
    forwardedHost: request.headers.get("x-forwarded-host"),
    host: request.headers.get("host"),
    url: request.nextUrl,
  });
  if (target) {
    return NextResponse.redirect(target, 308);
  }
  const path = request.nextUrl.pathname;
  if (path.startsWith("/api/") && request.method !== "GET" && request.method !== "HEAD" && request.method !== "OPTIONS") {
    if (crossOriginBlocked(path, request.headers.get("origin"), request.headers.get("x-forwarded-host") || request.headers.get("host"))) {
      return NextResponse.json({ error: "Cross-origin request blocked." }, { status: 403 });
    }
    const rule = postLimitFor(path);
    if (rule) {
      const hit = rateLimit(`${clientIp(request.headers)}:${path}`, rule.limit, rule.windowMs);
      if (!hit.ok) {
        return NextResponse.json(
          { error: "Too many requests. Try again shortly." },
          { status: 429, headers: { "Retry-After": String(hit.retryAfter) } }
        );
      }
    }
  }
  const response = NextResponse.next();
  const ref = normalizeReferralCode(request.nextUrl.searchParams.get("ref"));
  if (ref) {
    response.cookies.set(REFERRAL_COOKIE, ref, {
      maxAge: REFERRAL_COOKIE_DAYS * 86_400,
      path: "/",
      sameSite: "lax",
      httpOnly: true,
      secure: request.nextUrl.protocol === "https:",
    });
  }
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
