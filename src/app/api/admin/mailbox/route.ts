import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, isAdminAuthenticated } from "@/lib/admin-auth";
import { checkSend, sendRateLimit } from "@/lib/mail-guard";
import {
  archiveMailboxThread,
  findThreadIdByLead,
  getMailboxThread,
  listMailbox,
  markMailboxRead,
  restoreMailboxThread,
  saveMailboxDraft,
  sendMailbox,
  type ComposeInput,
} from "@/lib/mailbox";
import type { MailFolder } from "@/lib/mailbox-types";
import { isMailboxConfigured } from "@/lib/resend";
import { parseRequestJson } from "@/lib/storage";

export const runtime = "nodejs";

const FOLDERS: MailFolder[] = ["inbox", "sent", "drafts", "archive"];

function folderOf(value: string | null): MailFolder {
  return FOLDERS.includes(value as MailFolder) ? (value as MailFolder) : "inbox";
}

function composeFrom(body: Record<string, unknown>): ComposeInput {
  const mode = body.mode === "reply" || body.mode === "forward" ? body.mode : "new";
  const attachments = Array.isArray(body.attachments)
    ? body.attachments.flatMap((item) => {
        if (!item || typeof item !== "object") return [];
        const file = item as Record<string, unknown>;
        if (typeof file.filename !== "string" || typeof file.contentBase64 !== "string") return [];
        return [
          {
            filename: file.filename,
            contentBase64: file.contentBase64,
            ...(typeof file.contentType === "string" ? { contentType: file.contentType } : {}),
          },
        ];
      })
    : [];
  return {
    mode,
    ...(typeof body.threadId === "string" ? { threadId: body.threadId } : {}),
    ...(typeof body.messageId === "string" ? { messageId: body.messageId } : {}),
    ...(typeof body.draftMessageId === "string" ? { draftMessageId: body.draftMessageId } : {}),
    to: typeof body.to === "string" ? body.to : "",
    cc: typeof body.cc === "string" ? body.cc : "",
    subject: typeof body.subject === "string" ? body.subject : "",
    text: typeof body.text === "string" ? body.text : "",
    attachments,
    ...(typeof body.from === "string" ? { from: body.from } : {}),
  };
}

export async function GET(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const url = new URL(request.url);
  const leadId = url.searchParams.get("leadId");
  if (leadId) {
    const threadId = await findThreadIdByLead(leadId);
    return NextResponse.json({ configured: isMailboxConfigured(), threadId });
  }
  const id = url.searchParams.get("id");
  if (id) {
    const remoteImages = url.searchParams.get("images") === "1";
    const thread = await getMailboxThread(id, { remoteImages });
    if (!thread) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (thread.unread) await markMailboxRead(id, false);
    const fresh = thread.unread ? await getMailboxThread(id, { remoteImages }) : thread;
    return NextResponse.json({ configured: isMailboxConfigured(), thread: fresh ?? thread });
  }
  const folder = folderOf(url.searchParams.get("folder"));
  const q = url.searchParams.get("q") || "";
  const list = await listMailbox(folder, q, url.searchParams.get("mailbox") || undefined);
  return NextResponse.json(list);
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await parseRequestJson(request);
  const action = typeof body.action === "string" ? body.action : "";
  const threadId = typeof body.threadId === "string" ? body.threadId : "";

  try {
    if (action === "send" || action === "reply" || action === "forward") {
      const input = composeFrom(body);
      if (action !== "send") input.mode = action;
      const lengthHeader = request.headers.get("content-length");
      const problem = checkSend({
        origin: request.headers.get("origin"),
        referer: request.headers.get("referer"),
        host: request.headers.get("x-forwarded-host") || request.headers.get("host"),
        contentLength: lengthHeader ? Number(lengthHeader) : null,
        confirm: body.confirm,
        to: input.to,
        cc: input.cc,
        subject: input.subject,
        text: input.text,
      });
      if (problem) return NextResponse.json({ error: problem }, { status: 400 });
      const jar = await cookies();
      const session = createHash("sha256").update(jar.get(ADMIN_COOKIE)?.value || "none").digest("hex").slice(0, 16);
      const limit = sendRateLimit(session);
      if (!limit.ok) {
        return NextResponse.json(
          { error: `Sending limit reached. Try again in ${limit.retryAfter}s.` },
          { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
        );
      }
      const result = await sendMailbox(input);
      return NextResponse.json({
        ok: result.sent,
        sent: result.sent,
        error: result.sent ? undefined : result.error || "Email not configured",
        thread: result.thread,
      });
    }
    if (action === "draft") {
      const thread = await saveMailboxDraft(composeFrom(body));
      return NextResponse.json({ ok: true, thread });
    }
    if (action === "archive" && threadId) {
      const ok = await archiveMailboxThread(threadId);
      return NextResponse.json({ ok });
    }
    if (action === "restore" && threadId) {
      const ok = await restoreMailboxThread(threadId);
      return NextResponse.json({ ok });
    }
    if ((action === "read" || action === "unread") && threadId) {
      const ok = await markMailboxRead(threadId, action === "unread");
      return NextResponse.json({ ok });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Mailbox action failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
