import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { parseRequestJson, readJsonFile, writeJsonFile } from "@/lib/storage";
import {
  findProjectById,
  listProjects,
  updateProject,
  addProjectUpdate,
  createProjectFromIntake,
  createClientProject,
  sanitizeMilestones,
  isProjectStatus,
  type ProjectRecord,
  type ProjectStatus,
} from "@/lib/projects";
import { normalizeServiceIds } from "@/lib/intake-services";
import { findClientById, listClients, upsertClient, updateClient } from "@/lib/clients";
import { createQuotation, createReceiptFromPayment, listQuotations, listReceipts } from "@/lib/documents";
import { listPayments, updatePaymentById } from "@/lib/payments";
import { ensureThread } from "@/lib/messages";
import { createAccessToken } from "@/lib/portal-auth";

export const runtime = "nodejs";

type BookingRow = Record<string, unknown> & {
  id?: string;
  status?: string;
  adminNotes?: string;
  rescheduleNote?: string;
  read?: boolean;
};

type IntakeRow = Record<string, unknown> & {
  id?: string;
  status?: string;
  contacted?: boolean;
  projectId?: string;
  clientId?: string;
  adminNotes?: string;
  name?: string;
  email?: string;
  company?: string;
  projectType?: string;
  projectTypes?: unknown;
  budget?: string;
  timeline?: string;
  brief?: string;
  read?: boolean;
};

type ContactRow = Record<string, unknown> & {
  id?: string;
  status?: string;
  read?: boolean;
  replied?: boolean;
  archived?: boolean;
};

type SubscriberRow = Record<string, unknown> & {
  id?: string;
  email?: string;
  createdAt?: string;
  subscribedAt?: string;
};

/**
 * Admin ops mutations — bookings, intakes, contacts, newsletter, projects, payments.
 */
export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await parseRequestJson(request);
  const action = typeof body.action === "string" ? body.action : "";

  // ── Bookings ──────────────────────────────────────────────
  if (action === "booking.update") {
    const id = String(body.id ?? "");
    const bookings = await readJsonFile<BookingRow[]>("bookings.json", []);
    const idx = bookings.findIndex((b) => b.id === id);
    if (idx < 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const status = typeof body.status === "string" ? body.status : undefined;
    if (status) bookings[idx].status = status;
    if (typeof body.adminNotes === "string") bookings[idx].adminNotes = body.adminNotes;
    if (typeof body.rescheduleNote === "string")
      bookings[idx].rescheduleNote = body.rescheduleNote;
    bookings[idx].read = true;
    await writeJsonFile("bookings.json", bookings);
    return NextResponse.json({ ok: true, booking: bookings[idx] });
  }

  // ── Intakes ───────────────────────────────────────────────
  if (action === "intake.update") {
    const id = String(body.id ?? "");
    const intakes = await readJsonFile<IntakeRow[]>("intakes.json", []);
    const idx = intakes.findIndex((i) => i.id === id);
    if (idx < 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (typeof body.status === "string") intakes[idx].status = body.status;
    if (typeof body.contacted === "boolean") intakes[idx].contacted = body.contacted;
    if (typeof body.adminNotes === "string") intakes[idx].adminNotes = body.adminNotes;
    intakes[idx].read = true;
    await writeJsonFile("intakes.json", intakes);
    return NextResponse.json({ ok: true, intake: intakes[idx] });
  }

  if (action === "intake.convert") {
    const id = String(body.id ?? "");
    const intakes = await readJsonFile<IntakeRow[]>("intakes.json", []);
    const idx = intakes.findIndex((i) => i.id === id);
    if (idx < 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const intake = intakes[idx];

    if (intake.projectId) {
      const existing = await findProjectById(String(intake.projectId));
      return NextResponse.json({ ok: true, project: existing, already: true });
    }

    const client = await upsertClient({
      email: String(intake.email ?? ""),
      name: String(intake.name ?? "Client"),
      company: intake.company ? String(intake.company) : undefined,
    });
    const services = normalizeServiceIds(intake);
    const project = await createProjectFromIntake({
      clientId: client.id,
      intakeId: String(intake.id),
      name: String(intake.name ?? "Client"),
      projectType: services[0] ?? "other",
      projectTypes: services,
      budget: String(intake.budget ?? "explore"),
      timeline: String(intake.timeline ?? "exploring"),
      brief: String(intake.brief ?? "Converted from intake."),
    });
    const quotation = await createQuotation({ project, client });
    await updateProject(project.id, {
      quotationId: quotation.id,
      status: "active",
    });
    const token = createAccessToken(client.id, client.email, project.id);
    await updateClient(client.id, { accessToken: token });
    await ensureThread(project.id, client.id);

    intakes[idx].projectId = project.id;
    intakes[idx].clientId = client.id;
    intakes[idx].status = "converted";
    intakes[idx].read = true;
    await writeJsonFile("intakes.json", intakes);

    return NextResponse.json({
      ok: true,
      project,
      quotation,
      accessToken: token,
      portalPath: `/portal/login?token=${encodeURIComponent(token)}`,
    });
  }

  if (action === "intake.send-quotation") {
    const id = String(body.id ?? "");
    const intakes = await readJsonFile<IntakeRow[]>("intakes.json", []);
    const idx = intakes.findIndex((i) => i.id === id);
    if (idx < 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const intake = intakes[idx];

    const projectId = intake.projectId ? String(intake.projectId) : "";
    if (!projectId) {
      const client = await upsertClient({
        email: String(intake.email ?? ""),
        name: String(intake.name ?? "Client"),
        company: intake.company ? String(intake.company) : undefined,
      });
      const services = normalizeServiceIds(intake);
      const project = await createProjectFromIntake({
        clientId: client.id,
        intakeId: String(intake.id),
        name: String(intake.name ?? "Client"),
        projectType: services[0] ?? "other",
        projectTypes: services,
        budget: String(intake.budget ?? "explore"),
        timeline: String(intake.timeline ?? "exploring"),
        brief: String(intake.brief ?? "Converted from intake."),
      });
      const quotation = await createQuotation({ project, client });
      await updateProject(project.id, {
        quotationId: quotation.id,
        status: "quoted",
      });
      const token = createAccessToken(client.id, client.email, project.id);
      await updateClient(client.id, { accessToken: token });
      await ensureThread(project.id, client.id);
      intakes[idx].projectId = project.id;
      intakes[idx].clientId = client.id;
      intakes[idx].status = "quoted";
      intakes[idx].read = true;
      await writeJsonFile("intakes.json", intakes);
      return NextResponse.json({
        ok: true,
        quotation,
        projectId: project.id,
        converted: true,
        accessToken: token,
      });
    }

    const project = await findProjectById(projectId);
    const client = project ? await findClientById(project.clientId) : null;
    if (!project || !client) {
      return NextResponse.json({ error: "Project/client missing" }, { status: 404 });
    }
    const quotation = await createQuotation({ project, client });
    await updateProject(project.id, { quotationId: quotation.id, status: "quoted" });
    intakes[idx].status = "quoted";
    intakes[idx].read = true;
    await writeJsonFile("intakes.json", intakes);
    return NextResponse.json({ ok: true, quotation });
  }

  // ── Contacts ──────────────────────────────────────────────
  if (action === "contact.update") {
    const id = String(body.id ?? "");
    const contacts = await readJsonFile<ContactRow[]>("contacts.json", []);
    const idx = contacts.findIndex((c) => c.id === id);
    if (idx < 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (typeof body.read === "boolean") contacts[idx].read = body.read;
    if (typeof body.replied === "boolean") {
      contacts[idx].replied = body.replied;
      if (body.replied) contacts[idx].status = "replied";
    }
    if (typeof body.archived === "boolean") {
      contacts[idx].archived = body.archived;
      if (body.archived) contacts[idx].status = "archived";
    }
    await writeJsonFile("contacts.json", contacts);
    return NextResponse.json({ ok: true, contact: contacts[idx] });
  }

  // ── Newsletter ────────────────────────────────────────────
  if (action === "subscriber.remove") {
    const email = String(body.email ?? "").toLowerCase();
    const subs = await readJsonFile<SubscriberRow[]>("subscribers.json", []);
    const next = subs.filter((s) => String(s.email ?? "").toLowerCase() !== email);
    await writeJsonFile("subscribers.json", next);
    return NextResponse.json({ ok: true, removed: email });
  }

  if (action === "subscriber.export") {
    const subs = await readJsonFile<SubscriberRow[]>("subscribers.json", []);
    const header = "email,firstName,subscribedAt\n";
    const rows = subs
      .map((s) => {
        const email = String(s.email ?? "");
        const first = String((s as { firstName?: string }).firstName ?? "");
        const at = String(s.subscribedAt ?? s.createdAt ?? "");
        return `"${email}","${first}","${at}"`;
      })
      .join("\n");
    return new NextResponse(header + rows, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="beacon-subscribers-${Date.now()}.csv"`,
      },
    });
  }

  // ── Attention resolve ─────────────────────────────────────
  if (action === "attention.resolve") {
    const kind = String(body.kind ?? "");
    const id = String(body.id ?? "").replace(/^(book|intake|pay|contact|sub)-/, "");
    const map: Record<string, string> = {
      booking: "bookings.json",
      intake: "intakes.json",
      payment: "payments.json",
      contact: "contacts.json",
      subscriber: "subscribers.json",
    };
    const file = map[kind];
    if (!file) return NextResponse.json({ error: "Unknown kind" }, { status: 400 });
    const items = await readJsonFile<Record<string, unknown>[]>(file, []);
    const hit = items.find((i) => String(i.id) === id || String(i.id) === body.id);
    if (hit) {
      hit.read = true;
      hit.resolved = true;
      await writeJsonFile(file, items);
    }
    return NextResponse.json({ ok: true });
  }

  // ── Projects (portal sync) ────────────────────────────────
  if (action === "project.create") {
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const clientId = typeof body.clientId === "string" ? body.clientId.trim() : "";
    let client = clientId ? await findClientById(clientId) : null;
    if (!client) {
      if (!email || !name) {
        return NextResponse.json({ error: "Choose a client, or enter a name and email." }, { status: 400 });
      }
      client = await upsertClient({
        email,
        name,
        company: typeof body.company === "string" ? body.company.trim() : undefined,
      });
    }
    const services = normalizeServiceIds(body);
    const milestones = Array.isArray(body.milestones) ? sanitizeMilestones(body.milestones) : undefined;
    const status = typeof body.status === "string" && isProjectStatus(body.status) ? body.status : "active";
    const project = await createClientProject({
      clientId: client.id,
      title: typeof body.title === "string" ? body.title : `${client.name} project`,
      status,
      projectType: services[0],
      projectTypes: services,
      brief: typeof body.brief === "string" ? body.brief : undefined,
      milestones,
      progressPercent: typeof body.progressPercent === "number" ? body.progressPercent : undefined,
      adminNotes: typeof body.adminNotes === "string" ? body.adminNotes : undefined,
      startDate: typeof body.startDate === "string" ? body.startDate : undefined,
      targetDate: typeof body.targetDate === "string" ? body.targetDate : undefined,
      updateMessage: typeof body.updateMessage === "string" ? body.updateMessage : undefined,
    });
    await ensureThread(project.id, client.id);
    return NextResponse.json({ ok: true, project });
  }

  if (action === "project.update") {
    const id = String(body.id ?? "");
    const patch: Partial<ProjectRecord> = {};
    if (typeof body.status === "string" && isProjectStatus(body.status)) patch.status = body.status as ProjectStatus;
    if (typeof body.title === "string" && body.title.trim()) patch.title = body.title.trim();
    if (typeof body.brief === "string") patch.brief = body.brief;
    if (typeof body.nextPaymentDate === "string") patch.nextPaymentDate = body.nextPaymentDate;
    if (typeof body.nextPaymentAmount === "number")
      patch.nextPaymentAmount = body.nextPaymentAmount;
    if (typeof body.adminNotes === "string") patch.adminNotes = body.adminNotes;
    if (typeof body.startDate === "string") patch.startDate = body.startDate;
    if (typeof body.targetDate === "string") patch.targetDate = body.targetDate;
    if (typeof body.progressPercent === "number") patch.progressPercent = body.progressPercent;
    if (Array.isArray(body.milestones)) patch.milestones = sanitizeMilestones(body.milestones);
    const updated = await updateProject(id, patch);
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (typeof body.updateMessage === "string" && body.updateMessage.trim()) {
      await addProjectUpdate(id, body.updateMessage.trim(), "admin");
    }
    return NextResponse.json({ ok: true, project: await findProjectById(id) });
  }

  // ── Payments mark paid + receipt ──────────────────────────
  if (action === "payment.mark-paid") {
    const id = String(body.id ?? "");
    const payment = await updatePaymentById(id, {
      status: "success",
      read: true,
      receipt: typeof body.reference === "string" ? body.reference : `MANUAL-${Date.now()}`,
    });
    if (!payment) return NextResponse.json({ error: "Not found" }, { status: 404 });

    let project = null;
    let client = null;
    const projectId =
      (typeof body.projectId === "string" && body.projectId) || payment.projectId || "";
    if (projectId) {
      project = await findProjectById(projectId);
      if (project) client = await findClientById(project.clientId);
    }
    const receipt = await createReceiptFromPayment({ payment, project, client });
    return NextResponse.json({ ok: true, payment, receipt });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const [projects, clients, quotations, receipts, payments] = await Promise.all([
    listProjects(),
    listClients(),
    listQuotations(),
    listReceipts(),
    listPayments(),
  ]);
  return NextResponse.json({ projects, clients, quotations, receipts, payments });
}
