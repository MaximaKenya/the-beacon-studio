/**
 * Session cookies for admin and the client portal.
 *
 * The login loop on http://thebeaconstudio.co.ke happened because production
 * always set `Secure` (`NODE_ENV === "production"`). Browsers drop a Secure
 * cookie on an HTTP response, so the password check succeeded and the next
 * request had no session. Heroku terminates TLS and tells the app the original
 * scheme in `x-forwarded-proto` — the dyno itself is HTTP, so the request URL
 * protocol is not a reliable signal.
 *
 * Cookies are host-only unless we set Domain. A host-only cookie from the apex
 * is not sent to www (and the reverse). The production apex domain covers both.
 */

export const PRODUCTION_APEX_HOST = "thebeaconstudio.co.ke";

export type SessionCookieOptions = {
  httpOnly: true;
  sameSite: "lax";
  path: "/";
  secure: boolean;
  maxAge: number;
  domain?: string;
};

export function hostnameOf(value: string | null | undefined): string {
  if (!value) return "";
  const first = value.split(",")[0]?.trim().toLowerCase() ?? "";
  if (!first) return "";
  if (first.startsWith("[")) {
    const end = first.indexOf("]");
    return end === -1 ? first : first.slice(0, end + 1);
  }
  return first.replace(/:\d+$/, "");
}

export function isProductionSiteHost(hostname: string): boolean {
  return hostname === PRODUCTION_APEX_HOST || hostname === `www.${PRODUCTION_APEX_HOST}`;
}

/** Left-most forwarded protocol wins. That is the scheme the browser used. */
export function clientProtocol(input: {
  forwardedProto: string | null;
  requestProtocol: string;
}): "http" | "https" {
  const forwarded = input.forwardedProto?.split(",")[0]?.trim().toLowerCase();
  if (forwarded === "https" || forwarded === "http") return forwarded;
  return input.requestProtocol.replace(":", "").toLowerCase() === "https" ? "https" : "http";
}

export function publicHostname(input: {
  forwardedHost: string | null;
  host: string | null;
  urlHostname: string;
}): string {
  return (
    hostnameOf(input.forwardedHost) ||
    hostnameOf(input.host) ||
    hostnameOf(input.urlHostname)
  );
}

/**
 * HTTPS redirect for the production host only.
 * Returns null when the browser is already on HTTPS, or the host is local,
 * a Heroku default domain, or a Vercel preview.
 */
export function httpsRedirectTarget(input: {
  forwardedProto: string | null;
  forwardedHost: string | null;
  host: string | null;
  url: URL;
}): URL | null {
  const hostname = publicHostname({
    forwardedHost: input.forwardedHost,
    host: input.host,
    urlHostname: input.url.hostname,
  });
  if (!isProductionSiteHost(hostname)) return null;
  const scheme = clientProtocol({
    forwardedProto: input.forwardedProto,
    requestProtocol: input.url.protocol,
  });
  if (scheme !== "http") return null;
  const target = new URL(input.url.toString());
  target.protocol = "https:";
  target.hostname = hostname;
  target.port = "";
  return target;
}

export function sessionCookieOptions(input: {
  forwardedProto: string | null;
  forwardedHost: string | null;
  host: string | null;
  requestProtocol: string;
  urlHostname: string;
  maxAge: number;
}): SessionCookieOptions {
  const hostname = publicHostname(input);
  const scheme = clientProtocol({
    forwardedProto: input.forwardedProto,
    requestProtocol: input.requestProtocol,
  });
  const domain = isProductionSiteHost(hostname) ? PRODUCTION_APEX_HOST : undefined;
  return {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: scheme === "https",
    maxAge: input.maxAge,
    ...(domain ? { domain } : {}),
  };
}

export function sessionCookieOptionsFromRequest(request: Request, maxAge: number): SessionCookieOptions {
  const url = new URL(request.url);
  return sessionCookieOptions({
    forwardedProto: request.headers.get("x-forwarded-proto"),
    forwardedHost: request.headers.get("x-forwarded-host"),
    host: request.headers.get("host"),
    requestProtocol: url.protocol,
    urlHostname: url.hostname,
    maxAge,
  });
}

/** Browsers refuse to store a Secure cookie from an http:// response. */
export function browserWouldStoreCookie(options: Pick<SessionCookieOptions, "secure">, pageProtocol: "http" | "https"): boolean {
  if (options.secure && pageProtocol !== "https") return false;
  return true;
}

/**
 * A Domain cookie is sent to the apex and every subdomain. A host-only cookie
 * is sent only to the host that set it, so apex and www would not share a session.
 */
export function cookieSentToHost(options: Pick<SessionCookieOptions, "domain">, setOnHost: string, requestHost: string): boolean {
  const request = hostnameOf(requestHost);
  const origin = hostnameOf(setOnHost);
  if (!options.domain) return request === origin;
  return request === options.domain || request.endsWith(`.${options.domain}`);
}

export function serializeSetCookie(name: string, value: string, options: SessionCookieOptions): string {
  const parts = [`${name}=${value}`, `Max-Age=${options.maxAge}`, `Path=${options.path}`];
  if (options.domain) parts.push(`Domain=${options.domain}`);
  if (options.httpOnly) parts.push("HttpOnly");
  if (options.secure) parts.push("Secure");
  parts.push("SameSite=Lax");
  return parts.join("; ");
}

type HeaderCarrier = { headers: Headers };

/**
 * Write the session cookie on the response itself.
 *
 * Also expire a previous host-only cookie of the same name. Otherwise the
 * browser can send both, and the host-only value can shadow the shared one.
 * Two Set-Cookie headers are required: Next's cookie map keys only by name,
 * so `cookies().set` cannot emit both the host-only clear and the Domain set.
 */
export function applySessionCookie(
  response: HeaderCarrier,
  name: string,
  value: string,
  options: SessionCookieOptions
): void {
  if (options.domain) {
    response.headers.append(
      "Set-Cookie",
      serializeSetCookie(name, "", { ...options, domain: undefined, maxAge: 0 })
    );
  }
  response.headers.append("Set-Cookie", serializeSetCookie(name, value, options));
}

export function expireSessionCookie(response: HeaderCarrier, name: string, options: SessionCookieOptions): void {
  response.headers.append(
    "Set-Cookie",
    serializeSetCookie(name, "", { ...options, domain: undefined, maxAge: 0 })
  );
  if (options.domain) {
    response.headers.append("Set-Cookie", serializeSetCookie(name, "", { ...options, maxAge: 0 }));
  }
}
