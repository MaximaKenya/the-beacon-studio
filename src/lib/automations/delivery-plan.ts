import { normalizeKenyanPhone } from "@/lib/automations/phone";

export type OutboundChannel = "email" | "sms" | "whatsapp";

export type DeliveryPlan = {
  email: string;
  phone: string;
  send: OutboundChannel[];
  waiting: Array<"sms" | "whatsapp">;
};

function preferenceOf(value: string | undefined): "email" | "sms" | "whatsapp" | "both" {
  const pref = (value || "both").toLowerCase();
  if (pref === "email" || pref === "sms" || pref === "whatsapp") return pref;
  return "both";
}

function readyPhone(
  pref: "email" | "sms" | "whatsapp" | "both",
  phone: string,
  smsReady: boolean,
  whatsappReady: boolean
): "sms" | "whatsapp" | null {
  if (!phone) return null;
  if (pref === "whatsapp") {
    if (whatsappReady) return "whatsapp";
    if (smsReady) return "sms";
    return null;
  }
  if (smsReady) return "sms";
  if (whatsappReady) return "whatsapp";
  return null;
}

/**
 * Preferred channel first, then a fallback that can actually leave the building.
 * A phone with no connected channel is queued instead of dropped.
 */
export function planChannels(input: {
  preference?: string;
  email?: string;
  phone?: string;
  smsReady: boolean;
  whatsappReady: boolean;
}): DeliveryPlan {
  const email = input.email?.trim() || "";
  const phone = normalizeKenyanPhone(input.phone);
  const pref = preferenceOf(input.preference);
  const send: OutboundChannel[] = [];
  const waiting: Array<"sms" | "whatsapp"> = [];
  const phoneChannel = readyPhone(pref, phone, input.smsReady, input.whatsappReady);

  const queuePhone = () => {
    if (!phone) return;
    waiting.push(pref === "whatsapp" ? "whatsapp" : "sms");
  };

  if (pref === "email") {
    if (email) send.push("email");
    else if (phoneChannel) send.push(phoneChannel);
    else queuePhone();
    return { email, phone, send, waiting };
  }

  if (pref === "sms" || pref === "whatsapp") {
    if (phoneChannel) send.push(phoneChannel);
    else if (phone) queuePhone();
    if (!phoneChannel && email) send.push("email");
    if (!phone && !email) return { email, phone, send, waiting };
    return { email, phone, send, waiting };
  }

  if (email) send.push("email");
  if (phoneChannel) send.push(phoneChannel);
  else queuePhone();
  return { email, phone, send, waiting };
}

/** A queued phone message can leave on whichever phone channel is connected. */
export function channelForWaiting(
  queued: "sms" | "whatsapp",
  smsReady: boolean,
  whatsappReady: boolean
): "sms" | "whatsapp" | null {
  if (queued === "sms" && smsReady) return "sms";
  if (queued === "whatsapp" && whatsappReady) return "whatsapp";
  if (smsReady) return "sms";
  if (whatsappReady) return "whatsapp";
  return null;
}
