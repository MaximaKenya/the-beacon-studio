/**
 * Content-Security-Policy built per request in src/proxy.ts.
 * Scripts run only with the request nonce ('strict-dynamic' lets Next's
 * nonced loader pull its own chunks). Fonts are self-hosted by next/font,
 * all third-party APIs (Resend, Paystack, Groq, Africa's Talking, Meta) are
 * called from the server, and Paystack checkout is a full-page redirect.
 */
export const NONCE_HEADER = "x-nonce";

/** Client-site pages and embed scripts that other sites may frame or load. */
export function isEmbeddablePath(pathname: string): boolean {
  return /^\/(a\/|api\/automations\/(embed|widget)\/)/.test(pathname);
}

export function createNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

export function buildCsp(nonce: string, opts: { embeddable?: boolean; dev?: boolean } = {}): string {
  const script = [`'self'`, `'nonce-${nonce}'`, `'strict-dynamic'`, ...(opts.dev ? [`'unsafe-eval'`] : [])];
  const directives: Record<string, string[]> = {
    "default-src": [`'self'`],
    "script-src": script,
    // framer-motion and Tailwind set inline style attributes.
    "style-src": [`'self'`, `'unsafe-inline'`],
    // Admin mailbox shows remote images in received email; html2canvas uses data/blob.
    "img-src": [`'self'`, "data:", "blob:", "https:"],
    "font-src": [`'self'`, "data:"],
    "connect-src": [`'self'`, ...(opts.dev ? ["ws:"] : [])],
    "media-src": [`'self'`, "blob:"],
    "frame-src": [`'self'`],
    "worker-src": [`'self'`, "blob:"],
    "manifest-src": [`'self'`],
    "object-src": [`'none'`],
    "base-uri": [`'self'`],
    "form-action": [`'self'`],
    "frame-ancestors": opts.embeddable ? ["*"] : [`'none'`],
  };
  const policy = Object.entries(directives).map(([k, v]) => `${k} ${v.join(" ")}`);
  if (!opts.dev) policy.push("upgrade-insecure-requests");
  return policy.join("; ");
}
