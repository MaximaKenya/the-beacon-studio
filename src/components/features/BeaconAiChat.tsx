"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { Send } from "lucide-react";
import { LighthouseSpinner } from "@/components/brand/LighthouseSpinner";
import { AssistantFabButton, AssistantPanelHeader } from "@/components/features/AssistantBrand";
import { showsPublicAssistant } from "@/components/features/assistant-fab";
import { ChatMessageContent } from "@/components/features/ChatMessageContent";
import { useAssistantFabLayout, useAssistantPanelLayout } from "@/components/features/useAssistantChrome";
import { useFeatures } from "@/providers/FeatureProvider";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { trackEvent } from "@/lib/analytics";
import { readStoredAttribution } from "@/lib/attribution-client";
import { beaconAiUnavailableText, BEACON_AI_MAX_MESSAGE_CHARS } from "@/lib/beacon-ai";

type Message = { role: "user" | "assistant"; content: string };

const GREETING =
  "Hi, I'm Beacon AI. Tell me what you need, your budget, and when you want it. I can quote from our price list and book a free 20-minute audit.";

const SUGGESTIONS = [
  "I need reminders for a clinic",
  "How much does a Pilot cost?",
  "Book a call this month",
];

type ChatSlot = { date: string; time: string; label: string };
type ChatContact = { name?: string; email?: string; phone?: string };

type StreamEvent = {
  delta?: string;
  done?: boolean;
  fallback?: boolean;
  leadSaved?: boolean;
  error?: string;
  slots?: ChatSlot[];
  contact?: ChatContact;
};

async function readBeaconStream(
  response: Response,
  onDelta: (delta: string) => void
): Promise<{ leadSaved: boolean; sawDelta: boolean; slots: ChatSlot[]; contact?: ChatContact }> {
  if (!response.body) return { leadSaved: false, sawDelta: false, slots: [] };
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let leadSaved = false;
  let sawDelta = false;
  let slots: ChatSlot[] = [];
  let contact: ChatContact | undefined;

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
    if (Array.isArray(event.slots)) slots = event.slots;
    if (event.contact) contact = event.contact;
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
  return { leadSaved, sawDelta, slots, contact };
}

export function BeaconAiChat() {
  const pathname = usePathname();
  const { openBooking } = useFeatures();
  const reducedMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const fabLayout = useAssistantFabLayout(showsPublicAssistant(pathname) && !open);
  const panelStyle = useAssistantPanelLayout(open && showsPublicAssistant(pathname));
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
  const [slots, setSlots] = useState<ChatSlot[]>([]);
  const [pendingSlot, setPendingSlot] = useState<ChatSlot | null>(null);

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
          attribution: readStoredAttribution(),
        }),
      });

      const contentType = response.headers.get("content-type") ?? "";
      if (!contentType.includes("text/event-stream")) {
        throw new Error("Beacon AI did not stream a reply.");
      }

      const result = await readBeaconStream(response, appendDelta);
      if (result.leadSaved) setDetailsSaved(true);
      if (result.slots.length) setSlots(result.slots);
      if (result.contact) {
        if (result.contact.name) setName((current) => current || result.contact?.name || "");
        if (result.contact.email) setEmail((current) => current || result.contact?.email || "");
        if (result.contact.phone) setPhone((current) => current || result.contact?.phone || "");
      }
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
    if (pendingSlot && nextName && nextEmail) {
      void bookSlot(pendingSlot, nextName, nextEmail, nextPhone);
      setPendingSlot(null);
      return;
    }
    void sendMessage(`${parts.join(". ")}. Please follow up.`);
  }

  async function bookSlot(slot: ChatSlot, nextName = name.trim(), nextEmail = email.trim(), nextPhone = phone.trim()) {
    if (!nextName || !nextEmail) {
      setPendingSlot(slot);
      setName(nextName);
      setEmail(nextEmail);
      setPhone(nextPhone);
      setShowDetails(true);
      setFormError("Add your name and email to book this slot.");
      return;
    }
    setPending(true);
    setFormError("");
    try {
      const response = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: slot.date,
          time: slot.time,
          name: nextName,
          email: nextEmail,
          ...(nextPhone ? { phone: nextPhone } : {}),
          meetingType: "automation-audit",
          source: "beacon-ai",
          message: "Booked from Beacon AI.",
          ...readStoredAttribution(),
        }),
      });
      const data = (await response.json()) as { error?: string };
      const note = response.ok
        ? `Booked. Free 20-minute audit on ${slot.label}. A confirmation follows when email is configured.`
        : data.error || "That slot is no longer open. Pick another one.";
      setMessages((prev) => [...prev, { role: "assistant", content: note }]);
      if (response.ok) {
        setSlots((current) => current.filter((item) => item.date !== slot.date || item.time !== slot.time));
        setDetailsSaved(true);
        trackEvent("booking_confirmed", { source: "beacon-ai", date: slot.date, time: slot.time });
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "I could not save that slot. Use the booking button and we will hold a time for you." },
      ]);
    } finally {
      setPending(false);
    }
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
            data-assistant-panel=""
            className="sleek-card fixed z-[119] flex flex-col overflow-hidden rounded-3xl"
            style={panelStyle}
            role="dialog"
            aria-label="The Beacon Studio AI assistant"
            aria-modal="true"
          >
            <AssistantPanelHeader onClose={() => setOpen(false)} />

            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3" role="log" aria-live="polite">
              {messages.map((message, index) => {
                if (message.role === "assistant" && !message.content && pending) {
                  return (
                    <div key={index} className="flex justify-start" aria-label="Beacon AI is replying">
                      <div className="rounded-2xl bg-surface-elevated px-3 py-2">
                        <LighthouseSpinner size={28} label="Thinking" />
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
              {slots.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {slots.map((slot) => (
                    <button
                      key={`${slot.date}-${slot.time}`}
                      type="button"
                      disabled={pending}
                      onClick={() => void bookSlot(slot)}
                      className="rounded-full bg-surface-elevated px-2.5 py-1 text-[11px] text-foreground hover:text-accent disabled:opacity-50"
                    >
                      {slot.label}
                    </button>
                  ))}
                </div>
              )}
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

      {fabLayout && (
        <div
          className="fixed z-[118]"
          style={{
            top: fabLayout.y,
            left: fabLayout.side === "left" ? fabLayout.x : "auto",
            right: fabLayout.side === "right" ? fabLayout.rightInset : "auto",
          }}
        >
          <AssistantFabButton mode={fabLayout.mode} onClick={openChat} />
        </div>
      )}
    </>
  );
}
