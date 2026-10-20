"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Send } from "lucide-react";
import { formatNairobi } from "@/lib/time";
import { parseResponseJson } from "@/lib/safe-json";
import type { InboxItem, InboxKind } from "@/lib/inbox";
import type { MessageThread } from "@/lib/messages";

const KIND_LABEL: Record<InboxKind, string> = {
  contact: "Contact",
  intake: "Intake",
  booking: "Booking",
  review: "Review",
  message: "Portal message",
};

function sourceLabel(source: string) {
  switch (source) {
    case "quick-lead:automation":
      return "Quick lead · Automation";
    case "quick-lead:custom-software":
      return "Quick lead · Custom software";
    case "quick-lead:managed-it":
      return "Quick lead · Managed IT";
    case "quick-lead:product":
      return "Quick lead · A product";
    case "contact-form":
      return "Contact form";
    case "intake":
      return "Project intake";
    case "booking":
      return "Booking";
    case "review":
      return "Review";
    case "portal":
      return "Portal";
    default:
      return source || "Website";
  }
}

function isNewLead(status: string) {
  return status === "new";
}

const FILTERS: { id: "all" | InboxKind; label: string }[] = [
  { id: "all", label: "All" },
  { id: "contact", label: "Contact" },
  { id: "intake", label: "Intake" },
  { id: "booking", label: "Booking" },
  { id: "review", label: "Reviews" },
  { id: "message", label: "Portal" },
];

export function AdminInbox() {
  const [items, setItems] = useState<InboxItem[]>([]);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [thread, setThread] = useState<MessageThread | null>(null);
  const [reply, setReply] = useState("");
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mailThreadId, setMailThreadId] = useState<string | null>(null);

  const visible = useMemo(
    () => (filter === "all" ? items : items.filter((item) => item.kind === filter)),
    [items, filter]
  );
  const selected = items.find((item) => item.id === selectedId) ?? null;

  async function loadList(keepId?: string | null) {
    const res = await fetch("/api/admin/inbox");
    const data = await parseResponseJson<{ items?: InboxItem[] }>(res, {});
    const next = data.items ?? [];
    setItems(next);
    setLoading(false);
    const id = keepId ?? selectedId;
    if (id && next.some((item) => item.id === id)) {
      await openItem(id, false);
    }
  }

  async function openItem(id: string, clearNote = true) {
    setSelectedId(id);
    if (clearNote) {
      setNote(null);
      setError(null);
    }
    const res = await fetch(`/api/admin/inbox?id=${encodeURIComponent(id)}`);
    const data = await parseResponseJson<{ thread?: MessageThread | null }>(res, {});
    setThread(data.thread ?? null);
  }

  useEffect(() => {
    void loadList(null);
    // Initial load only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openRef = useRef(openItem);
  openRef.current = openItem;

  useEffect(() => {
    function onOpen(event: Event) {
      const id = (event as CustomEvent<{ id?: string }>).detail?.id;
      if (id) void openRef.current(id);
    }
    window.addEventListener("beacon-open-lead", onOpen);
    return () => window.removeEventListener("beacon-open-lead", onOpen);
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setMailThreadId(null);
      return;
    }
    let cancel = false;
    void fetch(`/api/admin/mailbox?leadId=${encodeURIComponent(selectedId)}`)
      .then((res) => parseResponseJson<{ threadId?: string | null }>(res, {}))
      .then((data) => {
        if (!cancel) setMailThreadId(data.threadId ?? null);
      })
      .catch(() => {
        if (!cancel) setMailThreadId(null);
      });
    return () => {
      cancel = true;
    };
  }, [selectedId]);

  async function sendReply() {
    if (!selected || !reply.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/inbox", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reply", id: selected.id, body: reply.trim() }),
      });
      const data = await parseResponseJson<{ error?: string; note?: string; thread?: MessageThread }>(
        res,
        {}
      );
      if (!res.ok) throw new Error(data.error || "Could not send reply.");
      setReply("");
      setNote(data.note || "Saved.");
      if (data.thread) setThread(data.thread);
      await loadList(selected.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send reply.");
    } finally {
      setBusy(false);
    }
  }

  async function moderate(visibility: "approved" | "hidden") {
    if (!selected?.projectId || !selected.reviewId) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/inbox", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "review",
          projectId: selected.projectId,
          reviewId: selected.reviewId,
          visibility,
        }),
      });
      const data = await parseResponseJson<{ error?: string }>(res, {});
      if (!res.ok) throw new Error(data.error || "Could not update review.");
      setNote(visibility === "approved" ? "Review is public." : "Review is hidden.");
      await loadList(selected.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update review.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section id="inbox" className="admin-panel admin-section p-5 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="admin-kicker">Messages</p>
          <h2 className="mt-1 font-display text-xl font-semibold text-heading">
            Inbox
            {items.some((item) => isNewLead(item.status)) && (
              <span className="ml-2 align-middle rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-background">
                {items.filter((item) => isNewLead(item.status)).length} new
              </span>
            )}
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            Contact, intake, bookings, reviews, and portal messages. Open one to reply. The client
            sees the reply in the portal. Email goes out only when Resend is configured.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadList(selectedId)}
          className="admin-btn h-9"
        >
          Refresh
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilter(item.id)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              filter === item.id
                ? "bg-accent text-background"
                : "bg-surface/70 text-muted hover:text-foreground"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <div className="overflow-x-auto rounded-2xl bg-background/35">
          {loading ? (
            <p className="px-4 py-8 text-sm text-muted">Loading submissions…</p>
          ) : visible.length === 0 ? (
            <p className="px-4 py-8 text-sm text-muted">No submissions in this view.</p>
          ) : (
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-surface-elevated/80 text-[11px] uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-3 py-3 font-medium">Type</th>
                  <th className="px-3 py-3 font-medium">Source</th>
                  <th className="px-3 py-3 font-medium">Name</th>
                  <th className="px-3 py-3 font-medium">Email</th>
                  <th className="px-3 py-3 font-medium">Phone</th>
                  <th className="px-3 py-3 font-medium">Message</th>
                  <th className="px-3 py-3 font-medium">Date</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => void openItem(item.id)}
                    className={`cursor-pointer align-top ${
                      selectedId === item.id ? "bg-accent/10" : "hover:bg-surface/80"
                    }`}
                  >
                    <td className="px-3 py-2 text-foreground">
                      {KIND_LABEL[item.kind]}
                      {isNewLead(item.status) && (
                        <span className="ml-2 rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-background">
                          New
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-foreground">{sourceLabel(item.leadSource)}</td>
                    <td className="px-3 py-2 text-foreground">{item.name}</td>
                    <td className="px-3 py-2 text-muted">{item.email}</td>
                    <td className="px-3 py-2 text-muted">{item.phone}</td>
                    <td className="max-w-[220px] px-3 py-2 text-foreground">
                      <span className="line-clamp-2">{item.message}</span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 font-mono text-[11px] text-muted">
                      {formatNairobi(item.createdAt)}
                    </td>
                    <td className="px-3 py-2">
                      <span className="rounded-full bg-surface px-2 py-0.5 text-[11px] capitalize text-foreground">
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="flex min-h-80 flex-col rounded-2xl bg-background/40 p-4">
          {!selected ? (
            <p className="m-auto max-w-xs text-center text-sm leading-relaxed text-muted">
              Select a submission to read it and reply.
            </p>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
                  {KIND_LABEL[selected.kind]} · {sourceLabel(selected.leadSource)} · {selected.status}
                  {isNewLead(selected.status) && (
                    <span className="ml-2 rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-background">
                      New lead
                    </span>
                  )}
                </p>
                <h3 className="mt-1 font-display text-lg font-semibold text-foreground">
                  {selected.name}
                </h3>
                <p className="text-sm text-muted">
                  {selected.email}
                  {selected.phone !== "—" ? ` · ${selected.phone}` : ""}
                </p>
                <p className="mt-3 whitespace-pre-wrap text-sm text-foreground">{selected.message}</p>
                {mailThreadId && (
                  <button
                    type="button"
                    className="mt-3 text-sm font-semibold text-accent"
                    onClick={() => {
                      document.getElementById("mailbox")?.scrollIntoView({ behavior: "smooth" });
                      window.dispatchEvent(
                        new CustomEvent("beacon-open-mail", { detail: { threadId: mailThreadId } })
                      );
                    }}
                  >
                    Open mailbox thread
                  </button>
                )}
              </div>

              {selected.kind === "review" && selected.projectId && selected.reviewId && (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={busy || selected.status === "approved"}
                    onClick={() => void moderate("approved")}
                    className="inline-flex h-9 items-center rounded-xl bg-accent px-3 text-sm font-semibold text-background hover:bg-accent-hover disabled:opacity-50"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    disabled={busy || selected.status === "hidden"}
                    onClick={() => void moderate("hidden")}
                    className="inline-flex h-9 items-center rounded-xl bg-surface px-3 text-sm text-foreground disabled:opacity-50"
                  >
                    Hide
                  </button>
                  <p className="w-full text-xs text-muted">
                    Only approved reviews are shown publicly. New reviews stay pending.
                  </p>
                </div>
              )}

              <div className="max-h-52 space-y-2 overflow-y-auto">
                {!thread?.messages.length && (
                  <p className="text-xs text-muted">No replies yet.</p>
                )}
                {thread?.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`rounded-xl px-3 py-2 text-sm ${
                      message.sender === "admin"
                        ? "bg-accent text-background"
                        : "bg-surface text-foreground"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.body}</p>
                    <p
                      className={`mt-1 font-mono text-[10px] ${
                        message.sender === "admin" ? "text-background/80" : "text-muted"
                      }`}
                    >
                      {message.sender === "admin" ? "You" : "Client"} · {formatNairobi(message.at)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <label htmlFor="inbox-reply" className="text-xs text-muted">
                  Reply
                </label>
                <textarea
                  id="inbox-reply"
                  rows={4}
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Write a reply the client can read in the portal…"
                  className="field w-full px-3 py-2 text-sm placeholder:text-muted"
                />
                {error && (
                  <p className="text-sm text-accent-warm" role="alert">
                    {error}
                  </p>
                )}
                {note && <p className="text-sm text-muted">{note}</p>}
                <button
                  type="button"
                  disabled={busy || !reply.trim()}
                  onClick={() => void sendReply()}
                  className="inline-flex h-10 items-center gap-2 rounded-xl bg-accent px-4 text-sm font-semibold text-background hover:bg-accent-hover disabled:opacity-50"
                >
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Send reply
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
