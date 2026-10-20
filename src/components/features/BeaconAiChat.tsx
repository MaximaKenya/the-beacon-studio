"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { Send, X } from "lucide-react";
import { BeaconMark } from "@/components/brand/BeaconMark";
import { ChatMessageContent } from "@/components/features/ChatMessageContent";
import { useFeatures } from "@/providers/FeatureProvider";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { trackEvent } from "@/lib/analytics";
import { beaconAiUnavailableText, BEACON_AI_MAX_MESSAGE_CHARS } from "@/lib/beacon-ai";

type Message = { role: "user" | "assistant"; content: string };

const GREETING =
  "Hi, I'm Beacon AI. Ask about automation, products, or IT. I can book you a free 20-minute audit, or take your name and email.";

const SUGGESTIONS = [
  "How much does automation cost?",
  "Which products are live?",
  "What does managed IT include?",
];

type StreamEvent = {
  delta?: string;
  done?: boolean;
  fallback?: boolean;
  leadSaved?: boolean;
  error?: string;
};

async function readBeaconStream(
  response: Response,
  onDelta: (delta: string) => void
): Promise<{ leadSaved: boolean; sawDelta: boolean }> {
  if (!response.body) return { leadSaved: false, sawDelta: false };
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let leadSaved = false;
  let sawDelta = false;

  const consume = (block: string) => {
    const line = block
      .split("\n")
      .map((entry) => entry.trim())
      .find((entry) => entry.startsWith("data:"));
    if (!line) return;
    const raw = line.slice(5).trim();
    if (!raw) return;
    const event = JSON.parse(raw) as StreamEvent;
    if (typeof event.delta === "string" && event.delta) {
      sawDelta = true;
      onDelta(event.delta);
    }
    if (event.leadSaved) leadSaved = true;
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split("\n\n");
    buffer = parts.pop() ?? "";
    for (const part of parts) consume(part);
  }
  if (buffer.trim()) consume(buffer);
  return { leadSaved, sawDelta };
}

export function BeaconAiChat() {
  const pathname = usePathname();
  const { openBooking } = useFeatures();
  const reducedMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const trapRef = useFocusTrap(open);
  const endRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([{ role: "assistant", content: GREETING }]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [detailsSaved, setDetailsSaved] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
  }, [messages, pending, reducedMotion, open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/portal")
  ) {
    return null;
  }

  function appendDelta(delta: string) {
    setMessages((prev) => {
      const next = [...prev];
      const last = next[next.length - 1];
      if (!last || last.role !== "assistant") return prev;
      next[next.length - 1] = { role: "assistant", content: last.content + delta };
      return next;
    });
  }

  async function sendMessage(text: string) {
    const trimmed = text.trim().slice(0, BEACON_AI_MAX_MESSAGE_CHARS);
    if (!trimmed || pending) return;

    const history: Message[] = [...messages, { role: "user", content: trimmed }];
    setMessages([...history, { role: "assistant", content: "" }]);
    setInput("");
    setPending(true);
    setFormError("");
    trackEvent("chat_message", { source: "beacon-ai", length: trimmed.length });

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history.map((message) => ({ role: message.role, content: message.content })),
        }),
      });

      const contentType = response.headers.get("content-type") ?? "";
      if (!contentType.includes("text/event-stream")) {
        throw new Error("Beacon AI did not stream a reply.");
      }

      const result = await readBeaconStream(response, appendDelta);
      if (result.leadSaved) setDetailsSaved(true);
      if (!result.sawDelta) {
        appendDelta(beaconAiUnavailableText(result.leadSaved));
      }
    } catch {
      appendDelta(beaconAiUnavailableText(false));
    } finally {
      setPending(false);
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    void sendMessage(input);
  }

  function handleDetails(event: FormEvent) {
    event.preventDefault();
    const nextName = name.trim();
    const nextEmail = email.trim();
    const nextPhone = phone.trim();
    if (!nextEmail && !nextPhone) {
      setFormError("Add an email or phone so we can follow up.");
      return;
    }
    const parts = [
      nextName ? `My name is ${nextName}` : "",
      nextEmail ? `Email: ${nextEmail}` : "",
      nextPhone ? `Phone: ${nextPhone}` : "",
    ].filter(Boolean);
    setShowDetails(false);
    void sendMessage(`${parts.join(". ")}. Please follow up.`);
  }

  function openChat() {
    setOpen(true);
    trackEvent("chat_open", { source: "beacon-ai" });
  }

  const panelMotion = reducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 12 },
      };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            ref={trapRef}
            {...panelMotion}
            transition={{ duration: reducedMotion ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="sleek-card fixed bottom-[12.25rem] left-4 z-[160] flex max-h-[min(32rem,calc(100dvh-18rem))] w-[min(24rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl md:bottom-[10.5rem] md:max-h-[min(34rem,calc(100dvh-16rem))]"
            role="dialog"
            aria-label="Beacon AI chat"
            aria-modal="true"
          >
            <div className="flex items-center justify-between gap-3 bg-surface/40 px-4 py-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-background">
                  <BeaconMark size={18} variant="mono" className="text-background" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-heading">Beacon AI</p>
                  <p className="text-[11px] text-muted">Automation, products, and IT</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl p-1.5 text-muted hover:bg-surface hover:text-heading"
                aria-label="Close Beacon AI"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3" role="log" aria-live="polite">
              {messages.map((message, index) => {
                if (message.role === "assistant" && !message.content && pending) {
                  return (
                    <div key={index} className="flex justify-start" aria-label="Beacon AI is replying">
                      <div className="flex gap-1 rounded-2xl bg-surface-elevated px-4 py-3">
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted [animation-delay:0ms]" />
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted [animation-delay:150ms]" />
                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted [animation-delay:300ms]" />
                      </div>
                    </div>
                  );
                }
                if (!message.content) return null;
                return (
                  <div
                    key={index}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[88%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                        message.role === "user"
                          ? "bg-accent text-background"
                          : "bg-surface-elevated text-foreground"
                      }`}
                    >
                      {message.role === "assistant" ? (
                        <ChatMessageContent content={message.content} />
                      ) : (
                        message.content
                      )}
                    </div>
                  </div>
                );
              })}
              {detailsSaved && (
                <p className="text-center text-[11px] text-muted">Details saved. We will follow up.</p>
              )}
              <div ref={endRef} />
            </div>

            {messages.length <= 1 && (
              <div className="flex flex-wrap gap-1.5 px-4 pb-2">
                {SUGGESTIONS.map((question) => (
                  <button
                    key={question}
                    type="button"
                    onClick={() => void sendMessage(question)}
                    disabled={pending}
                    className="rounded-full bg-surface-elevated px-2.5 py-1 text-[11px] text-muted hover:text-accent disabled:opacity-50"
                  >
                    {question}
                  </button>
                ))}
              </div>
            )}

            <div className="space-y-2 px-3 pb-3">
              <button
                type="button"
                onClick={() => {
                  trackEvent("cta_click", { type: "book", source: "beacon-ai" });
                  openBooking("automation-audit");
                }}
                className="flex h-10 w-full items-center justify-center rounded-2xl bg-accent text-sm font-semibold text-background"
              >
                Book a free 20-min audit
              </button>

              {showDetails ? (
                <form onSubmit={handleDetails} className="space-y-2 rounded-2xl bg-surface-elevated p-2.5">
                  <label className="sr-only" htmlFor="beacon-lead-name">
                    Name
                  </label>
                  <input
                    id="beacon-lead-name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Name"
                    autoComplete="name"
                    className="field h-9 px-3 text-sm"
                  />
                  <label className="sr-only" htmlFor="beacon-lead-email">
                    Email
                  </label>
                  <input
                    id="beacon-lead-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="Email"
                    autoComplete="email"
                    className="field h-9 px-3 text-sm"
                  />
                  <label className="sr-only" htmlFor="beacon-lead-phone">
                    Phone
                  </label>
                  <input
                    id="beacon-lead-phone"
                    type="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="Phone or WhatsApp"
                    autoComplete="tel"
                    className="field h-9 px-3 text-sm"
                  />
                  {formError && <p className="text-[11px] text-accent-warm">{formError}</p>}
                  <button
                    type="submit"
                    disabled={pending}
                    className="h-9 w-full rounded-xl bg-surface px-3 text-sm font-semibold text-heading disabled:opacity-50"
                  >
                    Send details
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowDetails(true)}
                  className="w-full text-center text-[11px] text-muted hover:text-accent"
                >
                  Or leave your name and email
                </button>
              )}

              <form onSubmit={handleSubmit} className="flex gap-2">
                <label htmlFor="beacon-ai-input" className="sr-only">
                  Message Beacon AI
                </label>
                <input
                  id="beacon-ai-input"
                  type="text"
                  value={input}
                  maxLength={BEACON_AI_MAX_MESSAGE_CHARS}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Ask about a workflow, product, or price"
                  disabled={pending}
                  className="field h-10 flex-1 px-3 text-sm disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={pending || !input.trim()}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-accent text-background disabled:opacity-40"
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" aria-hidden />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => (open ? setOpen(false) : openChat())}
        className="fixed bottom-32 left-4 z-[132] inline-flex h-14 w-14 items-center justify-center rounded-full bg-accent text-background shadow-[0_12px_30px_color-mix(in_srgb,var(--accent)_35%,transparent)] md:bottom-[5.75rem]"
        aria-label={open ? "Close Beacon AI chat" : "Open Beacon AI chat"}
        aria-expanded={open}
      >
        {open ? (
          <X className="h-6 w-6" aria-hidden />
        ) : (
          <BeaconMark size={28} variant="mono" className="text-background" />
        )}
      </button>
    </>
  );
}
