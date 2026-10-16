import { NextResponse } from "next/server";
import { parseRequestJson, readJsonFile, writeJsonFile } from "@/lib/storage";
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

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Name, email, and message are required." }, { status: 400 });
    }

    const entry: ContactSubmission = {
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      name,
      email,
      ...(phone ? { phone } : {}),
      ...(topic ? { topic } : {}),
      message,
      read: false,
      status: "new",
    };

    const { upsertClient } = await import("@/lib/clients");
    await upsertClient({ email, name, ...(phone ? { phone } : {}) });

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
        replyTo: email,
        html: `<p><strong>${name}</strong> (${email})</p><p>${message.replace(/\n/g, "<br/>")}</p>`,
        text: `${name} (${email})\n\n${message}`,
      });
      await sendResendEmail({
        to: email,
        subject: `We got your message — ${siteConfig.brand.name}`,
        html: `<p>Hi ${name},</p><p>Thanks for reaching out to ${siteConfig.brand.name}. We'll reply within 1–2 business days (EAT).</p>`,
        text: `Hi ${name}, thanks for reaching out to ${siteConfig.brand.name}. We'll reply within 1–2 business days (EAT).`,
      });
    }

    return NextResponse.json({ ok: true, id: entry.id });
  } catch {
    return NextResponse.json({ error: "Failed to save message." }, { status: 500 });
  }
}
