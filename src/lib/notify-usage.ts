import type { AutomationDelivery } from "@/lib/automations/types";

export type QueueCounts = { sent: number; waiting: number; failed: number };

/** Notify queue counts for one channel. A usage placeholder until the channel is connected; no billing reads this yet. */
export function queueCounts(deliveries: AutomationDelivery[], channel: "sms" | "whatsapp", instanceIds?: Set<string>): QueueCounts {
  const rows = deliveries.filter((item) => item.channel === channel && (!instanceIds || instanceIds.has(item.instanceId)));
  return {
    sent: rows.filter((item) => item.status === "sent").length,
    waiting: rows.filter((item) => item.status === "waiting").length,
    failed: rows.filter((item) => item.status === "failed").length,
  };
}
