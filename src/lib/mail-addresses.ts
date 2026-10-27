/**
 * The studio's built-in mailboxes. There are no real mailboxes: Resend inbound
 * delivers mail for the domain, and each thread is labelled by which of these
 * addresses it was sent to (or sent from).
 */
export const MAIL_DOMAIN = "thebeaconstudio.co.ke";

export const MAILBOX_IDS = ["hello", "support", "billing", "admin"] as const;
export type MailboxId = (typeof MAILBOX_IDS)[number];

export const MAILBOX_LABELS: Record<MailboxId, string> = {
  hello: "Hello",
  support: "Support",
  billing: "Billing",
  admin: "Admin",
};

export function mailboxAddress(id: MailboxId): string {
  return `${id}@${MAIL_DOMAIN}`;
}

export function isMailboxId(value: unknown): value is MailboxId {
  return typeof value === "string" && (MAILBOX_IDS as readonly string[]).includes(value);
}

function bare(value: string): string {
  const match = value.match(/<([^>]+)>/);
  return (match ? match[1] : value).trim().toLowerCase();
}

/** Which studio mailbox an address belongs to. Plus-tags (inbox+slug@) count as hello. */
export function mailboxOfAddress(value: string): MailboxId | null {
  const email = bare(value);
  const [local, domain] = email.split("@");
  if (!local || domain !== MAIL_DOMAIN) return null;
  const base = local.split("+")[0];
  if (isMailboxId(base)) return base;
  return "hello";
}

/** All studio mailboxes touched by a set of messages. Inbound: to/cc. Outbound: from. */
export function mailboxesOf(messages: { direction: string; from: string; to: string[]; cc: string[] }[]): MailboxId[] {
  const found = new Set<MailboxId>();
  for (const message of messages) {
    const addresses = message.direction === "in" ? [...message.to, ...message.cc] : [message.from];
    for (const address of addresses) {
      const id = mailboxOfAddress(address);
      if (id) found.add(id);
    }
  }
  if (!found.size) found.add("hello");
  return MAILBOX_IDS.filter((id) => found.has(id));
}

/** The From header for a chosen mailbox. Unknown choices fall back to hello. */
export function fromHeaderFor(choice: unknown, brand = "The Beacon Studio"): { address: string; header: string } {
  const id: MailboxId = isMailboxId(choice) ? choice : "hello";
  const address = mailboxAddress(id);
  return { address, header: `${brand} <${address}>` };
}
