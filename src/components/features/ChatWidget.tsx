"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, GripVertical, Send, X } from "lucide-react";
import { siteConfig } from "@/data/site";
import { useFeatures } from "@/providers/FeatureProvider";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { trackEvent } from "@/lib/analytics";
import { getKnowledgeResponse } from "@/lib/knowledge-base";
import { AnimatedIcon, FabPulse } from "@/components/ui/AnimatedIcon";
import { ChatMessageContent } from "@/components/features/ChatMessageContent";
import { parseResponseJson } from "@/lib/safe-json";

type Message = { role: "user" | "assistant"; content: string };

const KB_TYPING_MS = 220;
const FAB_POS_KEY = "beacon-glow-fab-pos";

type FabPos = { x: number; y: number };

function loadFabPos(): FabPos | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(FAB_POS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as FabPos;
    if (typeof parsed.x === "number" && typeof parsed.y === "number") return parsed;
  } catch {
    /* ignore */
  }
  return null;
}

function clampPos(x: number, y: number): FabPos {
  const pad = 12;
  const size = 56;
  const maxX = Math.max(pad, window.innerWidth - size - pad);
  const maxY = Math.max(pad, window.innerHeight - size - pad);
  return {
    x: Math.min(maxX, Math.max(pad, x)),
    y: Math.min(maxY, Math.max(pad, y)),
  };
}

export function ChatWidget() {
  const { chatOpen, closeChat, openChat, chatInitialMessage } = useFeatures();
  const reducedMotion = useReducedMotion();
  const trapRef = useFocusTrap(chatOpen);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);

  const [fabPos, setFabPos] = useState<FabPos | null>(null);
  const fabPosRef = useRef<FabPos | null>(null);
  const dragRef = useRef<{
    active: boolean;
    moved: boolean;
    ox: number;
    oy: number;
    startX: number;
    startY: number;
  } | null>(null);

  useEffect(() => {
    const saved = loadFabPos();
    const next = saved
      ? clampPos(saved.x, saved.y)
      : clampPos(window.innerWidth - 80, window.innerHeight - 88);
    fabPosRef.current = next;
    setFabPos(next);
  }, []);

  useEffect(() => {
    function onResize() {
      setFabPos((prev) => {
        if (!prev) return prev;
        const next = clampPos(prev.x, prev.y);
        fabPosRef.current = next;
        return next;
      });
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const onPointerDown = useCallback(
    (e: ReactPointerEvent) => {
      if (!fabPos) return;
      const target = e.currentTarget as HTMLElement;
      target.setPointerCapture(e.pointerId);
      dragRef.current = {
        active: true,
        moved: false,
        ox: e.clientX - fabPos.x,
        oy: e.clientY - fabPos.y,
        startX: e.clientX,
        startY: e.clientY,
      };
    },
    [fabPos]
  );

  const onPointerMove = useCallback((e: ReactPointerEvent) => {
    const d = dragRef.current;
    if (!d?.active) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) d.moved = true;
    const next = clampPos(e.clientX - d.ox, e.clientY - d.oy);
    fabPosRef.current = next;
    setFabPos(next);
  }, []);

  const onPointerUp = useCallback(
    (e: ReactPointerEvent) => {
      const d = dragRef.current;
      dragRef.current = null;
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
      if (!d) return;
      if (d.moved && fabPosRef.current) {
        localStorage.setItem(FAB_POS_KEY, JSON.stringify(fabPosRef.current));
        return;
      }
      openChat();
      trackEvent("chat_open");
    },
    [openChat]
  );

  useEffect(() => {
    if (chatOpen && messages.length === 0) {
      setMessages([{ role: "assistant", content: siteConfig.assistant.greeting }]);
    }
  }, [chatOpen, messages.length]);

  useEffect(() => {
    if (chatOpen && chatInitialMessage) {
      setInput(chatInitialMessage);
    }
  }, [chatOpen, chatInitialMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
  }, [messages, typing, reducedMotion]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || typing) return;

    const userMsg: Message = { role: "user", content: trimmed };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setTyping(true);
    trackEvent("chat_message", { length: trimmed.length });

    const local = getKnowledgeResponse(trimmed);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await parseResponseJson<{ reply?: string; message?: string }>(res, {});
      const reply =
        (typeof data.reply === "string" && data.reply) ||
        (typeof data.message === "string" && data.message) ||
        local.reply;

      await new Promise((r) => setTimeout(r, reducedMotion ? 0 : KB_TYPING_MS));
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      await new Promise((r) => setTimeout(r, reducedMotion ? 0 : KB_TYPING_MS));
      setMessages((prev) => [...prev, { role: "assistant", content: local.reply }]);
    } finally {
      setTyping(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  if (!siteConfig.assistant.enabled) return null;

  const panelMotion = reducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 16, scale: 0.98 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: 16, scale: 0.98 },
      };

  const panelStyle =
    fabPos && chatOpen
      ? {
          left: Math.min(fabPos.x, typeof window !== "undefined" ? window.innerWidth - 420 : fabPos.x),
          bottom: Math.max(
            24,
            typeof window !== "undefined" ? window.innerHeight - fabPos.y + 8 : 96
          ),
          right: "auto" as const,
          top: "auto" as const,
        }
      : undefined;

  return (
    <>
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            ref={trapRef}
            {...panelMotion}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="glass-panel fixed z-[260] flex max-h-[min(520px,calc(100vh-7rem))] w-[min(400px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl shadow-2xl"
            style={
              panelStyle ?? {
                bottom: "6rem",
                right: "1rem",
              }
            }
            role="dialog"
            aria-label={`Chat with ${siteConfig.assistant.name}`}
            aria-modal="true"
          >
            <div className="flex items-center justify-between border-b border-border bg-surface/50 px-4 py-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-violet">
                  <Bot className="h-4 w-4 text-background" aria-hidden />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {siteConfig.assistant.name}
                  </p>
                  <p className="text-[10px] text-muted">Studio answers · products & services</p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeChat}
                className="rounded-lg p-1.5 text-muted hover:bg-surface hover:text-foreground"
                aria-label="Close chat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div
              className="flex-1 space-y-3 overflow-y-auto p-4"
              role="log"
              aria-live="polite"
              aria-relevant="additions"
            >
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-accent text-background"
                        : "border border-border bg-surface text-foreground"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <ChatMessageContent content={msg.content} />
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              ))}
              {typing && (
                <div className="flex justify-start" aria-label="Assistant is typing">
                  <div className="flex gap-1 rounded-2xl border border-border bg-surface px-4 py-3">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted [animation-delay:0ms]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted [animation-delay:150ms]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted [animation-delay:300ms]" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {messages.length <= 1 && (
              <div className="flex flex-wrap gap-1.5 border-t border-border px-4 py-2">
                {siteConfig.assistant.suggestedQuestions.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => sendMessage(q)}
                    disabled={typing}
                    className="rounded-full border border-border bg-surface/50 px-2.5 py-1 text-[11px] text-muted transition-colors hover:border-accent/30 hover:text-accent disabled:opacity-50"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            <form onSubmit={handleSubmit} className="border-t border-border p-3">
              <div className="flex gap-2">
                <label htmlFor="chat-input" className="sr-only">
                  Message
                </label>
                <input
                  id="chat-input"
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about products, pricing, or a brief…"
                  disabled={typing}
                  className="flex-1 rounded-xl border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted/50 focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={typing || !input.trim()}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent text-background transition-colors hover:bg-accent-hover disabled:opacity-40"
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" aria-hidden />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {!chatOpen && fabPos && (
        <FabPulse
          color="violet"
          className="fixed z-[250]"
          style={{ left: fabPos.x, top: fabPos.y, right: "auto", bottom: "auto" }}
        >
          <button
            type="button"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            className="relative flex h-14 w-14 touch-none items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-violet text-background shadow-lg shadow-accent/30 transition-transform hover:scale-105 active:scale-95"
            aria-label={`Open chat with ${siteConfig.assistant.name} (drag to move)`}
            title="Drag to move · click to open Glow"
          >
            <GripVertical
              className="pointer-events-none absolute left-1 top-1 h-3 w-3 opacity-50"
              aria-hidden
            />
            <AnimatedIcon
              icon={Bot}
              size="lg"
              animation="none"
              className="text-background"
              strokeWidth={1.75}
            />
          </button>
        </FabPulse>
      )}
    </>
  );
}
