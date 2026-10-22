import { randomUUID } from "crypto";
import { captureLead } from "@/lib/leads";
import { recordSiteForm } from "@/lib/mailbox";

/** Store an inbound SMS or WhatsApp note in Admin Mail and as a Lead. */
export async function logInboundChannel(input: {
  channel: "sms" | "whatsapp";
  from: string;
  text: string;
}): Promise<{ sourceId: string }> {
  const sourceId = randomUUID();
  const label = input.channel === "sms" ? "SMS" : "WhatsApp";
  await recordSiteForm({
    kind: input.channel,
    sourceId,
    name: input.from,
    phone: input.from,
    subject: `${label} from ${input.from}`,
    text: input.text,
    skipConfirmation: true,
  });
  await captureLead(
    {
      kind: "contact",
      sourceId,
      source: input.channel,
      channel: input.channel,
      name: input.from,
      phone: input.from,
      message: input.text,
      category: label,
    },
    { ai: false }
  );
  return { sourceId };
}
