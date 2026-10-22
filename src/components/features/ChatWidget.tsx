"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { Send } from "lucide-react";
import { siteConfig } from "@/data/site";
import { useFeatures } from "@/providers/FeatureProvider";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { trackEvent } from "@/lib/analytics";
import { getKnowledgeResponse } from "@/lib/knowledge-base";
import { ChatMessageContent } from "@/components/features/ChatMessageContent";
import { parseResponseJson } from "@/lib/safe-json";
import { AssistantFabButton, AssistantPanelHeader } from "@/components/features/AssistantBrand";
import { showsPublicAssistant } from "@/components/features/assistant-fab";
import { useAssistantFabLayout, useAssistantPanelLayout } from "@/components/features/useAssistantChrome";

type Message = { role: "user" | "assistant"; content: string };

const KB_TYPING_MS = 220;

export function ChatWidget() {
  const pathname = usePathname();
  const { chatOpen, closeChat, openChat, chatInitialMessage } = useFeatures();
  const reducedMotion = useReducedMotion();
  const trapRef = useFocusTrap(chatOpen);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const fabLayout = useAssistantFabLayout(!showsPublicAssistant(pathname) && !chatOpen);
  const panelStyle = useAssistantPanelLayout(chatOpen);

  useEffect(() => {
    if (!chatOpen || messages.length > 0) return;
    const id = window.setTimeout(() => {
      setMessages([{ role: "assistant", content: siteConfig.assistant.greeting }]);
    }, 0);
    return () => window.clearTimeout(id);
  }, [chatOpen, messages.length]);

  useEffect(() => {
    if (!chatOpen || !chatInitialMessage) return;
    const id = window.setTimeout(() => setInput(chatInitialMessage), 0);
    return () => window.clearTimeout(id);
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

  return (
    <>
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            ref={trapRef}
            {...panelMotion}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            data-assistant-panel=""
            className="sleek-card fixed z-[119] flex flex-col overflow-hidden rounded-3xl"
            style={panelStyle}
            role="dialog"
            aria-label="The Beacon Studio AI assistant"
            aria-modal="true"
          >
            <AssistantPanelHeader onClose={closeChat} />

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
                        : "bg-surface text-foreground"
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
                  <div className="flex gap-1 rounded-2xl bg-surface px-4 py-3">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted [animation-delay:0ms]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted [animation-delay:150ms]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted [animation-delay:300ms]" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {messages.length <= 1 && (
              <div className="flex flex-wrap gap-1.5 px-4 py-2">
                {siteConfig.assistant.suggestedQuestions.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => sendMessage(q)}
                    disabled={typing}
                    className="rounded-full bg-surface/50 px-2.5 py-1 text-[11px] text-muted transition-colors hover:text-accent disabled:opacity-50"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-3">
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
                  className="field flex-1 px-3 py-2 text-sm placeholder:text-muted/50 disabled:opacity-60"
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

      {fabLayout && (
        <div
          className="fixed z-[118]"
          style={{
            top: fabLayout.y,
            left: fabLayout.side === "left" ? fabLayout.x : "auto",
            right: fabLayout.side === "right" ? fabLayout.rightInset : "auto",
          }}
        >
          <AssistantFabButton
            mode={fabLayout.mode}
            onClick={() => {
              openChat();
              trackEvent("chat_open");
            }}
          />
        </div>
      )}
    </>
  );
}
