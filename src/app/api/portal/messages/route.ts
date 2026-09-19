import { NextResponse } from "next/server";
import { getPortalSession } from "@/lib/portal-auth";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { findProjectById } from "@/lib/projects";
import {
  getThread,
  listThreads,
  markThreadRead,
  postMessage,
  unreadCount,
} from "@/lib/messages";
import { parseRequestJson } from "@/lib/storage";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");
  const admin = await isAdminAuthenticated();
  const session = await getPortalSession();

  if (!admin && !session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (admin && searchParams.get("inbox") === "1") {
    const threads = await listThreads();
    const enriched = await Promise.all(
      threads.map(async (t) => {
        const project = await findProjectById(t.projectId);
        return {
          ...t,
          unread: unreadCount(t, "admin"),
          projectTitle: project?.title,
          lastMessage: t.messages[t.messages.length - 1] ?? null,
        };
      })
    );
    enriched.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    return NextResponse.json({ threads: enriched });
  }

  if (!projectId) {
    return NextResponse.json({ error: "projectId required" }, { status: 400 });
  }

  const project = await findProjectById(projectId);
  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!admin && session && project.clientId !== session.clientId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const thread = await getThread(projectId);
  if (thread) {
    await markThreadRead(projectId, admin ? "admin" : "client");
  }

  const refreshed = await getThread(projectId);
  return NextResponse.json({
    thread: refreshed ?? { projectId, clientId: project.clientId, messages: [], updatedAt: "" },
    unread: 0,
  });
}

export async function POST(request: Request) {
  const admin = await isAdminAuthenticated();
  const session = await getPortalSession();
  if (!admin && !session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await parseRequestJson(request);
  const projectId = typeof body.projectId === "string" ? body.projectId : "";
  const text = typeof body.body === "string" ? body.body.trim() : "";

  if (!projectId || !text) {
    return NextResponse.json({ error: "projectId and body required" }, { status: 400 });
  }

  const project = await findProjectById(projectId);
  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!admin && session && project.clientId !== session.clientId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const msg = await postMessage({
    projectId,
    clientId: project.clientId,
    sender: admin ? "admin" : "client",
    body: text,
  });

  return NextResponse.json({ ok: true, message: msg });
}
