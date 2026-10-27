import { randomBytes, createHash } from "crypto";
import type { HubState } from "./state";

export const HUB_APPS = ["beacon-studio", "cadenceapp", "confirent", "lookfinesse", "confilearn", "convoria", "confitrade"] as const;

export type AppCreds = { app: string; key: string; secret: string; callbackUrl: string; source: "env" | "admin"; pricing: "transfer" | "client"; enforceWallet: boolean };

function envSlug(app: string): string {
  return app.toUpperCase().replace(/[^A-Z0-9]/g, "_");
}

function parseJsonMap(env: NodeJS.ProcessEnv): Record<string, { key?: string; secret?: string; callbackUrl?: string }> {
  const raw = env.HUB_APP_KEYS?.trim();
  if (!raw) return {};
  try {
    const v = JSON.parse(raw);
    return v && typeof v === "object" ? v : {};
  } catch {
    console.error("[hub] HUB_APP_KEYS is not valid JSON");
    return {};
  }
}

/** Admin-rotated keys win over env; env HUB_APP_KEYS JSON wins over per-app vars. */
export function resolveApps(state: Pick<HubState, "apps">, env: NodeJS.ProcessEnv = process.env): AppCreds[] {
  const map = parseJsonMap(env);
  const names = new Set<string>([...HUB_APPS, ...Object.keys(map), ...Object.keys(state.apps)]);
  const out: AppCreds[] = [];
  for (const app of names) {
    const stored = state.apps[app];
    const j = map[app] || {};
    const slug = envSlug(app);
    const envKey = j.key || env[`HUB_KEY_${slug}`]?.trim() || "";
    const envSecret = j.secret || env[`HUB_SECRET_${slug}`]?.trim() || "";
    const envCb = j.callbackUrl || env[`HUB_CALLBACK_${slug}`]?.trim() || "";
    const pricing = stored?.pricing || (app === "beacon-studio" || HUB_APPS.includes(app as (typeof HUB_APPS)[number]) ? "transfer" : "client");
    if (stored?.key && stored.secret) {
      out.push({ app, key: stored.key, secret: stored.secret, callbackUrl: stored.callbackUrl || envCb, source: "admin", pricing, enforceWallet: Boolean(stored.enforceWallet) });
    } else if (envKey && envSecret) {
      out.push({ app, key: envKey, secret: envSecret, callbackUrl: envCb, source: "env", pricing, enforceWallet: false });
    } else {
      out.push({ app, key: "", secret: "", callbackUrl: envCb, source: "env", pricing, enforceWallet: false });
    }
  }
  return out;
}

export function findAppByKey(apps: AppCreds[], key: string): AppCreds | undefined {
  if (!key) return undefined;
  const h = createHash("sha256").update(key).digest("hex");
  return apps.find((a) => a.key && createHash("sha256").update(a.key).digest("hex") === h);
}

export function generateCredentials(app: string): { key: string; secret: string } {
  return { key: `bhk_${envSlug(app).toLowerCase()}_${randomBytes(18).toString("base64url")}`, secret: `bhs_${randomBytes(32).toString("base64url")}` };
}

export function maskKey(key: string): string {
  if (!key) return "not set";
  return `${key.slice(0, 8)}…${key.slice(-4)}`;
}
