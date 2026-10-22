export type NotifyResult = {
  channel: "sms" | "whatsapp";
  sent: boolean;
  skipped: boolean;
  detail?: string;
};

type Fetcher = (input: string, init?: RequestInit) => Promise<Response>;

export function smsConfigured(): boolean {
  return Boolean(process.env.AT_USERNAME?.trim() && process.env.AT_API_KEY?.trim());
}

export function whatsAppConfigured(): boolean {
  return Boolean(process.env.WHATSAPP_TOKEN?.trim() && process.env.WHATSAPP_PHONE_ID?.trim());
}

export function toInternationalDigits(phone: string): string {
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) digits = `254${digits.slice(1)}`;
  else if (digits.length === 9) digits = `254${digits}`;
  return digits;
}

function skipped(channel: NotifyResult["channel"], detail: string): NotifyResult {
  return { channel, sent: false, skipped: true, detail };
}

export async function sendSms(to: string, message: string, fetcher: Fetcher = fetch): Promise<NotifyResult> {
  const username = process.env.AT_USERNAME?.trim() || "";
  const apiKey = process.env.AT_API_KEY?.trim() || "";
  if (!username || !apiKey) return skipped("sms", "AT_USERNAME or AT_API_KEY is unset");
  const digits = toInternationalDigits(to);
  if (digits.length < 10) return skipped("sms", "Phone is too short");
  const sender = process.env.AT_SENDER_ID?.trim();
  const body = new URLSearchParams({
    username,
    to: `+${digits}`,
    message: message.slice(0, 480),
  });
  if (sender) body.set("from", sender);
  try {
    const response = await fetcher("https://api.africastalking.com/version1/messaging", {
      method: "POST",
      headers: {
        apiKey,
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });
    if (!response.ok) return { channel: "sms", sent: false, skipped: false, detail: `Africa's Talking ${response.status}` };
    return { channel: "sms", sent: true, skipped: false };
  } catch (error) {
    return { channel: "sms", sent: false, skipped: false, detail: error instanceof Error ? error.message : "SMS failed" };
  }
}

export async function sendWhatsApp(to: string, message: string, fetcher: Fetcher = fetch): Promise<NotifyResult> {
  const token = process.env.WHATSAPP_TOKEN?.trim() || "";
  const phoneId = process.env.WHATSAPP_PHONE_ID?.trim() || "";
  if (!token || !phoneId) return skipped("whatsapp", "WHATSAPP_TOKEN or WHATSAPP_PHONE_ID is unset");
  const digits = toInternationalDigits(to);
  if (digits.length < 10) return skipped("whatsapp", "Phone is too short");
  try {
    const response = await fetcher(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: digits,
        type: "text",
        text: { body: message.slice(0, 1000) },
      }),
    });
    if (!response.ok) return { channel: "whatsapp", sent: false, skipped: false, detail: `WhatsApp ${response.status}` };
    return { channel: "whatsapp", sent: true, skipped: false };
  } catch (error) {
    return {
      channel: "whatsapp",
      sent: false,
      skipped: false,
      detail: error instanceof Error ? error.message : "WhatsApp failed",
    };
  }
}

export type BookingNotice = {
  phone?: string;
  name: string;
  when: string;
  kind: "confirmed" | "reminder-24h" | "reminder-1h" | "follow-up";
};

export async function notifyBooking(notice: BookingNotice, fetcher: Fetcher = fetch): Promise<{ delivered: boolean; sms: NotifyResult; whatsapp: NotifyResult }> {
  const phone = notice.phone?.trim() || "";
  if (!phone) {
    return {
      delivered: false,
      sms: skipped("sms", "No phone"),
      whatsapp: skipped("whatsapp", "No phone"),
    };
  }
  const verb =
    notice.kind === "confirmed"
      ? "is booked"
      : notice.kind === "follow-up"
        ? "has finished"
        : "is coming up";
  const message = `${notice.name}, your Beacon Studio call ${verb}: ${notice.when}.`;
  const [sms, whatsapp] = await Promise.all([
    sendSms(phone, message, fetcher),
    sendWhatsApp(phone, message, fetcher),
  ]);
  return { delivered: sms.sent || whatsapp.sent, sms, whatsapp };
}

export function parseSmsInbound(raw: string, contentType: string): { from: string; text: string } | null {
  const type = contentType.toLowerCase();
  if (type.includes("application/json")) {
    try {
      const body = JSON.parse(raw) as { from?: unknown; text?: unknown; message?: unknown };
      const from = typeof body.from === "string" ? body.from.trim() : "";
      const text = typeof body.text === "string" ? body.text : typeof body.message === "string" ? body.message : "";
      if (!from || !text.trim()) return null;
      return { from, text: text.trim().slice(0, 2000) };
    } catch {
      return null;
    }
  }
  const params = new URLSearchParams(raw);
  const from = (params.get("from") || "").trim();
  const text = (params.get("text") || params.get("message") || "").trim();
  if (!from || !text) return null;
  return { from, text: text.slice(0, 2000) };
}

export type WhatsAppInbound = { from: string; text: string };

export function parseWhatsAppWebhook(payload: unknown): WhatsAppInbound[] {
  if (!payload || typeof payload !== "object") return [];
  const entry = (payload as { entry?: unknown }).entry;
  if (!Array.isArray(entry)) return [];
  const messages: WhatsAppInbound[] = [];
  for (const item of entry) {
    const changes = (item as { changes?: unknown }).changes;
    if (!Array.isArray(changes)) continue;
    for (const change of changes) {
      const value = (change as { value?: { messages?: unknown } }).value;
      const rows = value?.messages;
      if (!Array.isArray(rows)) continue;
      for (const row of rows) {
        const from = typeof (row as { from?: unknown }).from === "string" ? (row as { from: string }).from : "";
        const text = (row as { text?: { body?: unknown } }).text?.body;
        if (!from || typeof text !== "string" || !text.trim()) continue;
        messages.push({ from, text: text.trim().slice(0, 2000) });
      }
    }
  }
  return messages;
}

export function whatsAppChallenge(url: URL): { status: number; body: string } {
  const expected = process.env.WHATSAPP_VERIFY_TOKEN?.trim() || "";
  if (!expected) return { status: 503, body: "WhatsApp verify token is unset" };
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge") || "";
  if (mode === "subscribe" && token === expected && challenge) return { status: 200, body: challenge };
  return { status: 403, body: "Verification failed" };
}
