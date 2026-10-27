import type { FolderCounts, MailFolderId } from "@/lib/mail-folders";

export type MailFolder = MailFolderId;

export type MailAttachmentView = {
  id: string;
  filename: string;
  contentType: string;
  size: number;
  stored: boolean;
};

export type MailMessageView = {
  id: string;
  direction: "in" | "out" | "draft";
  from: string;
  to: string[];
  cc: string[];
  subject: string;
  text: string;
  html?: string;
  createdAt: string;
  attachments: MailAttachmentView[];
  /** Remote images removed from html until the reader loads them. */
  remoteImagesBlocked?: number;
};

export type MailLeadLink = {
  id: string;
  kind: string;
  name: string;
  email: string;
  summary: string;
};

export type MailClientLink = {
  id: string;
  name: string;
  email: string;
};

export type MailThreadSummary = {
  id: string;
  subject: string;
  folder: MailFolder;
  unread: boolean;
  participants: string[];
  preview: string;
  updatedAt: string;
  clientName?: string;
  leadId?: string;
  leadKind?: string;
  summary?: string;
  suggestedReply?: string;
  tags?: string[];
  messageCount: number;
  /** Studio mailboxes this thread touches (hello, support, billing, admin). */
  mailboxes?: string[];
  /** The one mailbox tab this thread is filed under. */
  mailbox?: string;
  starred?: boolean;
};

export type MailThreadDetail = MailThreadSummary & {
  clientId?: string;
  messages: MailMessageView[];
  links: {
    client: MailClientLink | null;
    leads: MailLeadLink[];
  };
};

export type MailboxCounts = FolderCounts & {
  /** Unread threads per studio mailbox. */
  byMailbox?: Record<string, number>;
  /** Folder counts for every mailbox tab. */
  perMailbox?: Record<string, FolderCounts>;
};

export type MailboxListResponse = {
  configured: boolean;
  counts: MailboxCounts;
  threads: MailThreadSummary[];
  threadId?: string | null;
};
