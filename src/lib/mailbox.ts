import { randomUUID } from "crypto";
import { siteConfig } from "@/data/site";
import { findClientByEmail, listClients, upsertClient } from "@/lib/clients";
import { brandedEmail, htmlToText } from "@/lib/email-html";
import type {
  MailClientLink,
  MailFolder,
  MailLeadLink,
  MailMessageView,
  MailThreadDetail,
  MailThreadSummary,
  MailboxCounts,
} from "@/lib/mailbox-types";
import { fromAddress, isMailboxConfigured, sendResendEmail } from "@/lib/resend";
import { readJsonFile } from "@/lib/storage";
import { normalizeServiceIds, serviceLabels } from "@/lib/intake-services";
import { isValidEmail, normalizeEmail } from "@/lib/validation";
import { sanitizeEmailHtml } from "@/lib/html-sanitize";
import { describeInboundMail } from "@/lib/mail-ai";
import {
  hasResendMessage,
  loadMailbox,
  saveMailbox,
  type PersistedAttachment as StoredAttachment,
  type PersistedMailbox as MailboxDoc,
  type PersistedMessage as StoredMessage,
  type PersistedThread as StoredThread,
} from "@/lib/mail-db";

const MAX_ATTACHMENT_BYTES = 1_500_000;
const MAX_ATTACHMENTS = 3;
const MAX_TEXT = 100_000;

export type OutboundAttachment = {
  filename: string;
  contentType?: string;
  contentBase64: string;
};

export type ComposeInput = {
  mode: "new" | "reply" | "forward";
  threadId?: string;
  messageId?: string;
  draftMessageId?: string;
  to: string;
  cc?: string;
  subject: string;
  text: string;
  attachments?: OutboundAttachment[];
};

type ContactRow = {
  id?: string;
  name?: string;
  email?: string;
  message?: string;
  topic?: string;
};
type IntakeRow = {
  id?: string;
  name?: string;
  email?: string;
  brief?: string;
  projectType?: string;
  projectTypes?: string[];
};
type BookingRow = {
  id?: string;
  name?: string;
  email?: string;
  message?: string;
  meetingType?: string;
  date?: string;
  time?: string;
};

async function readDoc(): Promise<MailboxDoc> {
  const doc = await loadMailbox();
  for (const thread of doc.threads) {
    if (thread.folder !== "inbox" && thread.folder !== "sent" && thread.folder !== "drafts" && thread.folder !== "archive") {
      thread.folder = "inbox";
    }
  }
  return doc;
}

async function writeDoc(doc: MailboxDoc): Promise<void> {
  await saveMailbox(doc);
}

export function extractEmail(value: string): string {
  const match = value.match(/<([^>]+)>/);
  const raw = (match ? match[1] : value).trim().toLowerCase();
  return isValidEmail(raw) ? raw : "";
}

function clip(text: string): string {
  const clean = text.replace(/\u0000/g, "").trim();
  return clean.length > MAX_TEXT ? `${clean.slice(0, MAX_TEXT)}\n…` : clean;
}

function safeName(filename: string): string {
  const base = filename.split(/[/\\]/).pop()?.replace(/[^\w.\- ()]/g, "") || "attachment";
  return base.slice(0, 120) || "attachment";
}

function normalizeSubject(subject: string): string {
  return subject.replace(/^(\s*(re|fw|fwd)\s*:\s*)+/i, "").trim().toLowerCase();
}

function previewFrom(text: string): string {
  return text.replace(/\s+/g, " ").trim().slice(0, 180);
}

function messageDomain(): string {
  const from = fromAddress();
  const domain = from.split("@")[1];
  return domain || "localhost";
}

function asFolder(value: string): MailFolder {
  if (value === "inbox" || value === "sent" || value === "drafts" || value === "archive") return value;
  return "inbox";
}

function viewMessage(message: StoredMessage): MailMessageView {
  const html = message.html ? sanitizeEmailHtml(message.html) : "";
  return {
    id: message.id,
    direction: message.direction,
    from: message.from,
    to: message.to,
    cc: message.cc,
    subject: message.subject,
    text: message.text,
    ...(html ? { html } : {}),
    createdAt: message.createdAt,
    attachments: message.attachments.map((file) => ({
      id: file.id,
      filename: file.filename,
      contentType: file.contentType,
      size: file.size,
      stored: Boolean(file.contentBase64),
    })),
  };
}

function summarize(thread: StoredThread): MailThreadSummary {
  return {
    id: thread.id,
    subject: thread.subject,
    folder: asFolder(thread.folder),
    unread: thread.unread,
    participants: thread.participants,
    preview: thread.preview,
    updatedAt: thread.updatedAt,
    ...(thread.clientName ? { clientName: thread.clientName } : {}),
    ...(thread.leadId ? { leadId: thread.leadId } : {}),
    ...(thread.leadKind ? { leadKind: thread.leadKind } : {}),
    ...(thread.summary ? { summary: thread.summary } : {}),
    ...(thread.suggestedReply ? { suggestedReply: thread.suggestedReply } : {}),
    ...(thread.tags?.length ? { tags: thread.tags } : {}),
    messageCount: thread.messages.length,
  };
}

export function threadInFolder(thread: StoredThread, folder: MailFolder): boolean {
  if (folder === "archive") return thread.folder === "archive";
  if (thread.folder === "archive") return false;
  if (folder === "drafts") {
    return thread.folder === "drafts" || thread.messages.some((m) => m.direction === "draft");
  }
  if (folder === "inbox") return thread.folder === "inbox";
  return thread.folder !== "drafts" && thread.messages.some((m) => m.direction === "out");
}

function countsFor(threads: StoredThread[]): MailboxCounts {
  return {
    inbox: threads.filter((t) => threadInFolder(t, "inbox")).length,
    sent: threads.filter((t) => threadInFolder(t, "sent")).length,
    drafts: threads.filter((t) => threadInFolder(t, "drafts")).length,
    archive: threads.filter((t) => threadInFolder(t, "archive")).length,
    unread: threads.filter((t) => t.folder === "inbox" && t.unread).length,
  };
}

function matchesQuery(thread: StoredThread, query: string): boolean {
  if (!query) return true;
  const hay = [
    thread.subject,
    thread.preview,
    thread.summary,
    thread.clientName,
    ...(thread.tags || []),
    ...thread.participants,
    ...thread.messages.map((m) => `${m.from} ${m.subject} ${m.text}`),
  ]
    .join("\n")
    .toLowerCase();
  return hay.includes(query);
}

export function parseAddressList(value: string): string[] {
  const seen = new Set<string>();
  for (const part of value.split(/[,;]/)) {
    const email = extractEmail(part) || (isValidEmail(part.trim()) ? normalizeEmail(part) : "");
    if (email) seen.add(email);
  }
  return [...seen];
}

function takeAttachments(raw: OutboundAttachment[] | undefined, copy: StoredAttachment[] = []): StoredAttachment[] {
  const next: StoredAttachment[] = copy.map((file) => ({ ...file, id: randomUUID() }));
  for (const file of raw ?? []) {
    if (next.length >= MAX_ATTACHMENTS) break;
    if (!file || typeof file.contentBase64 !== "string" || typeof file.filename !== "string") continue;
    const contentBase64 = file.contentBase64.replace(/^data:[^;]+;base64,/, "").trim();
    if (!contentBase64) continue;
    let size = 0;
    try {
      size = Buffer.from(contentBase64, "base64").length;
    } catch {
      continue;
    }
    if (!size || size > MAX_ATTACHMENT_BYTES) continue;
    next.push({
      id: randomUUID(),
      filename: safeName(file.filename),
      contentType: file.contentType?.slice(0, 120) || "application/octet-stream",
      size,
      contentBase64,
    });
  }
  return next.slice(0, MAX_ATTACHMENTS);
}

function touch(thread: StoredThread, message: StoredMessage) {
  thread.updatedAt = message.createdAt;
  thread.preview = previewFrom(message.text || message.subject);
  thread.subject = thread.subject || message.subject;
  const people = [message.from, ...message.to, ...message.cc]
    .map(extractEmail)
    .filter((email) => email && email !== fromAddress());
  thread.participants = [...new Set([...thread.participants, ...people])];
}

async function rememberClient(email: string, name?: string, phone?: string) {
  if (!isValidEmail(email)) return null;
  return upsertClient({
    email,
    name: name?.trim() || email,
    ...(phone ? { phone } : {}),
  });
}

export async function listMailbox(folder: MailFolder, query: string): Promise<{
  configured: boolean;
  counts: MailboxCounts;
  threads: MailThreadSummary[];
}> {
  const doc = await readDoc();
  const q = query.trim().toLowerCase();
  const threads = doc.threads
    .filter((thread) => threadInFolder(thread, folder) && matchesQuery(thread, q))
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
    .map(summarize);
  return { configured: isMailboxConfigured(), counts: countsFor(doc.threads), threads };
}

export async function findThreadIdByLead(leadId: string): Promise<string | null> {
  const doc = await readDoc();
  return doc.threads.find((thread) => thread.leadId === leadId)?.id ?? null;
}

async function linksFor(thread: StoredThread): Promise<{ client: MailClientLink | null; leads: MailLeadLink[] }> {
  const emails = new Set<string>();
  for (const person of thread.participants) {
    const email = extractEmail(person);
    if (email) emails.add(email);
  }
  for (const message of thread.messages) {
    const email = extractEmail(message.from);
    if (email && email !== fromAddress()) emails.add(email);
  }

  const [clients, contacts, intakes, bookings] = await Promise.all([
    listClients(),
    readJsonFile<ContactRow[]>("contacts.json", []),
    readJsonFile<IntakeRow[]>("intakes.json", []),
    readJsonFile<BookingRow[]>("bookings.json", []),
  ]);

  const client =
    clients.find((row) => emails.has(row.email)) ??
    (thread.clientId ? clients.find((row) => row.id === thread.clientId) : undefined);

  const leads: MailLeadLink[] = [];
  const seen = new Set<string>();
  const push = (lead: MailLeadLink) => {
    if (!lead.id || seen.has(lead.id)) return;
    seen.add(lead.id);
    leads.push(lead);
  };

  for (const row of contacts) {
    const email = row.email ? normalizeEmail(row.email) : "";
    if (!row.id || !email || !emails.has(email)) continue;
    push({
      id: `contact:${row.id}`,
      kind: "contact",
      name: row.name || email,
      email,
      summary: (row.message || row.topic || "Contact").slice(0, 180),
    });
  }
  for (const row of intakes) {
    const email = row.email ? normalizeEmail(row.email) : "";
    if (!row.id || !email || !emails.has(email)) continue;
    push({
      id: `intake:${row.id}`,
      kind: "intake",
      name: row.name || email,
      email,
      summary: (row.brief || serviceLabels(normalizeServiceIds(row)) || "Intake").slice(0, 180),
    });
  }
  for (const row of bookings) {
    const email = row.email ? normalizeEmail(row.email) : "";
    if (!row.id || !email || !emails.has(email)) continue;
    const when = [row.date, row.time].filter(Boolean).join(" ");
    push({
      id: `booking:${row.id}`,
      kind: "booking",
      name: row.name || email,
      email,
      summary: [row.meetingType || "Booking", when, row.message].filter(Boolean).join(" · ").slice(0, 180),
    });
  }
  if (thread.leadId && !seen.has(thread.leadId)) {
    push({
      id: thread.leadId,
      kind: thread.leadKind || "lead",
      name: thread.clientName || thread.participants[0] || "Lead",
      email: thread.participants[0] || "",
      summary: thread.preview,
    });
  }

  return {
    client: client ? { id: client.id, name: client.name, email: client.email } : null,
    leads,
  };
}

export async function getMailboxThread(id: string): Promise<MailThreadDetail | null> {
  const doc = await readDoc();
  const thread = doc.threads.find((row) => row.id === id);
  if (!thread) return null;
  const links = await linksFor(thread);
  return { ...summarize(thread), clientId: thread.clientId, messages: thread.messages.map(viewMessage), links };
}

async function setFlag(id: string, patch: (thread: StoredThread) => void): Promise<boolean> {
  const doc = await readDoc();
  const thread = doc.threads.find((row) => row.id === id);
  if (!thread) return false;
  patch(thread);
  await writeDoc(doc);
  return true;
}

export async function markMailboxRead(id: string, unread: boolean): Promise<boolean> {
  return setFlag(id, (thread) => {
    thread.unread = unread;
  });
}

export async function archiveMailboxThread(id: string): Promise<boolean> {
  return setFlag(id, (thread) => {
    thread.folder = "archive";
    thread.unread = false;
  });
}

export async function restoreMailboxThread(id: string): Promise<boolean> {
  return setFlag(id, (thread) => {
    const hasInbound = thread.messages.some((m) => m.direction === "in");
    thread.folder = hasInbound ? "inbox" : "sent";
  });
}

function quotedForward(message: StoredMessage): string {
  return `---------- Forwarded message ----------\nFrom: ${message.from}\nSubject: ${message.subject}\n\n${message.text}`;
}

export async function saveMailboxDraft(input: ComposeInput): Promise<MailThreadDetail> {
  const doc = await readDoc();
  const now = new Date().toISOString();
  const to = parseAddressList(input.to);
  const cc = parseAddressList(input.cc || "");
  const subject = input.subject.trim() || "(no subject)";
  const text = clip(input.text);
  let thread = input.threadId ? doc.threads.find((row) => row.id === input.threadId) : undefined;

  if (!thread) {
    thread = {
      id: randomUUID(),
      subject,
      folder: "drafts",
      unread: false,
      participants: to,
      preview: previewFrom(text),
      createdAt: now,
      updatedAt: now,
      messages: [],
    };
    doc.threads.unshift(thread);
  }

  const existing = input.draftMessageId
    ? thread.messages.find((m) => m.id === input.draftMessageId && m.direction === "draft")
    : thread.messages.find((m) => m.direction === "draft");

  const message: StoredMessage = existing ?? {
    id: randomUUID(),
    direction: "draft",
    from: fromAddress() || siteConfig.email,
    to,
    cc,
    subject,
    text,
    createdAt: now,
    attachments: [],
  };
  message.to = to;
  message.cc = cc;
  message.subject = subject;
  message.text = text;
  message.createdAt = now;
  if (input.attachments) message.attachments = takeAttachments(input.attachments);
  if (!existing) thread.messages.push(message);
  if (thread.folder !== "archive" && thread.messages.every((m) => m.direction === "draft")) {
    thread.folder = "drafts";
  }
  thread.subject = subject;
  touch(thread, message);
  await writeDoc(doc);
  const detail = await getMailboxThread(thread.id);
  if (!detail) throw new Error("Could not save draft.");
  return detail;
}

async function deliverMessage(
  thread: StoredThread,
  message: StoredMessage,
  idempotencyKey: string
): Promise<{ sent: boolean; error?: string }> {
  if (!message.to.length) {
    message.direction = "draft";
    return { sent: false, error: "Add a recipient." };
  }
  if (!isMailboxConfigured()) {
    message.direction = "draft";
    return { sent: false, error: "Email not configured" };
  }

  const branded = brandedEmail({
    heading: message.subject,
    greeting: "Hello,",
    bodyText: message.text,
  });
  const headers = threadingHeaders(thread, message);
  if (headers.References) message.references = headers.References;

  const result = await sendResendEmail({
    to: message.to,
    cc: message.cc,
    subject: message.subject,
    html: branded.html,
    text: branded.text,
    headers,
    idempotencyKey,
    attachments: message.attachments
      .filter((file) => file.contentBase64)
      .map((file) => ({
        filename: file.filename,
        content: file.contentBase64 as string,
        contentType: file.contentType,
      })),
  });

  if (!result.sent) {
    message.direction = "draft";
    return { sent: false, error: result.error || "Email was not sent." };
  }
  message.direction = "out";
  message.resendId = result.id;
  message.messageId = headers["Message-ID"];
  message.from = fromHeaderFallback();
  if (thread.folder === "drafts") thread.folder = "sent";
  return { sent: true };
}

export function threadingHeaders(
  thread: { messages: { id: string; messageId?: string; references?: string }[] },
  message: { id: string; inReplyTo?: string }
): Record<string, string> {
  const headers: Record<string, string> = { "Message-ID": `<${message.id}@${messageDomain()}>` };
  if (!message.inReplyTo) return headers;
  const prior = thread.messages.flatMap((item) => {
    if (item.id === message.id) return [];
    const chain = item.references ? item.references.split(/\s+/) : [];
    return item.messageId ? [...chain, item.messageId] : chain;
  });
  const references = [...new Set([...prior, message.inReplyTo].map((item) => item.trim()).filter(Boolean))];
  headers["In-Reply-To"] = message.inReplyTo;
  headers.References = references.join(" ");
  return headers;
}

function fromHeaderFallback(): string {
  return fromAddress() || siteConfig.email;
}

export async function sendMailbox(input: ComposeInput): Promise<{ thread: MailThreadDetail; sent: boolean; error?: string }> {
  const doc = await readDoc();
  const now = new Date().toISOString();
  const to = parseAddressList(input.to);
  const cc = parseAddressList(input.cc || "");
  let subject = input.subject.trim() || "(no subject)";
  let text = clip(input.text);
  let thread = input.threadId ? doc.threads.find((row) => row.id === input.threadId) : undefined;
  let copied: StoredAttachment[] = [];
  let inReplyTo: string | undefined;

  if (input.mode === "reply" || input.mode === "forward") {
    if (!thread) throw new Error("Thread not found.");
    const source =
      thread.messages.find((m) => m.id === input.messageId) ??
      [...thread.messages].reverse().find((m) => m.direction !== "draft");
    if (input.mode === "forward" && source) {
      copied = source.attachments.filter((file) => file.contentBase64);
      if (!input.subject.trim()) subject = source.subject.toLowerCase().startsWith("fwd:") ? source.subject : `Fwd: ${source.subject}`;
      if (!input.text.trim()) text = quotedForward(source);
    }
    if (input.mode === "reply" && source) {
      inReplyTo = source.messageId;
      if (!input.subject.trim()) {
        subject = source.subject.toLowerCase().startsWith("re:") ? source.subject : `Re: ${source.subject}`;
      }
    }
  }

  if (!thread) {
    thread = {
      id: randomUUID(),
      subject,
      folder: "sent",
      unread: false,
      participants: [],
      preview: "",
      createdAt: now,
      updatedAt: now,
      messages: [],
    };
    const client = to[0] ? await rememberClient(to[0]) : null;
    if (client) {
      thread.clientId = client.id;
      thread.clientName = client.name;
    }
    doc.threads.unshift(thread);
  }

  const draft = input.draftMessageId
    ? thread.messages.find((m) => m.id === input.draftMessageId && m.direction === "draft")
    : undefined;
  const message: StoredMessage = draft ?? {
    id: randomUUID(),
    direction: "out",
    from: fromHeaderFallback(),
    to,
    cc,
    subject,
    text,
    createdAt: now,
    attachments: [],
  };
  message.to = to;
  message.cc = cc;
  message.subject = subject;
  message.text = text;
  message.createdAt = now;
  message.inReplyTo = inReplyTo;
  if (input.attachments?.length) message.attachments = takeAttachments(input.attachments, copied);
  else if (!draft) message.attachments = copied;
  if (!draft) thread.messages.push(message);

  const result = await deliverMessage(thread, message, `mailbox/${message.id}`);
  if (!result.sent && thread.folder !== "inbox" && thread.folder !== "archive") {
    thread.folder = "drafts";
  }
  thread.subject = thread.subject || subject;
  thread.unread = false;
  touch(thread, message);
  await writeDoc(doc);
  const detail = await getMailboxThread(thread.id);
  if (!detail) throw new Error("Could not save the message.");
  return { thread: detail, sent: result.sent, error: result.error };
}

export async function recordSiteForm(input: {
  kind: "contact" | "intake" | "booking" | "subscribe" | "invoice";
  sourceId: string;
  name: string;
  email?: string;
  phone?: string;
  subject: string;
  text: string;
  clientId?: string;
  confirmationSubject?: string;
  /** The caller sends its own confirmation, for example a booking with a calendar file. */
  skipConfirmation?: boolean;
}): Promise<{ threadId: string; emailed: boolean }> {
  const doc = await readDoc();
  const now = new Date().toISOString();
  const email = input.email && isValidEmail(input.email) ? normalizeEmail(input.email) : "";
  const client = email ? await rememberClient(email, input.name, input.phone) : null;
  const text = clip(input.text);
  const inbound: StoredMessage = {
    id: randomUUID(),
    direction: "in",
    from: email || input.name || "website",
    to: [fromAddress() || siteConfig.email],
    cc: [],
    subject: input.subject,
    text,
    createdAt: now,
    attachments: [],
  };
  const thread: StoredThread = {
    id: randomUUID(),
    subject: input.subject,
    folder: "inbox",
    unread: true,
    participants: email ? [email] : [],
    preview: previewFrom(text),
    createdAt: now,
    updatedAt: now,
    clientId: input.clientId || client?.id,
    clientName: input.name || client?.name,
    leadId: `${input.kind}:${input.sourceId}`,
    leadKind: input.kind,
    messages: [inbound],
  };
  doc.threads.unshift(thread);

  let emailed = false;
  if (email && isMailboxConfigured() && !input.skipConfirmation) {
    const note = brandedEmail({
      heading: input.confirmationSubject || `We received your message`,
      greeting: `Hi ${input.name || "there"},`,
      bodyText: `Thanks for contacting ${siteConfig.brand.name}. We have your note and will reply within 1–2 business days (Nairobi time).\n\n${text}`,
    });
    const outbound: StoredMessage = {
      id: randomUUID(),
      direction: "out",
      from: fromHeaderFallback(),
      to: [email],
      cc: [],
      subject: input.confirmationSubject || `We received your message — ${siteConfig.brand.name}`,
      text: note.text,
      createdAt: now,
      attachments: [],
      inReplyTo: undefined,
    };
    const domain = messageDomain();
    outbound.messageId = `<${outbound.id}@${domain}>`;
    const result = await sendResendEmail({
      to: email,
      subject: outbound.subject,
      html: note.html,
      text: note.text,
      headers: { "Message-ID": outbound.messageId },
      idempotencyKey: `form-confirmation/${input.kind}/${input.sourceId}`,
    });
    if (result.sent) {
      outbound.resendId = result.id;
      thread.messages.push(outbound);
      emailed = true;
    }
  }

  await writeDoc(doc);
  return { threadId: thread.id, emailed };
}

function headerValue(headers: Record<string, string> | null | undefined, name: string): string {
  if (!headers) return "";
  const key = Object.keys(headers).find((item) => item.toLowerCase() === name.toLowerCase());
  return key ? String(headers[key] || "") : "";
}

function findByReference(threads: StoredThread[], references: string[]): StoredThread | undefined {
  const wanted = new Set(references.map((item) => item.trim()).filter(Boolean));
  if (!wanted.size) return undefined;
  return threads.find((thread) =>
    thread.messages.some(
      (message) =>
        (message.messageId && wanted.has(message.messageId)) ||
        (message.resendId && wanted.has(message.resendId))
    )
  );
}

export async function ingestInboundEmail(input: {
  emailId: string;
  messageId?: string;
  from: string;
  to: string[];
  cc?: string[];
  subject: string;
  text?: string;
  html?: string;
  headers?: Record<string, string> | null;
  attachments?: { id?: string; filename?: string | null; contentType?: string; size?: number; contentBase64?: string }[];
}): Promise<{ duplicate: boolean; threadId: string }> {
  if (await hasResendMessage(input.emailId)) {
    const existing = await readDoc();
    const thread = existing.threads.find((row) => row.messages.some((message) => message.resendId === input.emailId));
    return { duplicate: true, threadId: thread?.id || "" };
  }
  const doc = await readDoc();
  if (doc.threads.some((thread) => thread.messages.some((message) => message.resendId === input.emailId))) {
    const existing = doc.threads.find((thread) => thread.messages.some((message) => message.resendId === input.emailId));
    return { duplicate: true, threadId: existing?.id || "" };
  }

  const references = [
    headerValue(input.headers, "in-reply-to"),
    headerValue(input.headers, "references"),
    input.messageId || "",
  ]
    .join(" ")
    .split(/\s+/)
    .map((item) => item.trim())
    .filter(Boolean);

  const fromEmail = extractEmail(input.from) || input.from;
  let thread =
    findByReference(doc.threads, references) ||
    doc.threads.find((row) => {
      if (row.folder === "archive") return false;
      const sameSubject = normalizeSubject(row.subject) === normalizeSubject(input.subject || "");
      const known = row.participants.includes(fromEmail) || row.messages.some((m) => extractEmail(m.from) === fromEmail);
      return sameSubject && known && Boolean(input.subject);
    });

  const html = input.html ? sanitizeEmailHtml(input.html) : "";
  const text = clip(input.text?.trim() || (html ? htmlToText(html) : "") || "(no message body)");
  const rfcMessageId = headerValue(input.headers, "message-id") || input.messageId || "";
  const inboundReferences = headerValue(input.headers, "references");
  const now = new Date().toISOString();
  const attachments: StoredAttachment[] = [];
  for (const file of input.attachments ?? []) {
    if (attachments.length >= MAX_ATTACHMENTS) break;
    const contentBase64 = file.contentBase64?.replace(/^data:[^;]+;base64,/, "");
    const size = file.size || (contentBase64 ? Buffer.from(contentBase64, "base64").length : 0);
    if (size > MAX_ATTACHMENT_BYTES) {
      attachments.push({
        id: file.id || randomUUID(),
        filename: safeName(file.filename || "attachment"),
        contentType: file.contentType || "application/octet-stream",
        size,
      });
      continue;
    }
    attachments.push({
      id: file.id || randomUUID(),
      filename: safeName(file.filename || "attachment"),
      contentType: file.contentType || "application/octet-stream",
      size,
      ...(contentBase64 ? { contentBase64 } : {}),
    });
  }

  const message: StoredMessage = {
    id: randomUUID(),
    direction: "in",
    from: input.from,
    to: input.to,
    cc: input.cc ?? [],
    subject: input.subject || "(no subject)",
    text,
    ...(html ? { html } : {}),
    createdAt: now,
    resendId: input.emailId,
    ...(rfcMessageId ? { messageId: rfcMessageId } : {}),
    ...(references[0] ? { inReplyTo: references[0] } : {}),
    ...(inboundReferences ? { references: inboundReferences } : {}),
    attachments,
  };

  if (!thread) {
    const client = fromEmail && isValidEmail(fromEmail) ? await findClientByEmail(fromEmail) : null;
    thread = {
      id: randomUUID(),
      subject: message.subject,
      folder: "inbox",
      unread: true,
      participants: fromEmail && isValidEmail(fromEmail) ? [fromEmail] : [],
      preview: previewFrom(text),
      createdAt: now,
      updatedAt: now,
      ...(client ? { clientId: client.id, clientName: client.name } : {}),
      messages: [],
    };
    doc.threads.unshift(thread);
  }

  thread.folder = thread.folder === "archive" ? "archive" : "inbox";
  thread.unread = true;
  thread.messages.push(message);
  touch(thread, message);
  if (!thread.clientId && fromEmail && isValidEmail(fromEmail)) {
    const client = await findClientByEmail(fromEmail);
    if (client) {
      thread.clientId = client.id;
      thread.clientName = client.name;
    }
  }
  const insight = await describeInboundMail({ from: message.from, subject: message.subject, text });
  if (insight) {
    if (insight.summary) thread.summary = insight.summary;
    if (insight.suggestedReply) thread.suggestedReply = insight.suggestedReply;
    thread.tags = insight.tags;
  }
  const linked = await linksFor(thread);
  const lead = linked.leads[0];
  if (lead) {
    thread.leadId = lead.id;
    thread.leadKind = lead.kind;
  } else if (insight?.isLead) {
    thread.tags = [...new Set([...(thread.tags || []), "lead"])];
  }
  try {
    await writeDoc(doc);
  } catch (error) {
    const messageText = error instanceof Error ? error.message : "";
    if (/mail_messages_resend_id_idx|duplicate key/i.test(messageText)) {
      return { duplicate: true, threadId: thread.id };
    }
    throw error;
  }
  return { duplicate: false, threadId: thread.id };
}

export async function readMailboxAttachment(
  threadId: string,
  messageId: string,
  attachmentId: string
): Promise<StoredAttachment | null> {
  const doc = await readDoc();
  const thread = doc.threads.find((row) => row.id === threadId);
  const message = thread?.messages.find((row) => row.id === messageId);
  const file = message?.attachments.find((row) => row.id === attachmentId);
  if (!file?.contentBase64) return null;
  return file;
}
