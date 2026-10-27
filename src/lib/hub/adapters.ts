import type { Channel } from "./policy";
import type { HubMessage } from "./state";

export type SendOutcome = { ok: true; providerId: string } | { ok: false; error: string; retryable: boolean };

/** Every SMS/WhatsApp provider implements this. No provider is chosen yet. */
export interface ProviderAdapter {
  name: string;
  channels: Channel[];
  configured(env?: NodeJS.ProcessEnv): boolean;
  send(message: HubMessage): Promise<SendOutcome>;
}

/** Accepts everything, sends nothing. For tests and sandbox demos only. */
export const mockAdapter: ProviderAdapter = {
  name: "mock",
  channels: ["sms", "whatsapp"],
  configured: () => true,
  async send(message) {
    return { ok: true, providerId: `mock_${message.id}` };
  },
};

function stub(name: string, channels: Channel[], envVars: string[]): ProviderAdapter {
  return {
    name,
    channels,
    configured: (env = process.env) => envVars.every((v) => Boolean(env[v]?.trim())),
    async send() {
      return { ok: false, error: `${name} adapter is a stub; not implemented until the provider is chosen`, retryable: false };
    },
  };
}

export const ADAPTERS: Record<string, ProviderAdapter> = {
  mock: mockAdapter,
  africastalking: stub("africastalking", ["sms"], ["AT_USERNAME", "AT_API_KEY"]),
  belio: stub("belio", ["sms"], ["BELIO_API_KEY"]),
  mobitech: stub("mobitech", ["sms"], ["MOBITECH_API_KEY"]),
  meta_whatsapp: stub("meta_whatsapp", ["whatsapp"], ["WA_ACCESS_TOKEN", "WA_PHONE_NUMBER_ID"]),
};

/** HUB_SMS_PROVIDER / HUB_WHATSAPP_PROVIDER pick the adapter; unset means none. */
export function adapterFor(channel: Channel, env: NodeJS.ProcessEnv = process.env): ProviderAdapter | null {
  const name = (channel === "sms" ? env.HUB_SMS_PROVIDER : env.HUB_WHATSAPP_PROVIDER)?.trim().toLowerCase();
  if (!name) return null;
  const a = ADAPTERS[name];
  if (!a || !a.channels.includes(channel) || !a.configured(env)) return null;
  return a;
}

export function sendingEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  return env.HUB_SENDING_ENABLED?.trim().toLowerCase() === "true";
}
