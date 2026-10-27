/**
 * Per-mailbox folders. A thread is filed under exactly one mailbox (hello,
 * support, billing, admin) and has one stored location; Unread, Starred,
 * Sent and Drafts are views across locations.
 */
import { MAILBOX_IDS, classifyInbound, isMailboxId, mailboxOfAddress, mailboxesOf, type MailboxId } from "@/lib/mail-addresses";

export const MAIL_FOLDERS = ["inbox", "unread", "starred", "sent", "drafts", "archive", "spam", "trash"] as const;
export type MailFolderId = (typeof MAIL_FOLDERS)[number];

/** Where a thread actually lives. */
export const STORED_FOLDERS = ["inbox", "sent", "drafts", "archive", "spam", "trash"] as const;
export type StoredFolder = (typeof STORED_FOLDERS)[number];

/** Folders a thread can be moved to by hand. */
export const MOVE_TARGETS = ["inbox", "archive", "spam", "trash"] as const;
export type MoveTarget = (typeof MOVE_TARGETS)[number];

export const FOLDER_LABELS: Record<MailFolderId, string> = {
  inbox: "Inbox",
  unread: "Unread",
  starred: "Starred",
  sent: "Sent",
  drafts: "Drafts",
  archive: "Archive",
  spam: "Spam",
  trash: "Trash",
};

export function isMailFolder(value: unknown): value is MailFolderId {
  return typeof value === "string" && (MAIL_FOLDERS as readonly string[]).includes(value);
}

export function isMoveTarget(value: unknown): value is MoveTarget {
  return typeof value === "string" && (MOVE_TARGETS as readonly string[]).includes(value);
}

export function asStoredFolder(value: unknown): StoredFolder {
  return typeof value === "string" && (STORED_FOLDERS as readonly string[]).includes(value) ? (value as StoredFolder) : "inbox";
}

export type FolderThread = {
  folder: string;
  unread: boolean;
  starred?: boolean;
  mailbox?: string;
  previousFolder?: string;
  messages: { direction: string; from: string; to: string[]; cc: string[] }[];
};

/** The mailbox a thread belongs to: first inbound To address, else the first sender. */
export function primaryMailbox(thread: Pick<FolderThread, "messages" | "mailbox">): MailboxId {
  if (isMailboxId(thread.mailbox)) return thread.mailbox;
  const inbound = thread.messages.find((m) => m.direction === "in");
  if (inbound) return classifyInbound(inbound.to, inbound.cc);
  for (const message of thread.messages) {
    const id = mailboxOfAddress(message.from);
    if (id) return id;
  }
  return mailboxesOf(thread.messages)[0] || "hello";
}

/**
 * Bring an older thread (PR #37 labels: folder inbox/sent/drafts/archive and
 * mailboxes derived from addresses) onto mailbox + folder. Idempotent.
 */
export function migrateThread<T extends FolderThread>(thread: T): T {
  thread.folder = asStoredFolder(thread.folder);
  thread.mailbox = primaryMailbox(thread);
  thread.starred = Boolean(thread.starred);
  return thread;
}

function live(thread: FolderThread): boolean {
  return thread.folder !== "trash" && thread.folder !== "spam";
}

export function threadInFolder(thread: FolderThread, folder: MailFolderId): boolean {
  switch (folder) {
    case "inbox":
      return thread.folder === "inbox";
    case "unread":
      return thread.unread && live(thread);
    case "starred":
      return Boolean(thread.starred) && live(thread);
    case "drafts":
      return live(thread) && thread.folder !== "archive" && (thread.folder === "drafts" || thread.messages.some((m) => m.direction === "draft"));
    case "sent":
      return live(thread) && thread.folder !== "drafts" && thread.messages.some((m) => m.direction === "out");
    case "archive":
    case "spam":
    case "trash":
      return thread.folder === folder;
  }
}

export function inMailbox(thread: FolderThread, mailbox: string | undefined): boolean {
  if (!isMailboxId(mailbox)) return true;
  return primaryMailbox(thread) === mailbox;
}

export type FolderCounts = Record<MailFolderId, number>;

export function folderCounts(threads: FolderThread[], mailbox?: string): FolderCounts {
  const scoped = threads.filter((t) => inMailbox(t, mailbox));
  return Object.fromEntries(MAIL_FOLDERS.map((f) => [f, scoped.filter((t) => threadInFolder(t, f)).length])) as FolderCounts;
}

export function countsByMailbox(threads: FolderThread[]): Record<MailboxId, FolderCounts> {
  return Object.fromEntries(MAILBOX_IDS.map((id) => [id, folderCounts(threads, id)])) as Record<MailboxId, FolderCounts>;
}

/** Move a thread. Trash remembers where it came from so Restore can put it back. */
export function moveThread(thread: FolderThread, target: MoveTarget): void {
  const from = asStoredFolder(thread.folder);
  if (target === "trash" && from !== "trash") thread.previousFolder = from;
  if (target !== "trash") delete thread.previousFolder;
  thread.folder = target;
  if (target === "spam" || target === "trash" || target === "archive") thread.unread = false;
}

/** Restore from Trash (or Spam) to where it was, or the natural home. */
export function restoreThread(thread: FolderThread): void {
  const back = thread.previousFolder ? asStoredFolder(thread.previousFolder) : null;
  delete thread.previousFolder;
  if (back && back !== "trash") {
    thread.folder = back;
    return;
  }
  const hasInbound = thread.messages.some((m) => m.direction === "in");
  const onlyDrafts = thread.messages.length > 0 && thread.messages.every((m) => m.direction === "draft");
  thread.folder = hasInbound ? "inbox" : onlyDrafts ? "drafts" : "sent";
}

/** Permanent delete is only allowed from Trash. */
export function canDeleteForever(thread: Pick<FolderThread, "folder">): boolean {
  return thread.folder === "trash";
}
