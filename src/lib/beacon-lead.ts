import { notifyAddressFor } from "@/lib/mail-addresses";
import { renderBrandEmail } from "@/lib/brand-email";
import { randomUUID } from "crypto";
import { siteConfig } from "@/data/site";
import { extractBeaconLead, type BeaconChatMessage } from "@/lib/beacon-ai";
import { conversationTranscript, leadCategory, qualifyFromMessages } from "@/lib/assistant-guide";
import { upsertClient } from "@/lib/clients";
import { isResendConfigured, sendResendEmail } from "@/lib/resend";
import { readJsonFile, writeJsonFile } from "@/lib/storage";
import { isValidEmail } from "@/lib/validation";
import { mergeAttribution, type LeadAttribution } from "@/lib/attribution";

type ContactRow = LeadAttribution & {
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

/**
 * Persist a Beacon AI visitor in the same contacts store the admin inbox reads.
 * A repeat email or phone updates the existing beacon-ai row instead of duplicating it.
 */
export async function saveBeaconLeadFromMessages(
  messages: BeaconChatMessage[],
  attribution: LeadAttribution = {}
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

  const qualification = qualifyFromMessages(messages);
  const name = extracted.name || qualification.name || `${siteConfig.assistant.name} visitor`;
  const message = conversationTranscript(messages, qualification);
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
    Object.assign(existing, mergeAttribution(existing, attribution));
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
    await rememberBeaconLead({
      sourceId: existing.id,
      name: existing.name,
      email: existing.email,
      phone: existing.phone || "",
      message,
      category: leadCategory(qualifyFromMessages(messages)),
      budget: qualifyFromMessages(messages).budget,
    });
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
    ...attribution,
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
  await rememberBeaconLead({
    sourceId: entry.id,
    name,
    email: entry.email,
    phone: entry.phone || "",
    message,
    category: leadCategory(qualification),
    budget: qualification.budget,
  });
  await notifyStudio({
    name,
    email: emailOk ? extracted.email : "",
    phone: phoneOk ? extracted.phone : "",
    message,
  });
  return "created";
}

async function rememberBeaconLead(input: {
  sourceId: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  category?: string;
  budget?: string;
}): Promise<void> {
  try {
    const { captureLead } = await import("@/lib/leads");
    await captureLead(
      {
        kind: "contact",
        sourceId: input.sourceId,
        source: "beacon-ai",
        channel: "beacon-ai",
        name: input.name,
        email: input.email,
        phone: input.phone,
        message: input.message,
        ...(input.category ? { category: input.category } : {}),
        ...(input.budget ? { budget: input.budget } : {}),
      },
      { ai: false }
    );
  } catch (error) {
    console.error("[beacon-ai] lead", error instanceof Error ? error.message : "lead failed");
  }
}

async function notifyStudio(input: {
  name: string;
  email: string;
  phone: string;
  message: string;
}): Promise<void> {
  if (!isResendConfigured()) return;
  const who = [input.email, input.phone].filter(Boolean).join(" · ") || "no contact on file";
  await sendResendEmail({ purpose: "leadAlert",
    to: notifyAddressFor("leadAlert"),
    subject: `${siteConfig.assistant.name} lead — ${input.name}`,
    ...(input.email ? { replyTo: input.email } : {}),
    ...renderBrandEmail({
      heading: `New assistant lead: ${input.name}`,
      greeting: "A visitor left their details with the assistant.",
      paragraphs: [input.message],
      card: [
        { label: "From", value: `${input.name} (${who})` },
        { label: "Source", value: "beacon-ai" },
      ],
    }),
  });
}
