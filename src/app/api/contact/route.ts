import { notifyAddressFor } from "@/lib/mail-addresses";
import { renderBrandEmail } from "@/lib/brand-email";
import { NextResponse } from "next/server";
import { parseRequestJson, readJsonFile, writeJsonFile } from "@/lib/storage";
import { isValidEmail } from "@/lib/validation";
import { randomUUID } from "crypto";
import { attributionFromRecord, attributionNote, type LeadAttribution } from "@/lib/attribution";

export const runtime = "nodejs";

type ContactSubmission = LeadAttribution & {
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

/**
 * Persist contact form submissions (also opens mailto on client).
 */
export async function POST(request: Request) {
  try {
    const body = await parseRequestJson(request);
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";
    const topic = typeof body.topic === "string" ? body.topic.trim() : "";
    const message = typeof body.message === "string" ? body.message.trim() : "";
    const source = typeof body.source === "string" ? body.source.trim().slice(0, 80) : "";
    const attribution = attributionFromRecord(body);
    const campaign = attributionNote(attribution);
    const emailOk = Boolean(email) && isValidEmail(email);
    const phoneOk = phone.replace(/\D/g, "").length >= 7;

    if (!name || !message || (!emailOk && !phoneOk)) {
      return NextResponse.json(
        { error: "Name, a message, and an email or phone are required." },
        { status: 400 }
      );
    }
    if (email && !emailOk) {
      return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
    }

    const entry: ContactSubmission = {
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      name,
      email,
      ...(phone ? { phone } : {}),
      ...(topic ? { topic } : {}),
      ...(source ? { source } : { source: "contact-form" }),
      ...attribution,
      message,
      read: false,
      status: "new",
    };

    if (emailOk) {
      const { upsertClient } = await import("@/lib/clients");
      await upsertClient({ email, name, ...(phone ? { phone } : {}) });
    }

    const all = await readJsonFile<ContactSubmission[]>("contacts.json", []);
    all.unshift(entry);
    await writeJsonFile("contacts.json", all);

    try {
      const { captureLead } = await import("@/lib/leads");
      await captureLead({
        kind: "contact",
        sourceId: entry.id,
        source: entry.source || "contact-form",
        name,
        email,
        phone,
        services: topic ? [topic] : [],
        message,
      });
    } catch (error) {
      console.error("[contact] lead", error instanceof Error ? error.message : "lead failed");
    }

    const { sendResendEmail, isResendConfigured } = await import("@/lib/resend");
    const { siteConfig } = await import("@/data/site");
    const { recordSiteForm } = await import("@/lib/mailbox");
    try {
      await recordSiteForm({
        kind: "contact",
        sourceId: entry.id,
        name,
        ...(emailOk ? { email } : {}),
        ...(phone ? { phone } : {}),
        subject: `Contact form — ${name}`,
        text: [`Source: ${entry.source}`, campaign, phone ? `Phone: ${phone}` : "", message].filter(Boolean).join("\n"),
        confirmationSubject: `We received your message — ${siteConfig.brand.name}`,
      });
    } catch (error) {
      console.error("[contact] mailbox", error instanceof Error ? error.message : "mailbox failed");
    }
    if (isResendConfigured()) {
      await sendResendEmail({ purpose: "leadAlert",
        to: notifyAddressFor("leadAlert"),
        subject: `Contact form — ${name}`,
        ...(emailOk ? { replyTo: email } : {}),
        ...renderBrandEmail({
          heading: `New contact: ${name}`,
          greeting: "New message from the contact form.",
          paragraphs: [message],
          card: [
            { label: "From", value: `${name} (${email || phone})` },
            { label: "Source", value: entry.source || "website" },
          ],
        }),
      });
    }

    return NextResponse.json({ ok: true, id: entry.id });
  } catch {
    return NextResponse.json({ error: "Failed to save message." }, { status: 500 });
  }
}
