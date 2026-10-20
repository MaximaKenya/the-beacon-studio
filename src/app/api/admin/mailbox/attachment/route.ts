import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { readMailboxAttachment } from "@/lib/mailbox";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const url = new URL(request.url);
  const threadId = url.searchParams.get("thread") || "";
  const messageId = url.searchParams.get("message") || "";
  const attachmentId = url.searchParams.get("attachment") || "";
  const file = await readMailboxAttachment(threadId, messageId, attachmentId);
  if (!file?.contentBase64) {
    return NextResponse.json({ error: "Attachment not stored" }, { status: 404 });
  }
  const bytes = Buffer.from(file.contentBase64, "base64");
  return new NextResponse(new Uint8Array(bytes), {
    headers: {
      "Content-Type": file.contentType || "application/octet-stream",
      "Content-Disposition": `attachment; filename="${file.filename.replace(/"/g, "")}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
