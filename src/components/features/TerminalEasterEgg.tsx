"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Terminal, X } from "lucide-react";
import { siteConfig } from "@/data/site";
import { getKnowledgeResponse } from "@/lib/knowledge-base";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const KONAMI = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

type Line = { type: "input" | "output" | "system"; text: string };

function runCommand(cmd: string): string {
  const c = cmd.trim().toLowerCase();
  if (c === "help") {
    return "Commands: products, status, hire, stack, about, skills, contact, book, clear, exit";
  }
  if (c === "clear") return "__CLEAR__";
  if (c === "exit") return "__EXIT__";

  if (c === "products") {
    return siteConfig.products
      .map(
        (p) =>
          `• ${p.name} [${p.status}] — ${p.tagline}`
      )
      .join("\n");
  }

  if (c === "status") {
    return siteConfig.products
      .map((p) => `• ${p.name}: ${p.operationalStatus}`)
      .join("\n");
  }

  if (c === "stack") {
    return siteConfig.techStack
      .map((t) => `• ${t.name} (${t.category})`)
      .join("\n");
  }

  if (["about", "skills", "hire", "projects", "contact", "book"].includes(c)) {
    const prompts: Record<string, string> = {
      about: "Tell me about yourself",
      skills: "What technologies do you use?",
      hire: "How can I hire you?",
      projects: "What do you build?",
      contact: "How can I contact you?",
      book: "How do I book a call?",
    };
    return getKnowledgeResponse(prompts[c]).reply;
  }

  return `Unknown command: ${cmd}. Type 'help' for options.`;
}

export function TerminalEasterEgg() {
  const [open, setOpen] = useState(false);
  const [lines, setLines] = useState<Line[]>([
    { type: "system", text: `${siteConfig.brand.name} studio console` },
    { type: "system", text: "Type 'help' for commands: products, status, hire, stack" },
  ]);
  const [input, setInput] = useState("");
  const indexRef = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
        if (!open) return;
      }

      if (e.key === KONAMI[indexRef.current]) {
        indexRef.current += 1;
        if (indexRef.current === KONAMI.length) {
          indexRef.current = 0;
          setOpen(true);
        }
      } else {
        indexRef.current = e.key === KONAMI[0] ? 1 : 0;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cmd = input.trim();
    if (!cmd) return;

    setLines((prev) => [...prev, { type: "input", text: `$ ${cmd}` }]);
    setInput("");

    const result = runCommand(cmd);
    if (result === "__CLEAR__") {
      setLines([{ type: "system", text: "Terminal cleared." }]);
      return;
    }
    if (result === "__EXIT__") {
      setOpen(false);
      return;
    }
    setLines((prev) => [...prev, { type: "output", text: result }]);
  }

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-[200] flex items-end justify-center bg-background/80 p-4 backdrop-blur-sm sm:items-center"
          role="dialog"
          aria-label="Studio console"
        >
          <motion.div
            {...(reducedMotion
              ? {}
              : {
                  initial: { opacity: 0, y: 20 },
                  animate: { opacity: 1, y: 0 },
                  exit: { opacity: 0, y: 20 },
                })}
            className="flex h-[min(420px,70vh)] w-full max-w-lg flex-col overflow-hidden rounded-lg border border-border bg-[#0d1117] font-mono text-sm shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-2">
              <span className="flex items-center gap-2 text-xs text-accent">
                <Terminal className="h-3.5 w-3.5" />
                beacon://console
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded p-1 text-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                aria-label="Close console"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 text-emerald-400/90">
              {lines.map((line, i) => (
                <p
                  key={i}
                  className={`mb-1 whitespace-pre-wrap ${
                    line.type === "input"
                      ? "text-accent"
                      : line.type === "system"
                        ? "text-muted"
                        : "text-emerald-300/90"
                  }`}
                >
                  {line.text}
                </p>
              ))}
            </div>
            <form onSubmit={handleSubmit} className="border-t border-border p-3">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full bg-transparent text-accent outline-none placeholder:text-muted/50 focus-visible:ring-0"
                placeholder="products | status | hire | stack"
                spellCheck={false}
                aria-label="Console command"
              />
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
