export type MailFolder = "inbox" | "sent" | "drafts" | "archive";

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
};

export type MailThreadDetail = MailThreadSummary & {
  clientId?: string;
  messages: MailMessageView[];
  links: {
    client: MailClientLink | null;
    leads: MailLeadLink[];
  };
};

export type MailboxCounts = Record<MailFolder, number> & { unread: number };

export type MailboxListResponse = {
  configured: boolean;
  counts: MailboxCounts;
  threads: MailThreadSummary[];
  threadId?: string | null;
};
