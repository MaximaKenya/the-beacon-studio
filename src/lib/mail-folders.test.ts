import assert from "node:assert/strict";
import test from "node:test";
import { classifyInbound, mailboxAddress, mailboxForPurpose, notifyAddressFor, senderFor } from "@/lib/mail-addresses";
import {
  canDeleteForever,
  folderCounts,
  migrateThread,
  moveThread,
  restoreThread,
  threadInFolder,
  type FolderThread,
} from "@/lib/mail-folders";

const D = "thebeaconstudio.co.ke";

function thread(partial: Partial<FolderThread> & { messages: FolderThread["messages"] }): FolderThread {
  return { folder: "inbox", unread: false, ...partial };
}

test("each purpose sends from its mailbox, replies return there", () => {
  assert.equal(senderFor("invoice").address, `billing@${D}`);
  assert.equal(senderFor("invoice").replyTo, `billing@${D}`);
  assert.equal(senderFor("portal").address, `support@${D}`);
  assert.equal(senderFor("leadAlert").address, `admin@${D}`);
  assert.equal(senderFor("contact").address, `hello@${D}`);
  assert.equal(mailboxForPurpose("trialEnded"), "billing");
  assert.match(senderFor("receipt").header, /The Beacon Studio <billing@/);
});

test("env overrides change one mailbox only", () => {
  const env = { MAIL_BILLING: "Accounts <accounts@example.com>" };
  assert.equal(mailboxAddress("billing", env), "accounts@example.com");
  assert.equal(mailboxAddress("hello", env), `hello@${D}`);
  assert.equal(mailboxAddress("support", { MAIL_SUPPORT: "not an email" }), `support@${D}`);
});

test("admin alerts go to ADMIN_EMAIL when set", () => {
  const before = process.env.ADMIN_EMAIL;
  process.env.ADMIN_EMAIL = "owner@example.com";
  try {
    assert.equal(notifyAddressFor("leadAlert"), "owner@example.com");
  } finally {
    if (before === undefined) delete process.env.ADMIN_EMAIL;
    else process.env.ADMIN_EMAIL = before;
  }
});

test("inbound mail is classified by its To address", () => {
  assert.equal(classifyInbound([`Billing <billing@${D}>`], []), "billing");
  assert.equal(classifyInbound(["someone@else.com"], [`support@${D}`]), "support");
  assert.equal(classifyInbound([`random@${D}`], []), "hello");
  assert.equal(classifyInbound([], []), "hello");
});

test("old threads migrate onto mailbox + folder", () => {
  const old = migrateThread(
    thread({ folder: "weird", messages: [{ direction: "in", from: "c@x.com", to: [`billing@${D}`], cc: [] }] })
  );
  assert.equal(old.folder, "inbox");
  assert.equal(old.mailbox, "billing");
  assert.equal(old.starred, false);
  const sent = migrateThread(thread({ folder: "sent", messages: [{ direction: "out", from: `support@${D}`, to: ["c@x.com"], cc: [] }] }));
  assert.equal(sent.mailbox, "support");
  assert.equal(sent.folder, "sent");
});

test("folder views, trash restore and permanent delete", () => {
  const t = thread({ unread: true, mailbox: "hello", messages: [{ direction: "in", from: "c@x.com", to: [`hello@${D}`], cc: [] }] });
  assert.ok(threadInFolder(t, "inbox"));
  assert.ok(threadInFolder(t, "unread"));
  t.starred = true;
  assert.ok(threadInFolder(t, "starred"));
  assert.equal(canDeleteForever(t), false);
  moveThread(t, "trash");
  assert.ok(threadInFolder(t, "trash"));
  assert.ok(!threadInFolder(t, "inbox"));
  assert.ok(!threadInFolder(t, "unread"));
  assert.ok(!threadInFolder(t, "starred"));
  assert.ok(canDeleteForever(t));
  restoreThread(t);
  assert.equal(t.folder, "inbox");

  const draft = thread({ folder: "drafts", mailbox: "billing", messages: [{ direction: "draft", from: `billing@${D}`, to: [], cc: [] }] });
  assert.ok(threadInFolder(draft, "drafts"));
  assert.ok(!threadInFolder(draft, "sent"));
  moveThread(draft, "archive");
  moveThread(draft, "trash");
  restoreThread(draft);
  assert.equal(draft.folder, "archive");

  const counts = folderCounts([t, draft], "hello");
  assert.equal(counts.inbox, 1);
  assert.equal(counts.archive, 0);
  assert.equal(folderCounts([t, draft], "billing").archive, 1);
});
