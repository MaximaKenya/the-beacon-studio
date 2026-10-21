"use client";

import { useEffect, useMemo, useState } from "react";
import { Archive, Forward, Loader2, Mail, Paperclip, PenLine, Reply, Search, Send } from "lucide-react";
import { AdminToast, useAdminToast } from "@/components/admin/AdminToast";
import type {
  MailFolder,
  MailThreadDetail,
  MailThreadSummary,
  MailboxCounts,
  MailboxListResponse,
} from "@/lib/mailbox-types";
import { formatNairobi } from "@/lib/time";
import { parseResponseJson } from "@/lib/safe-json";

const FOLDERS: { id: MailFolder; label: string }[] = [
  { id: "inbox", label: "Inbox" },
  { id: "sent", label: "Sent" },
  { id: "drafts", label: "Drafts" },
  { id: "archive", label: "Archive" },
];

type LocalFile = { filename: string; contentType: string; contentBase64: string };

type Composer = {
  mode: "new" | "reply" | "forward";
  threadId?: string;
  messageId?: string;
  draftMessageId?: string;
  to: string;
  cc: string;
  subject: string;
  text: string;
  files: LocalFile[];
};

const emptyComposer = (): Composer => ({
  mode: "new",
  to: "",
  cc: "",
  subject: "",
  text: "",
  files: [],
});

async function fileToAttachment(file: File): Promise<LocalFile | null> {
  if (file.size > 1_200_000) return null;
  const bytes = new Uint8Array(await file.arrayBuffer());
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return {
    filename: file.name,
    contentType: file.type || "application/octet-stream",
    contentBase64: btoa(binary),
  };
}

export function AdminMailbox() {
  const [folder, setFolder] = useState<MailFolder>("inbox");
  const [query, setQuery] = useState("");
  const [threads, setThreads] = useState<MailThreadSummary[]>([]);
  const [counts, setCounts] = useState<MailboxCounts>({ inbox: 0, sent: 0, drafts: 0, archive: 0, unread: 0 });
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [selected, setSelected] = useState<MailThreadDetail | null>(null);
  const [composer, setComposer] = useState<Composer | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const { toast, flash } = useAdminToast();

  const visibleCounts = useMemo(() => counts, [counts]);

  async function loadList(nextFolder = folder, nextQuery = query) {
    const params = new URLSearchParams({ folder: nextFolder, q: nextQuery });
    const res = await fetch(`/api/admin/mailbox?${params.toString()}`);
    const data = await parseResponseJson<MailboxListResponse>(res, {
      configured: false,
      counts: { inbox: 0, sent: 0, drafts: 0, archive: 0, unread: 0 },
      threads: [],
    });
    setConfigured(Boolean(data.configured));
    setCounts(data.counts ?? { inbox: 0, sent: 0, drafts: 0, archive: 0, unread: 0 });
    setThreads(data.threads ?? []);
    setLoading(false);
    const unread = data.counts?.unread ?? 0;
    window.dispatchEvent(new CustomEvent("beacon-mail-unread", { detail: { unread } }));
  }

  async function openThread(id: string) {
    setComposer(null);
    setError(null);
    setNote(null);
    const res = await fetch(`/api/admin/mailbox?id=${encodeURIComponent(id)}`);
    const data = await parseResponseJson<{ thread?: MailThreadDetail; configured?: boolean }>(res, {});
    if (data.thread) {
      setSelected(data.thread);
      if (typeof data.configured === "boolean") setConfigured(data.configured);
      await loadList();
    }
  }

  useEffect(() => {
    const handle = window.setTimeout(() => {
      void loadList(folder, query);
    }, 0);
    return () => window.clearTimeout(handle);
    // Reload when the folder or search changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folder, query]);

  useEffect(() => {
    function onOpen(event: Event) {
      const detail = (event as CustomEvent<{ threadId?: string; compose?: { to?: string; subject?: string; text?: string } }>).detail;
      if (detail?.compose?.to) {
        setSelected(null);
        setError(null);
        setNote(null);
        setComposer({
          ...emptyComposer(),
          to: detail.compose.to,
          subject: detail.compose.subject || "",
          text: detail.compose.text || "",
        });
        flash(`Compose opened for ${detail.compose.to}.`);
        return;
      }
      const id = detail?.threadId;
      if (id) {
        document.getElementById("mailbox")?.scrollIntoView({ behavior: "smooth" });
        void openThread(id);
      }
    }
    window.addEventListener("beacon-open-mail", onOpen);
    return () => window.removeEventListener("beacon-open-mail", onOpen);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onPickFiles(list: FileList | null) {
    if (!composer || !list?.length) return;
    const next = [...composer.files];
    for (const file of Array.from(list)) {
      if (next.length >= 3) break;
      const parsed = await fileToAttachment(file);
      if (parsed) next.push(parsed);
      else setError("Each attachment must be under 1.2 MB.");
    }
    setComposer({ ...composer, files: next });
  }

  async function submit(action: "send" | "draft") {
    if (!composer) return;
    setBusy(true);
    setError(null);
    setNote(null);
    try {
      const res = await fetch("/api/admin/mailbox", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: action === "draft" ? "draft" : composer.mode === "new" ? "send" : composer.mode,
          mode: composer.mode,
          threadId: composer.threadId,
          messageId: composer.messageId,
          draftMessageId: composer.draftMessageId,
          to: composer.to,
          cc: composer.cc,
          subject: composer.subject,
          text: composer.text,
          ...(composer.files.length ? { attachments: composer.files } : {}),
        }),
      });
      const data = await parseResponseJson<{
        ok?: boolean;
        sent?: boolean;
        error?: string;
        thread?: MailThreadDetail;
      }>(res, {});
      if (!res.ok) throw new Error(data.error || "Could not save.");
      if (data.thread) setSelected(data.thread);
      if (action === "draft") {
        setNote("Draft saved.");
        flash("Draft saved.");
        setFolder("drafts");
        setComposer(null);
      } else if (data.sent) {
        setNote("Sent.");
        flash("Sent.");
        setComposer(null);
        if (folder === "drafts") setFolder("sent");
      } else {
        const message = data.error || "Email not configured. The message was kept as a draft.";
        setError(message);
        flash(message);
        setFolder("drafts");
      }
      await loadList();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not save.";
      setError(message);
      flash(message);
    } finally {
      setBusy(false);
    }
  }

  async function mutate(action: "archive" | "restore" | "read" | "unread", threadId: string) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/mailbox", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, threadId }),
      });
      if (!res.ok) throw new Error("Could not update the thread.");
      const saved =
        action === "archive"
          ? "Archived."
          : action === "restore"
            ? "Restored."
            : action === "read"
              ? "Marked read."
              : "Marked unread.";
      setNote(saved);
      flash(saved);
      if (action === "archive") {
        setSelected(null);
        setFolder("archive");
      }
      await loadList();
      if (action !== "archive") await openThread(threadId);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not update the thread.";
      setError(message);
      flash(message);
    } finally {
      setBusy(false);
    }
  }

  function startReply(mode: "reply" | "forward", preset?: string) {
    if (!selected) return;
    const last = [...selected.messages].reverse().find((message) => message.direction !== "draft");
    const to = mode === "reply" ? last?.from || selected.participants[0] || "" : "";
    const subjectBase = last?.subject || selected.subject;
    const prefix = mode === "forward" ? "Fwd: " : "Re: ";
    const subject = subjectBase.toLowerCase().startsWith(prefix.toLowerCase()) ? subjectBase : `${prefix}${subjectBase}`;
    setComposer({
      mode,
      threadId: selected.id,
      messageId: last?.id,
      to,
      cc: "",
      subject,
      text:
        preset ??
        (mode === "forward" && last
          ? `\n\n---------- Forwarded message ----------\nFrom: ${last.from}\nSubject: ${last.subject}\n\n${last.text}`
          : ""),
      files: [],
    });
  }

  function openDraft(thread: MailThreadDetail) {
    const draft = [...thread.messages].reverse().find((message) => message.direction === "draft");
    setComposer({
      mode: "new",
      threadId: thread.id,
      draftMessageId: draft?.id,
      to: draft?.to.join(", ") || "",
      cc: draft?.cc.join(", ") || "",
      subject: draft?.subject || thread.subject,
      text: draft?.text || "",
      files: [],
    });
  }

  return (
    <section id="mailbox" className="admin-panel admin-section p-5 sm:p-6">
      <AdminToast message={toast} />
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="admin-kicker">Email</p>
          <h2 className="mt-1 font-display text-xl font-semibold text-heading">
            Mail
            {visibleCounts.unread > 0 && (
              <span className="ml-2 align-middle rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-background">
                {visibleCounts.unread} unread
              </span>
            )}
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            Inbox for hello@thebeaconstudio.co.ke. Reply, archive, and open a linked lead from the same thread.
          </p>
        </div>
        <button
          type="button"
          className="admin-btn h-9"
          onClick={() => {
            setSelected(null);
            setError(null);
            setNote(null);
            setComposer(emptyComposer());
          }}
        >
          <PenLine className="h-4 w-4" />
          Compose
        </button>
      </div>

      {configured === false && (
        <p className="mt-4 rounded-2xl bg-background/50 px-4 py-3 text-sm text-foreground" role="status">
          Email not configured. Set <span className="font-mono text-xs">RESEND_API_KEY</span>. Mail leaves
          from The Beacon Studio &lt;hello@thebeaconstudio.co.ke&gt; unless{" "}
          <span className="font-mono text-xs">EMAIL_FROM</span> is set. Inbound mail also needs{" "}
          <span className="font-mono text-xs">RESEND_WEBHOOK_SECRET</span>. Threads still save here.
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <div className="admin-tabs">
          {FOLDERS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setFolder(item.id);
                setComposer(null);
              }}
              className={`rounded-xl px-3 py-1.5 text-sm font-semibold ${
                folder === item.id ? "bg-accent text-background" : "text-muted"
              }`}
            >
              {item.label}
              <span className="ml-1 font-mono text-[10px] opacity-80">{visibleCounts[item.id]}</span>
              {item.id === "inbox" && visibleCounts.unread > 0 && (
                <span
                  className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                    folder === "inbox" ? "bg-background text-accent" : "bg-accent text-background"
                  }`}
                >
                  {visibleCounts.unread}
                </span>
              )}
            </button>
          ))}
        </div>
        <label className="relative min-w-48 flex-1">
          <span className="sr-only">Search mail</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search subject, people, tags, or message"
            className="w-full rounded-xl py-2 pl-9 pr-3 text-sm"
          />
        </label>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.2fr)]">
        <div className="max-h-[36rem] space-y-2 overflow-y-auto rounded-2xl bg-background/30 p-2">
          {loading && <p className="px-3 py-6 text-sm text-muted">Loading mail…</p>}
          {!loading && threads.length === 0 && (
            <p className="px-3 py-6 text-sm text-muted">Nothing in {folder}.</p>
          )}
          {threads.map((thread) => (
            <button
              key={thread.id}
              type="button"
              onClick={() => void openThread(thread.id)}
              className={`w-full rounded-2xl px-3 py-3 text-left ${
                selected?.id === thread.id ? "bg-accent/15" : "bg-background/40 hover:bg-accent/10"
              }`}
            >
              <span className="flex items-center gap-2">
                {thread.unread && folder === "inbox" && (
                  <span className="h-2 w-2 shrink-0 rounded-full bg-accent" aria-label="Unread" />
                )}
                <span className="truncate text-sm font-semibold text-foreground">{thread.subject}</span>
              </span>
              <span className="mt-1 block truncate text-xs text-muted">
                {thread.clientName || thread.participants[0] || "Studio"} · {formatNairobi(thread.updatedAt)}
              </span>
              <span className="mt-1 block truncate text-xs text-foreground/80">{thread.summary || thread.preview}</span>
              {thread.tags && thread.tags.length > 0 && (
                <span className="mt-2 flex flex-wrap gap-1">
                  {thread.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent">
                      {tag}
                    </span>
                  ))}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="min-h-80 rounded-2xl bg-background/30 p-4">
          {composer ? (
            <form
              className="space-y-3"
              onSubmit={(event) => {
                event.preventDefault();
                void submit("send");
              }}
            >
              <p className="admin-kicker">{composer.mode === "new" ? "New message" : composer.mode}</p>
              <input
                required
                value={composer.to}
                onChange={(event) => setComposer({ ...composer, to: event.target.value })}
                placeholder="To"
                className="w-full rounded-xl px-3 py-2 text-sm"
              />
              <input
                value={composer.cc}
                onChange={(event) => setComposer({ ...composer, cc: event.target.value })}
                placeholder="Cc"
                className="w-full rounded-xl px-3 py-2 text-sm"
              />
              <input
                value={composer.subject}
                onChange={(event) => setComposer({ ...composer, subject: event.target.value })}
                placeholder="Subject"
                className="w-full rounded-xl px-3 py-2 text-sm"
              />
              <textarea
                required
                rows={8}
                value={composer.text}
                onChange={(event) => setComposer({ ...composer, text: event.target.value })}
                placeholder="Write your message"
                className="w-full rounded-xl px-3 py-2 text-sm"
              />
              <div className="flex flex-wrap items-center gap-2">
                <label className="admin-btn h-9 cursor-pointer">
                  <Paperclip className="h-4 w-4" />
                  Attach
                  <input
                    type="file"
                    multiple
                    className="sr-only"
                    onChange={(event) => void onPickFiles(event.target.files)}
                  />
                </label>
                {composer.files.map((file) => (
                  <span key={file.filename} className="rounded-full bg-surface px-2 py-1 text-xs text-muted">
                    {file.filename}
                  </span>
                ))}
              </div>
              {error && (
                <p className="text-sm text-accent-warm" role="alert">
                  {error}
                </p>
              )}
              {note && <p className="text-sm text-muted">{note}</p>}
              <div className="flex flex-wrap gap-2">
                <button
                  type="submit"
                  disabled={busy}
                  className="inline-flex h-10 items-center gap-2 rounded-xl bg-accent px-4 text-sm font-semibold text-background disabled:opacity-60"
                >
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Send
                </button>
                <button type="button" disabled={busy} onClick={() => void submit("draft")} className="admin-btn">
                  Save draft
                </button>
                <button type="button" onClick={() => setComposer(null)} className="admin-btn text-muted">
                  Cancel
                </button>
              </div>
            </form>
          ) : !selected ? (
            <p className="m-auto flex min-h-64 max-w-xs items-center text-center text-sm leading-relaxed text-muted">
              <Mail className="mr-2 h-4 w-4 shrink-0" />
              Open a thread, or compose a new message.
            </p>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-lg font-semibold text-heading">{selected.subject}</h3>
                  <p className="text-xs text-muted">{selected.participants.join(", ") || "No address yet"}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" className="admin-btn h-9" onClick={() => startReply("reply")}>
                    <Reply className="h-4 w-4" /> Reply
                  </button>
                  {selected.suggestedReply && (
                    <button
                      type="button"
                      className="admin-btn h-9"
                      onClick={() => startReply("reply", selected.suggestedReply)}
                    >
                      Use suggested reply
                    </button>
                  )}
                  <button type="button" className="admin-btn h-9" onClick={() => startReply("forward")}>
                    <Forward className="h-4 w-4" /> Forward
                  </button>
                  {selected.folder === "archive" ? (
                    <button type="button" className="admin-btn h-9" onClick={() => void mutate("restore", selected.id)}>
                      Restore
                    </button>
                  ) : (
                    <button type="button" className="admin-btn h-9" onClick={() => void mutate("archive", selected.id)}>
                      <Archive className="h-4 w-4" /> Archive
                    </button>
                  )}
                  <button
                    type="button"
                    className="admin-btn h-9"
                    onClick={() => void mutate(selected.unread ? "read" : "unread", selected.id)}
                  >
                    {selected.unread ? "Mark read" : "Mark unread"}
                  </button>
                </div>
              </div>

              {(selected.summary || (selected.tags && selected.tags.length > 0)) && (
                <div className="rounded-2xl bg-background/50 px-3 py-3 text-sm">
                  {selected.summary && <p className="text-foreground">{selected.summary}</p>}
                  {selected.tags && selected.tags.length > 0 && (
                    <p className="mt-2 flex flex-wrap gap-1">
                      {selected.tags.map((tag) => (
                        <span key={tag} className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent">
                          {tag}
                        </span>
                      ))}
                    </p>
                  )}
                </div>
              )}

              {(selected.links.client || selected.links.leads.length > 0) && (
                <div className="rounded-2xl bg-accent/10 px-3 py-3 text-sm">
                  <p className="admin-kicker">Linked</p>
                  {selected.links.client && (
                    <p className="mt-1 text-foreground">
                      Client · {selected.links.client.name} · {selected.links.client.email}
                    </p>
                  )}
                  {selected.links.leads.map((lead) => {
                    const openable = lead.kind === "contact" || lead.kind === "intake" || lead.kind === "booking";
                    if (!openable) {
                      return (
                        <p key={lead.id} className="mt-1 text-foreground">
                          {lead.kind} · {lead.name} — {lead.summary}
                        </p>
                      );
                    }
                    return (
                      <button
                        key={lead.id}
                        type="button"
                        className="mt-1 block text-left text-accent"
                        onClick={() => {
                          document.getElementById("inbox")?.scrollIntoView({ behavior: "smooth" });
                          window.dispatchEvent(new CustomEvent("beacon-open-lead", { detail: { id: lead.id } }));
                        }}
                      >
                        {lead.kind} · {lead.name} — {lead.summary}
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="max-h-80 space-y-3 overflow-y-auto">
                {selected.messages.map((message) => (
                  <article
                    key={message.id}
                    className={`rounded-2xl px-3 py-3 text-sm ${
                      message.direction === "out" ? "bg-accent text-background" : "bg-surface text-foreground"
                    }`}
                  >
                    <p className={`font-mono text-[10px] uppercase tracking-wider ${message.direction === "out" ? "text-background/80" : "text-muted"}`}>
                      {message.direction} · {message.from} · {formatNairobi(message.createdAt)}
                    </p>
                    {message.html ? (
                      <div
                        className="mail-html mt-2 whitespace-pre-wrap leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: message.html }}
                      />
                    ) : (
                      <p className="mt-2 whitespace-pre-wrap">{message.text}</p>
                    )}
                    {message.attachments.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {message.attachments.map((file) => (
                          <li key={file.id}>
                            {file.stored ? (
                              <a
                                className="underline"
                                href={`/api/admin/mailbox/attachment?thread=${selected.id}&message=${message.id}&attachment=${file.id}`}
                              >
                                {file.filename}
                              </a>
                            ) : (
                              <span>
                                {file.filename} (too large to store)
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </article>
                ))}
              </div>

              {selected.messages.some((message) => message.direction === "draft") && (
                <button type="button" className="admin-btn" onClick={() => openDraft(selected)}>
                  Continue draft
                </button>
              )}
              {error && (
                <p className="text-sm text-accent-warm" role="alert">
                  {error}
                </p>
              )}
              {note && <p className="text-sm text-muted">{note}</p>}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
