import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getThread } from "@/lib/messages";
import { getInboxItem, listInbox, moderateReview, replyToInbox, threadForItem } from "@/lib/inbox";
import type { ReviewVisibility } from "@/lib/projects";
import { parseRequestJson } from "@/lib/storage";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const id = new URL(request.url).searchParams.get("id");
  if (id) {
    const item = await getInboxItem(id);
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const thread = await threadForItem(item);
    return NextResponse.json({ item, thread });
  }
  const items = await listInbox();
  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await parseRequestJson(request);
  const action = typeof body.action === "string" ? body.action : "";

  if (action === "reply") {
    const id = typeof body.id === "string" ? body.id : "";
    const text = typeof body.body === "string" ? body.body : "";
    try {
      const result = await replyToInbox(id, text);
      const thread = await getThread(result.threadId);
      return NextResponse.json({ ok: true, ...result, thread });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not send reply.";
      return NextResponse.json({ error: message }, { status: 400 });
    }
  }

  if (action === "review") {
    const projectId = typeof body.projectId === "string" ? body.projectId : "";
    const reviewId = typeof body.reviewId === "string" ? body.reviewId : "";
    const visibility = body.visibility;
    if (visibility !== "approved" && visibility !== "hidden" && visibility !== "pending") {
      return NextResponse.json({ error: "Choose approve or hide." }, { status: 400 });
    }
    try {
      await moderateReview(projectId, reviewId, visibility as ReviewVisibility);
      return NextResponse.json({ ok: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not update review.";
      return NextResponse.json({ error: message }, { status: 400 });
    }
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
