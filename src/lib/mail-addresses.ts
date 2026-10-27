/**
 * The studio's four mailboxes and what each one is for. This is the single
 * place that decides which address sends (and receives replies for) every
 * kind of email the app produces. Resend inbound delivers mail for the domain
 * and each thread is filed under the mailbox it was sent to.
 *
 * Env overrides (optional, bare address or "Name <address>"):
 *   MAIL_HELLO, MAIL_SUPPORT, MAIL_BILLING, MAIL_ADMIN
 * ADMIN_EMAIL, when set, is where internal alerts are delivered (it may be a
 * personal inbox); the sender stays admin@.
 */
export const MAIL_DOMAIN = "thebeaconstudio.co.ke";
export const MAIL_BRAND = "The Beacon Studio";

export const MAILBOX_IDS = ["hello", "support", "billing", "admin"] as const;
export type MailboxId = (typeof MAILBOX_IDS)[number];

export const MAILBOX_LABELS: Record<MailboxId, string> = {
  hello: "Hello",
  support: "Support",
  billing: "Billing",
  admin: "Admin",
};

/** Short "what this mailbox is for" hint shown in each tab. */
export const MAILBOX_HINTS: Record<MailboxId, string> = {
  hello: "Public contact form, general enquiries, welcome and onboarding, trial nurture emails and their replies.",
  support: "Client portal help and sign-in, automation failure and alert notices, support ticket replies.",
  billing: "Invoices, receipts, Paystack payment, trial-ended and renewal notices, care-plan invoices.",
  admin: "System and security alerts, new lead and signup notifications, daily digest and health notices.",
};

/** Every purpose the app sends mail for, mapped to its mailbox. */
export const MAIL_PURPOSES = {
  contact: "hello",
  enquiry: "hello",
  welcome: "hello",
  onboarding: "hello",
  nurture: "hello",
  booking: "hello",
  portal: "support",
  supportReply: "support",
  automationAlert: "support",
  invoice: "billing",
  receipt: "billing",
  payment: "billing",
  trialEnded: "billing",
  renewal: "billing",
  carePlanInvoice: "billing",
  securityAlert: "admin",
  leadAlert: "admin",
  signupAlert: "admin",
  digest: "admin",
  health: "admin",
} as const satisfies Record<string, MailboxId>;
export type MailPurpose = keyof typeof MAIL_PURPOSES;

const ENV_KEYS: Record<MailboxId, string> = {
  hello: "MAIL_HELLO",
  support: "MAIL_SUPPORT",
  billing: "MAIL_BILLING",
  admin: "MAIL_ADMIN",
};

function bare(value: string): string {
  const match = value.match(/<([^>]+)>/);
  return (match ? match[1] : value).trim().toLowerCase();
}

function envAddress(id: MailboxId, env: Record<string, string | undefined> = process.env): string {
  const raw = env[ENV_KEYS[id]]?.trim();
  if (!raw) return "";
  const email = bare(raw);
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : "";
}

export function mailboxAddress(id: MailboxId, env: Record<string, string | undefined> = process.env): string {
  return envAddress(id, env) || `${id}@${MAIL_DOMAIN}`;
}

export function isMailboxId(value: unknown): value is MailboxId {
  return typeof value === "string" && (MAILBOX_IDS as readonly string[]).includes(value);
}

export function mailboxForPurpose(purpose: MailPurpose): MailboxId {
  return MAIL_PURPOSES[purpose];
}

/** From header and Reply-To for a purpose. */
export function senderFor(purpose: MailPurpose, env: Record<string, string | undefined> = process.env): { mailbox: MailboxId; address: string; header: string; replyTo: string } {
  const mailbox = mailboxForPurpose(purpose);
  const address = mailboxAddress(mailbox, env);
  return { mailbox, address, header: `${MAIL_BRAND} <${address}>`, replyTo: address };
}

/** Where internal notices for a purpose are delivered. Admin alerts honour ADMIN_EMAIL. */
export function notifyAddressFor(purpose: MailPurpose, env: Record<string, string | undefined> = process.env): string {
  const mailbox = mailboxForPurpose(purpose);
  if (mailbox === "admin") {
    const override = env.ADMIN_EMAIL?.trim();
    if (override) return bare(override);
  }
  return mailboxAddress(mailbox, env);
}

/** Which studio mailbox an address belongs to. Plus-tags (inbox+slug@) count as hello. */
export function mailboxOfAddress(value: string, env: Record<string, string | undefined> = process.env): MailboxId | null {
  const email = bare(value);
  for (const id of MAILBOX_IDS) {
    if (envAddress(id, env) && envAddress(id, env) === email) return id;
  }
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

/**
 * Auto-classify an inbound message by its To address (then Cc). The first
 * studio address in To wins, so a mail to support@ cc hello@ files as support.
 */
export function classifyInbound(to: string[], cc: string[] = []): MailboxId {
  for (const address of [...to, ...cc]) {
    const id = mailboxOfAddress(address);
    if (id) return id;
  }
  return "hello";
}

/** The From header for a chosen mailbox. Unknown choices fall back to hello. */
export function fromHeaderFor(choice: unknown, brand = MAIL_BRAND): { address: string; header: string } {
  const id: MailboxId = isMailboxId(choice) ? choice : "hello";
  const address = mailboxAddress(id);
  return { address, header: `${brand} <${address}>` };
}
