"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Send } from "lucide-react";
import { formatNairobi } from "@/lib/time";
import { parseResponseJson } from "@/lib/safe-json";
import type { ChatMessage, MessageThread } from "@/lib/messages";

export function ChatPanel({
  projectId,
  pollMs = 4000,
  viewer = "client",
}: {
  projectId: string;
  pollMs?: number;
  viewer?: "client" | "admin";
}) {
  const [thread, setThread] = useState<MessageThread | null>(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/portal/messages?projectId=${encodeURIComponent(projectId)}`);
      const data = await parseResponseJson<{ thread?: MessageThread }>(res, {});
      if (data.thread) setThread(data.thread);
    } catch {
      /* ignore poll errors */
    }
  }, [projectId]);

  useEffect(() => {
    void load();
    const id = window.setInterval(() => void load(), pollMs);
    const onFocus = () => void load();
    window.addEventListener("focus", onFocus);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("focus", onFocus);
    };
  }, [load, pollMs]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread?.messages.length]);

  async function send() {
    if (!text.trim() || sending) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/portal/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, body: text.trim() }),
      });
      const data = await parseResponseJson<{ error?: string; message?: ChatMessage }>(res, {});
      if (!res.ok) throw new Error(data.error || "Send failed");
      setText("");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Send failed");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex h-[420px] flex-col overflow-hidden rounded-2xl border border-border bg-surface/50">
      <div className="border-b border-border/60 px-4 py-3">
        <p className="font-display text-sm font-semibold text-foreground">
          Direct messages
        </p>
        <p className="text-[11px] text-muted">
          {viewer === "admin" ? "Reply to client" : "Chat with Beacon studio"} · live refresh
        </p>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
        {!thread?.messages.length && (
          <p className="py-8 text-center text-sm text-muted">
            No messages yet — say hello to start the thread.
          </p>
        )}
        {thread?.messages.map((m) => {
          const mine =
            (viewer === "client" && m.sender === "client") ||
            (viewer === "admin" && m.sender === "admin");
          return (
            <div
              key={m.id}
              className={`flex ${mine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm ${
                  mine
                    ? "bg-accent text-background"
                    : "border border-border bg-background/70 text-foreground"
                }`}
              >
                <p className="whitespace-pre-wrap">{m.body}</p>
                <p
                  className={`mt-1 font-mono text-[9px] ${
                    mine ? "text-background/70" : "text-muted"
                  }`}
                >
                  {formatNairobi(m.at)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      {error && (
        <p className="px-4 text-xs text-accent-warm" role="alert">
          {error}
        </p>
      )}
      <div className="flex gap-2 border-t border-border/60 p-3">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void send();
            }
          }}
          placeholder="Write a message…"
          className="flex-1 rounded-xl border border-border bg-background/60 px-3 py-2 text-sm text-foreground focus:border-accent/50 focus:outline-none"
        />
        <button
          type="button"
          onClick={() => void send()}
          disabled={sending || !text.trim()}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-background hover:bg-accent-hover disabled:opacity-40"
          aria-label="Send"
        >
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
