import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { httpsRedirectTarget } from "@/lib/session-cookie";

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
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
