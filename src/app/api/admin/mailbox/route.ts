import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
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
    const thread = await getMailboxThread(id);
    if (!thread) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (thread.unread) await markMailboxRead(id, false);
    const fresh = thread.unread ? await getMailboxThread(id) : thread;
    return NextResponse.json({ configured: isMailboxConfigured(), thread: fresh ?? thread });
  }
  const folder = folderOf(url.searchParams.get("folder"));
  const q = url.searchParams.get("q") || "";
  const list = await listMailbox(folder, q);
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
