import { NextResponse } from "next/server";
import { forwardingTargets } from "@/lib/automations/forwarding";
import { dispatchHook } from "@/lib/automations/runtime";
import { ingestInboundEmail } from "@/lib/mailbox";
import { resendClient } from "@/lib/resend";

export const runtime = "nodejs";

const MAX_ATTACHMENT_BYTES = 1_500_000;

function header(request: Request, ...names: string[]): string {
  for (const name of names) {
    const value = request.headers.get(name);
    if (value) return value;
  }
  return "";
}

/**
 * Resend inbound webhook. Mail is stored for a person to read in /admin.
 * The body is never executed or treated as instructions.
 */
export async function POST(request: Request) {
  const secret = process.env.RESEND_WEBHOOK_SECRET?.trim();
  if (!secret) {
    return NextResponse.json({ error: "Email not configured" }, { status: 503 });
  }

  const payload = await request.text();
  const resend = resendClient();
  if (!resend) {
    return NextResponse.json({ error: "Email not configured" }, { status: 503 });
  }

  let event: ReturnType<typeof resend.webhooks.verify>;
  try {
    event = resend.webhooks.verify({
      payload,
      headers: {
        id: header(request, "svix-id", "webhook-id"),
        timestamp: header(request, "svix-timestamp", "webhook-timestamp"),
        signature: header(request, "svix-signature", "webhook-signature"),
      },
      webhookSecret: secret,
    });
  } catch (error) {
    console.error("[email/inbound] signature rejected", error instanceof Error ? error.message : "verify failed");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type !== "email.received") {
    return NextResponse.json({ ok: true });
  }

  const received = event.data;
  let text: string | undefined;
  let html: string | undefined;
  let headers: Record<string, string> | null = null;
  let messageId = received.message_id;
  const attachments: {
    id?: string;
    filename?: string | null;
    contentType?: string;
    size?: number;
    contentBase64?: string;
  }[] = received.attachments.map((file) => ({
    id: file.id,
    filename: file.filename,
    contentType: file.content_type,
  }));

  const full = await resend.emails.receiving.get(received.email_id);
  if (full.data) {
    text = full.data.text ?? undefined;
    html = full.data.html ?? undefined;
    headers = full.data.headers;
    messageId = full.data.message_id || messageId;
  } else if (full.error) {
    console.error("[email/inbound] body fetch failed", full.error.message);
  }

  const listed = await resend.emails.receiving.attachments.list({ emailId: received.email_id });
  const files = listed.data?.data ?? [];
  for (const file of files) {
    const slot = attachments.find((item) => item.id === file.id) ?? {
      id: file.id,
      filename: file.filename,
      contentType: file.content_type,
      size: file.size,
    };
    if (!attachments.includes(slot)) attachments.push(slot);
    slot.size = file.size;
    slot.filename = file.filename || slot.filename;
    slot.contentType = file.content_type;
    if (file.size > 0 && file.size <= MAX_ATTACHMENT_BYTES && file.download_url) {
      try {
        const download = await fetch(file.download_url);
        if (download.ok) {
          const bytes = Buffer.from(await download.arrayBuffer());
          if (bytes.length <= MAX_ATTACHMENT_BYTES) slot.contentBase64 = bytes.toString("base64");
        }
      } catch (error) {
        console.error("[email/inbound] attachment download failed", error instanceof Error ? error.message : "download failed");
      }
    }
  }

  try {
    await ingestInboundEmail({
      emailId: received.email_id,
      messageId,
      from: received.from,
      to: received.to,
      cc: received.cc,
      subject: received.subject,
      text,
      html,
      headers,
      attachments,
    });
  } catch (error) {
    console.error("[email/inbound] store failed", error instanceof Error ? error.message : "store failed");
    return NextResponse.json({ error: "Store failed" }, { status: 500 });
  }

  const origin = new URL(request.url).origin;
  for (const target of forwardingTargets(received.to)) {
    try {
      await dispatchHook(
        target.slug,
        target.kind,
        {
          from: received.from,
          subject: received.subject || "",
          body: text || "",
          message: text || "",
          notes: text || "",
        },
        origin
      );
    } catch (error) {
      console.error("[email/inbound] automation route failed", error instanceof Error ? error.message : "route failed");
    }
  }

  return NextResponse.json({ ok: true });
}
