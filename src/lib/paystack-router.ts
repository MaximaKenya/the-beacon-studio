import { readPaystackMetadata } from "@/lib/paystack";

export type PaystackRoute = {
  app: string;
  prefix: string | null;
  /** Env suffix for PAYSTACK_FORWARD_<slug>. */
  slug: string;
  local: boolean;
};

const ROUTES: PaystackRoute[] = [
  { prefix: "BS", app: "beacon-studio", slug: "BEACON_STUDIO", local: true },
  { prefix: "CR", app: "confirent", slug: "CONFIRENT", local: false },
  { prefix: "CA", app: "cadenceapp", slug: "CADENCEAPP", local: false },
  { prefix: "LF", app: "lookfinesse", slug: "LOOKFINESSE", local: false },
  { prefix: "CL", app: "confilearn", slug: "CONFILEARN", local: false },
  { prefix: "CT", app: "confitrade", slug: "CONFITRADE", local: false },
  { prefix: "TY", app: "triviayard", slug: "TRIVIAYARD", local: false },
  { prefix: "CV", app: "convoria", slug: "CONVORIA", local: false },
];

export function paystackForwardUrl(slug: string): string {
  return process.env[`PAYSTACK_FORWARD_${slug}`]?.trim() || "";
}

function byApp(app: string): PaystackRoute | undefined {
  const normalized = app.trim().toLowerCase();
  return ROUTES.find((route) => route.app === normalized);
}

function byPrefix(prefix: string): PaystackRoute | undefined {
  return ROUTES.find((route) => route.prefix === prefix.toUpperCase());
}

/** metadata.app wins. Otherwise the reference prefix (BS-, CR-, …). Unprefixed references stay on Beacon Studio. */
export function routePaystackEvent(event: {
  data?: { reference?: string; metadata?: unknown };
}): { route: PaystackRoute; reference: string; legacy: boolean } | null {
  const reference = typeof event.data?.reference === "string" ? event.data.reference : "";
  const metadata = readPaystackMetadata(event.data?.metadata);
  const app = typeof metadata.app === "string" ? metadata.app : "";
  const prefix = reference.includes("-") ? reference.slice(0, reference.indexOf("-")) : "";
  const fromApp = app ? byApp(app) : undefined;
  if (fromApp) return { route: fromApp, reference, legacy: false };
  const fromPrefix = prefix ? byPrefix(prefix) : undefined;
  if (fromPrefix) return { route: fromPrefix, reference, legacy: false };
  if (!prefix) {
    const local = ROUTES[0];
    return { route: local, reference, legacy: true };
  }
  return null;
}

export async function forwardPaystackEvent(raw: string, signature: string, route: PaystackRoute, reference: string): Promise<void> {
  const target = paystackForwardUrl(route.slug);
  if (!target) {
    console.warn("[paystack/router] no forward URL", { app: route.app, slug: route.slug, reference, env: `PAYSTACK_FORWARD_${route.slug}` });
    return;
  }
  try {
    const response = await fetch(target, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-paystack-signature": signature,
      },
      body: raw,
    });
    const body = await response.text();
    console.log("[paystack/router] forwarded", {
      app: route.app,
      reference,
      target,
      status: response.status,
      ok: response.ok,
      body: body.slice(0, 240),
    });
  } catch (error) {
    console.error("[paystack/router] forward failed", {
      app: route.app,
      reference,
      target,
      error: error instanceof Error ? error.message : "failed",
    });
  }
}
