import { NextResponse } from "next/server";
import { parseRequestJson, readJsonFile, writeJsonFile } from "@/lib/storage";
import { isValidEmail } from "@/lib/validation";
import { randomUUID } from "crypto";

export const runtime = "nodejs";

type ContactSubmission = {
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

    // Notify studio + optional auto-ack (graceful without Resend keys)
    const { sendResendEmail, isResendConfigured } = await import("@/lib/resend");
    const { siteConfig } = await import("@/data/site");
    if (isResendConfigured()) {
      await sendResendEmail({
        to: siteConfig.email,
        subject: `Contact form — ${name}`,
        ...(emailOk ? { replyTo: email } : {}),
        html: `<p><strong>${name}</strong> (${email || phone})</p><p>Source: ${entry.source}</p><p>${message.replace(/\n/g, "<br/>")}</p>`,
        text: `${name} (${email || phone})\nSource: ${entry.source}\n\n${message}`,
      });
      if (emailOk) {
        await sendResendEmail({
          to: email,
          subject: `We got your message — ${siteConfig.brand.name}`,
          html: `<p>Hi ${name},</p><p>Thanks for reaching out to ${siteConfig.brand.name}. We'll reply within 1–2 business days (EAT).</p>`,
          text: `Hi ${name}, thanks for reaching out to ${siteConfig.brand.name}. We'll reply within 1–2 business days (EAT).`,
        });
      }
    }

    return NextResponse.json({ ok: true, id: entry.id });
  } catch {
    return NextResponse.json({ error: "Failed to save message." }, { status: 500 });
  }
}
