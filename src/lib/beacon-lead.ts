import { randomUUID } from "crypto";
import { siteConfig } from "@/data/site";
import {
  beaconLeadNote,
  extractBeaconLead,
  type BeaconChatMessage,
} from "@/lib/beacon-ai";
import { upsertClient } from "@/lib/clients";
import { isResendConfigured, sendResendEmail } from "@/lib/resend";
import { readJsonFile, writeJsonFile } from "@/lib/storage";
import { isValidEmail } from "@/lib/validation";

type ContactRow = {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  phone?: string;
  topic?: string;
  message: string;
  source?: string;
  read?: boolean;
  status?: string;
};

export type BeaconLeadSaveResult = "created" | "updated" | "skipped";

function digits(value: string): string {
  return value.replace(/\D/g, "");
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Persist a Beacon AI visitor in the same contacts store the admin inbox reads.
 * A repeat email or phone updates the existing beacon-ai row instead of duplicating it.
 */
export async function saveBeaconLeadFromMessages(
  messages: BeaconChatMessage[]
): Promise<BeaconLeadSaveResult> {
  const userText = messages
    .filter((message) => message.role === "user")
    .map((message) => message.content)
    .join("\n");
  const extracted = extractBeaconLead(userText);
  const emailOk = Boolean(extracted.email) && isValidEmail(extracted.email);
  const phoneDigits = digits(extracted.phone);
  const phoneOk = phoneDigits.length >= 9 && phoneDigits.length <= 15;
  if (!emailOk && !phoneOk) return "skipped";

  const name = extracted.name || "Beacon AI visitor";
  const message = beaconLeadNote(messages);
  const all = await readJsonFile<ContactRow[]>("contacts.json", []);
  const existing = all.find((row) => {
    if (row.source !== "beacon-ai") return false;
    if (emailOk && row.email && row.email.toLowerCase() === extracted.email.toLowerCase()) return true;
    if (phoneOk && digits(row.phone ?? "") === phoneDigits) return true;
    return false;
  });

  const hadEmail = Boolean(existing?.email && isValidEmail(existing.email));

  if (existing) {
    if (extracted.name) existing.name = name;
    if (emailOk) existing.email = extracted.email;
    if (phoneOk) existing.phone = extracted.phone;
    existing.message = message;
    await writeJsonFile("contacts.json", all);
    if (emailOk) {
      await upsertClient({
        email: extracted.email,
        name: existing.name,
        ...(phoneOk ? { phone: extracted.phone } : {}),
      });
    }
    if (!hadEmail && emailOk) {
      await notifyStudio({
        name: existing.name,
        email: extracted.email,
        phone: phoneOk ? extracted.phone : "",
        message,
      });
    }
    return "updated";
  }

  const entry: ContactRow = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    name,
    email: emailOk ? extracted.email : "",
    ...(phoneOk ? { phone: extracted.phone } : {}),
    topic: "ai-automation",
    source: "beacon-ai",
    message,
    read: false,
    status: "new",
  };

  if (emailOk) {
    await upsertClient({
      email: extracted.email,
      name,
      ...(phoneOk ? { phone: extracted.phone } : {}),
    });
  }

  all.unshift(entry);
  await writeJsonFile("contacts.json", all);
  await notifyStudio({
    name,
    email: emailOk ? extracted.email : "",
    phone: phoneOk ? extracted.phone : "",
    message,
  });
  return "created";
}

async function notifyStudio(input: {
  name: string;
  email: string;
  phone: string;
  message: string;
}): Promise<void> {
  if (!isResendConfigured()) return;
  const who = [input.email, input.phone].filter(Boolean).join(" · ") || "no contact on file";
  await sendResendEmail({
    to: siteConfig.email,
    subject: `Beacon AI lead — ${input.name}`,
    ...(input.email ? { replyTo: input.email } : {}),
    html: `<p><strong>${escapeHtml(input.name)}</strong> (${escapeHtml(who)})</p><p>Source: beacon-ai</p><p>${escapeHtml(input.message).replace(/\n/g, "<br/>")}</p>`,
    text: `${input.name} (${who})\nSource: beacon-ai\n\n${input.message}`,
  });
}
