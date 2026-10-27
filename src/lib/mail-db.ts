import { ensureSchema, readDocument, usesPostgres, getPool } from "@/lib/pg";
import { readJsonFile, writeJsonFile } from "@/lib/storage";

const FILE = "mailbox.json";
const LOCK = 742211;

export type PersistedAttachment = {
  id: string;
  filename: string;
  contentType: string;
  size: number;
  contentBase64?: string;
};

export type PersistedMessage = {
  id: string;
  direction: "in" | "out" | "draft";
  from: string;
  to: string[];
  cc: string[];
  subject: string;
  text: string;
  html?: string;
  createdAt: string;
  resendId?: string;
  messageId?: string;
  inReplyTo?: string;
  references?: string;
  attachments: PersistedAttachment[];
};

export type PersistedThread = {
  id: string;
  subject: string;
  folder: string;
  unread: boolean;
  participants: string[];
  preview: string;
  createdAt: string;
  updatedAt: string;
  clientId?: string;
  clientName?: string;
  leadId?: string;
  leadKind?: string;
  summary?: string;
  suggestedReply?: string;
  tags?: string[];
  /** hello | support | billing | admin. Older rows are filled in on read. */
  mailbox?: string;
  starred?: boolean;
  /** Where a trashed thread came from, for Restore. */
  previousFolder?: string;
  messages: PersistedMessage[];
};

export type PersistedMailbox = { threads: PersistedThread[] };

function emptyDoc(): PersistedMailbox {
  return { threads: [] };
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map((item) => String(item)) : [];
}

function asDoc(value: unknown): PersistedMailbox {
  if (!value || typeof value !== "object" || !Array.isArray((value as PersistedMailbox).threads)) return emptyDoc();
  return value as PersistedMailbox;
}

type ThreadRow = {
  id: string;
  subject: string;
  folder: string;
  unread: boolean;
  participants: unknown;
  preview: string;
  created_at: Date | string;
  updated_at: Date | string;
  client_id: string | null;
  client_name: string | null;
  lead_id: string | null;
  lead_kind: string | null;
  summary: string | null;
  suggested_reply: string | null;
  tags: unknown;
  mailbox?: string | null;
  starred?: boolean | null;
  previous_folder?: string | null;
};

type MessageRow = {
  id: string;
  thread_id: string;
  direction: string;
  from_address: string;
  to_addresses: unknown;
  cc_addresses: unknown;
  subject: string;
  body_text: string;
  body_html: string | null;
  created_at: Date | string;
  resend_id: string | null;
  message_id: string | null;
  in_reply_to: string | null;
  references_header: string | null;
  attachments: unknown;
};

function iso(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function messageFromRow(row: MessageRow): PersistedMessage {
  const direction = row.direction === "out" || row.direction === "draft" ? row.direction : "in";
  const attachments = Array.isArray(row.attachments) ? (row.attachments as PersistedAttachment[]) : [];
  return {
    id: row.id,
    direction,
    from: row.from_address,
    to: asStringArray(row.to_addresses),
    cc: asStringArray(row.cc_addresses),
    subject: row.subject,
    text: row.body_text,
    ...(row.body_html ? { html: row.body_html } : {}),
    createdAt: iso(row.created_at),
    ...(row.resend_id ? { resendId: row.resend_id } : {}),
    ...(row.message_id ? { messageId: row.message_id } : {}),
    ...(row.in_reply_to ? { inReplyTo: row.in_reply_to } : {}),
    ...(row.references_header ? { references: row.references_header } : {}),
    attachments,
  };
}

async function loadPostgres(): Promise<PersistedMailbox> {
  await ensureSchema();
  const pool = getPool();
  const existing = await pool.query<{ count: string }>("SELECT count(*)::text AS count FROM mail_threads");
  if (Number(existing.rows[0]?.count || 0) === 0) {
    const legacy = asDoc(await readDocument(FILE));
    if (legacy.threads.length) await savePostgres(legacy);
  }
  const threads = await pool.query<ThreadRow>("SELECT * FROM mail_threads ORDER BY updated_at DESC");
  const messages = await pool.query<MessageRow>("SELECT * FROM mail_messages ORDER BY created_at ASC");
  const byThread = new Map<string, PersistedMessage[]>();
  for (const row of messages.rows) {
    const list = byThread.get(row.thread_id) || [];
    list.push(messageFromRow(row));
    byThread.set(row.thread_id, list);
  }
  return {
    threads: threads.rows.map((row) => ({
      id: row.id,
      subject: row.subject,
      folder: row.folder,
      unread: row.unread,
      participants: asStringArray(row.participants),
      preview: row.preview,
      createdAt: iso(row.created_at),
      updatedAt: iso(row.updated_at),
      ...(row.client_id ? { clientId: row.client_id } : {}),
      ...(row.client_name ? { clientName: row.client_name } : {}),
      ...(row.lead_id ? { leadId: row.lead_id } : {}),
      ...(row.lead_kind ? { leadKind: row.lead_kind } : {}),
      ...(row.summary ? { summary: row.summary } : {}),
      ...(row.suggested_reply ? { suggestedReply: row.suggested_reply } : {}),
      ...(Array.isArray(row.tags) && row.tags.length ? { tags: asStringArray(row.tags) } : {}),
      ...(row.mailbox ? { mailbox: row.mailbox } : {}),
      ...(row.starred ? { starred: true } : {}),
      ...(row.previous_folder ? { previousFolder: row.previous_folder } : {}),
      messages: byThread.get(row.id) || [],
    })),
  };
}

async function savePostgres(doc: PersistedMailbox): Promise<void> {
  await ensureSchema();
  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock($1)", [LOCK]);
    const threadIds = doc.threads.map((thread) => thread.id);
    const messageIds = doc.threads.flatMap((thread) => thread.messages.map((message) => message.id));
    if (messageIds.length) {
      await client.query("DELETE FROM mail_messages WHERE NOT (id = ANY($1::text[]))", [messageIds]);
    } else {
      await client.query("DELETE FROM mail_messages");
    }
    if (threadIds.length) {
      await client.query("DELETE FROM mail_threads WHERE NOT (id = ANY($1::text[]))", [threadIds]);
    } else {
      await client.query("DELETE FROM mail_threads");
    }
    for (const thread of doc.threads) {
      await client.query(
        `INSERT INTO mail_threads (
           id, subject, folder, unread, participants, preview, created_at, updated_at,
           client_id, client_name, lead_id, lead_kind, summary, suggested_reply, tags,
           mailbox, starred, previous_folder
         ) VALUES (
           $1,$2,$3,$4,$5::jsonb,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15::jsonb,$16,$17,$18
         )
         ON CONFLICT (id) DO UPDATE SET
           subject = EXCLUDED.subject,
           folder = EXCLUDED.folder,
           unread = EXCLUDED.unread,
           participants = EXCLUDED.participants,
           preview = EXCLUDED.preview,
           created_at = EXCLUDED.created_at,
           updated_at = EXCLUDED.updated_at,
           client_id = EXCLUDED.client_id,
           client_name = EXCLUDED.client_name,
           lead_id = EXCLUDED.lead_id,
           lead_kind = EXCLUDED.lead_kind,
           summary = EXCLUDED.summary,
           suggested_reply = EXCLUDED.suggested_reply,
           tags = EXCLUDED.tags,
           mailbox = EXCLUDED.mailbox,
           starred = EXCLUDED.starred,
           previous_folder = EXCLUDED.previous_folder`,
        [
          thread.id,
          thread.subject,
          thread.folder,
          thread.unread,
          JSON.stringify(thread.participants),
          thread.preview,
          thread.createdAt,
          thread.updatedAt,
          thread.clientId ?? null,
          thread.clientName ?? null,
          thread.leadId ?? null,
          thread.leadKind ?? null,
          thread.summary ?? null,
          thread.suggestedReply ?? null,
          JSON.stringify(thread.tags ?? []),
          thread.mailbox ?? null,
          Boolean(thread.starred),
          thread.previousFolder ?? null,
        ]
      );
      for (const message of thread.messages) {
        await client.query(
          `INSERT INTO mail_messages (
             id, thread_id, direction, from_address, to_addresses, cc_addresses, subject,
             body_text, body_html, created_at, resend_id, message_id, in_reply_to, references_header, attachments
           ) VALUES (
             $1,$2,$3,$4,$5::jsonb,$6::jsonb,$7,$8,$9,$10,$11,$12,$13,$14,$15::jsonb
           )
           ON CONFLICT (id) DO UPDATE SET
             thread_id = EXCLUDED.thread_id,
             direction = EXCLUDED.direction,
             from_address = EXCLUDED.from_address,
             to_addresses = EXCLUDED.to_addresses,
             cc_addresses = EXCLUDED.cc_addresses,
             subject = EXCLUDED.subject,
             body_text = EXCLUDED.body_text,
             body_html = EXCLUDED.body_html,
             created_at = EXCLUDED.created_at,
             resend_id = EXCLUDED.resend_id,
             message_id = EXCLUDED.message_id,
             in_reply_to = EXCLUDED.in_reply_to,
             references_header = EXCLUDED.references_header,
             attachments = EXCLUDED.attachments`,
          [
            message.id,
            thread.id,
            message.direction,
            message.from,
            JSON.stringify(message.to),
            JSON.stringify(message.cc),
            message.subject,
            message.text,
            message.html ?? null,
            message.createdAt,
            message.resendId ?? null,
            message.messageId ?? null,
            message.inReplyTo ?? null,
            message.references ?? null,
            JSON.stringify(message.attachments),
          ]
        );
      }
    }
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function loadMailbox(): Promise<PersistedMailbox> {
  if (!usesPostgres()) {
    const doc = await readJsonFile<PersistedMailbox>(FILE, emptyDoc());
    return asDoc(doc);
  }
  return loadPostgres();
}

export async function saveMailbox(doc: PersistedMailbox): Promise<void> {
  if (!usesPostgres()) {
    await writeJsonFile(FILE, doc);
    return;
  }
  await savePostgres(doc);
}

export async function hasResendMessage(emailId: string): Promise<boolean> {
  if (!emailId || !usesPostgres()) return false;
  await ensureSchema();
  const result = await getPool().query("SELECT 1 FROM mail_messages WHERE resend_id = $1 LIMIT 1", [emailId]);
  return (result.rowCount ?? 0) > 0;
}
