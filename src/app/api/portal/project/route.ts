import { NextResponse } from "next/server";
import { getPortalSession } from "@/lib/portal-auth";
import { findClientById } from "@/lib/clients";
import { findProjectById, findProjectsByClient, addProjectReview } from "@/lib/projects";
import { findQuotationByProject, findReceiptsByProject } from "@/lib/documents";
import { getThread, unreadCount } from "@/lib/messages";
import { daysUntil } from "@/lib/time";
import { parseRequestJson } from "@/lib/storage";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");
  const admin = await isAdminAuthenticated();
  const session = await getPortalSession();

  if (!admin && !session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (admin && !projectId && searchParams.get("list") === "1") {
    const { listProjects } = await import("@/lib/projects");
    const { listClients } = await import("@/lib/clients");
    const projects = await listProjects();
    const clients = await listClients();
    return NextResponse.json({
      projects,
      clients,
    });
  }

  let project = projectId ? await findProjectById(projectId) : null;

  if (!project && session) {
    const projects = await findProjectsByClient(session.clientId);
    project = projects[0] ?? null;
  }

  if (!project) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  if (!admin && session && project.clientId !== session.clientId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const client = await findClientById(project.clientId);
  const quotation = await findQuotationByProject(project.id);
  const receipts = await findReceiptsByProject(project.id);
  const thread = await getThread(project.id);
  const unread = thread
    ? unreadCount(thread, admin ? "admin" : "client")
    : 0;

  const nextPaymentDays =
    project.nextPaymentDate != null ? daysUntil(project.nextPaymentDate) : null;

  return NextResponse.json({
    project,
    client: client
      ? { id: client.id, name: client.name, email: client.email, company: client.company }
      : null,
    quotation,
    receipts,
    unreadMessages: unread,
    nextPaymentDays,
  });
}

/** Client submits a progress review */
export async function POST(request: Request) {
  const session = await getPortalSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await parseRequestJson(request);
  const projectId = typeof body.projectId === "string" ? body.projectId : "";
  const comment = typeof body.comment === "string" ? body.comment.trim() : "";
  const rating = typeof body.rating === "number" ? body.rating : Number(body.rating);

  if (!projectId || !comment || !(rating >= 1 && rating <= 5)) {
    return NextResponse.json({ error: "projectId, comment, and rating 1–5 required." }, { status: 400 });
  }

  const project = await findProjectById(projectId);
  if (!project || project.clientId !== session.clientId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const client = await findClientById(session.clientId);
  const updated = await addProjectReview(projectId, {
    author: client?.name ?? session.email,
    rating,
    comment,
  });

  return NextResponse.json({ ok: true, project: updated });
}
