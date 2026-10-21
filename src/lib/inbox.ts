import { siteConfig } from "@/data/site";
import { findClientByEmail, listClients, upsertClient, type ClientRecord } from "@/lib/clients";
import { getThread, markThreadRead, postMessage, listThreads, type MessageThread } from "@/lib/messages";
import {
  findProjectsByClient,
  listProjects,
  setReviewVisibility,
  type ReviewVisibility,
} from "@/lib/projects";
import { findBooking, sendBookingClientEmail } from "@/lib/booking-mail";
import { brandedEmail } from "@/lib/email-html";
import { isResendConfigured, sendResendEmail } from "@/lib/resend";
import { readJsonFile, writeJsonFile } from "@/lib/storage";
import { normalizeServiceIds, serviceLabels } from "@/lib/intake-services";

export type InboxKind = "contact" | "intake" | "booking" | "review" | "message";

export type InboxItem = {
  id: string;
  kind: InboxKind;
  sourceId: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  createdAt: string;
  status: string;
  /** Where the lead came from, e.g. quick-lead:automation or contact-form. */
  leadSource: string;
  projectId?: string;
  clientId?: string;
  reviewId?: string;
  date?: string;
  time?: string;
  meetingType?: string;
  rescheduleNote?: string;
  convertedToLead?: boolean;
};

type ContactRow = {
  id?: string;
  createdAt?: string;
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
  topic?: string;
  source?: string;
  read?: boolean;
  replied?: boolean;
  archived?: boolean;
  status?: string;
};

type IntakeRow = {
  id?: string;
  createdAt?: string;
  submittedAt?: string;
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  brief?: string;
  projectType?: string;
  projectTypes?: string[];
  status?: string;
  projectId?: string;
  clientId?: string;
  read?: boolean;
};

type BookingRow = {
  id?: string;
  createdAt?: string;
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
  meetingType?: string;
  date?: string;
  time?: string;
  source?: string;
  status?: string;
  read?: boolean;
  replied?: boolean;
  rescheduleNote?: string;
  convertedToLead?: boolean;
};

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function shown(value: unknown): string {
  const s = text(value);
  return s || "—";
}

function bookingStatus(row: BookingRow): string {
  const status = text(row.status);
  if (status && status !== "pending" && status !== "new") return status;
  if (row.replied) return "replied";
  if (status) return status;
  return row.read ? "read" : "pending";
}

function topicLabel(id: string): string {
  return siteConfig.contactTopics.find((t) => t.id === id)?.label ?? id;
}

function clientPhone(clients: ClientRecord[], email: string, clientId?: string): string {
  const byId = clientId ? clients.find((c) => c.id === clientId) : undefined;
  const byEmail = clients.find((c) => c.email === email.toLowerCase());
  return text(byId?.phone) || text(byEmail?.phone);
}

export async function listInbox(): Promise<InboxItem[]> {
  const [contacts, intakes, bookings, projects, threads, clients] = await Promise.all([
    readJsonFile<ContactRow[]>("contacts.json", []),
    readJsonFile<IntakeRow[]>("intakes.json", []),
    readJsonFile<BookingRow[]>("bookings.json", []),
    listProjects(),
    listThreads(),
    listClients(),
  ]);

  const items: InboxItem[] = [];

  for (const row of contacts) {
    if (!row.id) continue;
    const topic = text(row.topic);
    const message = text(row.message);
    items.push({
      id: `contact:${row.id}`,
      kind: "contact",
      sourceId: row.id,
      name: shown(row.name),
      email: shown(row.email),
      phone: shown(row.phone || clientPhone(clients, text(row.email))),
      message: topic ? `${topicLabel(topic)}${message ? ` — ${message}` : ""}` : message || "—",
      leadSource: text(row.source) || "contact-form",
      createdAt: text(row.createdAt) || new Date(0).toISOString(),
      status: row.archived
        ? "archived"
        : row.replied || row.status === "replied"
          ? "replied"
          : row.read
            ? "read"
            : "new",
    });
  }

  for (const row of intakes) {
    if (!row.id) continue;
    const label = serviceLabels(normalizeServiceIds(row)) || "Project";
    items.push({
      id: `intake:${row.id}`,
      kind: "intake",
      sourceId: row.id,
      name: shown(row.name),
      email: shown(row.email),
      phone: shown(row.phone || clientPhone(clients, text(row.email), row.clientId)),
      message: `${label}: ${text(row.brief) || "—"}`,
      leadSource: "intake",
      createdAt: text(row.submittedAt) || text(row.createdAt) || new Date(0).toISOString(),
      status: text(row.status) || "new",
      projectId: row.projectId,
      clientId: row.clientId,
    });
  }

  for (const row of bookings) {
    if (!row.id) continue;
    const when = [row.date, row.time].filter(Boolean).join(" ");
    const note = text(row.message);
    items.push({
      id: `booking:${row.id}`,
      kind: "booking",
      sourceId: row.id,
      name: shown(row.name),
      email: shown(row.email),
      phone: shown(row.phone || clientPhone(clients, text(row.email))),
      message: [row.meetingType || "Call", when, note].filter(Boolean).join(" · "),
      leadSource: text(row.source) || "booking",
      createdAt: text(row.createdAt) || new Date(0).toISOString(),
      status: bookingStatus(row),
      date: text(row.date),
      time: text(row.time),
      meetingType: text(row.meetingType),
      rescheduleNote: text(row.rescheduleNote),
      convertedToLead: row.convertedToLead === true,
    });
  }

  for (const project of projects) {
    const client = clients.find((c) => c.id === project.clientId);
    for (const review of project.reviews) {
      const visibility = review.visibility ?? "pending";
      items.push({
        id: `review:${review.id}`,
        kind: "review",
        sourceId: review.id,
        reviewId: review.id,
        name: shown(review.author || client?.name),
        email: shown(client?.email),
        phone: shown(client?.phone),
        message: `${review.rating}/5 — ${review.comment}`,
        leadSource: "review",
        createdAt: review.at,
        status: visibility,
        projectId: project.id,
        clientId: project.clientId,
      });
    }
  }

  for (const thread of threads) {
    if (!thread.messages.length) continue;
    const last = thread.messages[thread.messages.length - 1];
    const client = clients.find((c) => c.id === thread.clientId);
    const project = projects.find((p) => p.id === thread.projectId);
    const unread = thread.messages.some((m) => m.sender === "client" && !m.readByAdmin);
    items.push({
      id: `message:${thread.projectId}`,
      kind: "message",
      sourceId: thread.projectId,
      name: shown(client?.name || project?.title),
      email: shown(client?.email),
      phone: shown(client?.phone),
      message: last?.body || "—",
      leadSource: "portal",
      createdAt: thread.updatedAt || last?.at || new Date(0).toISOString(),
      status: unread ? "unread" : last?.sender === "admin" ? "replied" : "open",
      projectId: thread.projectId.startsWith("client:") ? undefined : thread.projectId,
      clientId: thread.clientId,
    });
  }

  items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return items;
}

export async function getInboxItem(id: string): Promise<InboxItem | null> {
  const items = await listInbox();
  return items.find((item) => item.id === id) ?? null;
}

async function threadIdFor(item: InboxItem, clientId: string): Promise<string> {
  if (item.kind === "message") return item.sourceId;
  if (item.projectId && !item.projectId.startsWith("client:")) return item.projectId;
  const projects = await findProjectsByClient(clientId);
  if (projects[0]) return projects[0].id;
  return `client:${clientId}`;
}

async function markSourceReplied(item: InboxItem): Promise<void> {
  if (item.kind === "contact") {
    const rows = await readJsonFile<ContactRow[]>("contacts.json", []);
    const idx = rows.findIndex((row) => row.id === item.sourceId);
    if (idx >= 0) {
      rows[idx].read = true;
      rows[idx].replied = true;
      rows[idx].status = "replied";
      await writeJsonFile("contacts.json", rows);
    }
  }
  if (item.kind === "intake") {
    const rows = await readJsonFile<IntakeRow[]>("intakes.json", []);
    const idx = rows.findIndex((row) => row.id === item.sourceId);
    if (idx >= 0) {
      rows[idx].read = true;
      const status = text(rows[idx].status);
      if (!status || status === "new" || status === "read") rows[idx].status = "replied";
      await writeJsonFile("intakes.json", rows);
    }
  }
  if (item.kind === "booking") {
    const rows = await readJsonFile<BookingRow[]>("bookings.json", []);
    const idx = rows.findIndex((row) => row.id === item.sourceId);
    if (idx >= 0) {
      rows[idx].read = true;
      rows[idx].replied = true;
      await writeJsonFile("bookings.json", rows);
    }
  }
}

export async function threadForItem(item: InboxItem): Promise<MessageThread | null> {
  if (item.kind === "message") return getThread(item.sourceId);
  if (item.projectId) return getThread(item.projectId);
  if (!item.email || item.email === "—") return null;
  const client = item.clientId
    ? (await listClients()).find((row) => row.id === item.clientId) ?? null
    : await findClientByEmail(item.email);
  if (!client) return null;
  const projects = await findProjectsByClient(client.id);
  if (projects[0]) return getThread(projects[0].id);
  return getThread(`client:${client.id}`);
}

export async function replyToInbox(
  id: string,
  body: string
): Promise<{ emailed: boolean; note: string; threadId: string }> {
  const item = await getInboxItem(id);
  if (!item) throw new Error("Submission not found.");
  const reply = body.trim();
  if (!reply) throw new Error("Write a reply first.");
  if (!item.email || item.email === "—") throw new Error("This submission has no email address.");

  const client = await upsertClient({
    email: item.email,
    name: item.name === "—" ? "Client" : item.name,
    phone: item.phone !== "—" ? item.phone : undefined,
  });
  const threadId = await threadIdFor(item, client.id);
  const existing = await getThread(threadId);
  if (!existing || existing.messages.length === 0) {
    const original = item.message === "—" ? "New enquiry" : item.message;
    await postMessage({
      projectId: threadId,
      clientId: client.id,
      sender: "client",
      body: original,
    });
    await markThreadRead(threadId, "admin");
  }
  await postMessage({
    projectId: threadId,
    clientId: client.id,
    sender: "admin",
    body: reply,
  });
  await markSourceReplied(item);

  if (!isResendConfigured()) {
    return {
      emailed: false,
      threadId,
      note: "Saved in the portal. Email was not sent — RESEND_API_KEY is not set.",
    };
  }

  const portalUrl = `${siteConfig.seo.siteUrl.replace(/\/$/, "")}/portal/login`;
  const result =
    item.kind === "booking"
      ? await sendBookingClientEmail(
          (await findBooking(item.sourceId)) || {
            id: item.sourceId,
            name: item.name,
            email: item.email,
            date: item.date,
            time: item.time,
            meetingType: item.meetingType,
            rescheduleNote: item.rescheduleNote,
          },
          "reply",
          reply,
          `inbox-reply/${item.sourceId}/${Buffer.from(reply).toString("base64url").slice(0, 80)}`
        ).then((sent) => ({ sent: sent.emailed, error: sent.emailed ? undefined : sent.emailNote }))
      : await (async () => {
          const letter = brandedEmail({
            heading: `Reply from ${siteConfig.brand.name}`,
            greeting: `Hi ${client.name},`,
            bodyText: `${reply}\n\nYou can also read this in your client portal: ${portalUrl}\nSign in with ${item.email}.`,
          });
          return sendResendEmail({
            to: item.email,
            subject: `Reply from ${siteConfig.brand.name}`,
            text: letter.text,
            html: letter.html,
          });
        })();

  return {
    emailed: result.sent,
    threadId,
    note: result.sent
      ? "Reply saved in the portal and emailed."
      : `Reply saved in the portal. Email was not sent${result.error ? `: ${result.error}` : "."}`,
  };
}

export async function moderateReview(
  projectId: string,
  reviewId: string,
  visibility: ReviewVisibility
): Promise<void> {
  const updated = await setReviewVisibility(projectId, reviewId, visibility);
  if (!updated) throw new Error("Review not found.");
}
