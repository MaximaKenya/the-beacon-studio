"use client";

import { useEffect, useState } from "react";
import { Calendar, Mail, Sparkles } from "lucide-react";
import { detectContactIntent } from "@/lib/contact-routing";
import { useFeatures } from "@/providers/FeatureProvider";

export function SmartContactRouter({ message }: { message: string }) {
  const { openBooking, openNewsletter } = useFeatures();
  const [intent, setIntent] = useState<ReturnType<typeof detectContactIntent>>(null);

  useEffect(() => {
    setIntent(detectContactIntent(message));
  }, [message]);

  if (!intent) return null;

  const suggestions = {
    book: {
      icon: Calendar,
      title: "Sounds like a call would be great",
      description: "Book a time directly — pick a slot that works for you.",
      action: "Book a call",
      onClick: openBooking,
      color: "text-accent",
    },
    email: {
      icon: Mail,
      title: "Email works well for this",
      description: "Your message form below will open your email client with everything filled in.",
      action: null,
      onClick: null,
      color: "text-accent-warm",
    },
    subscribe: {
      icon: Sparkles,
      title: "Stay in the loop",
      description: "Subscribe to get updates — no spam, just the good stuff.",
      action: "Subscribe",
      onClick: openNewsletter,
      color: "text-accent-violet",
    },
  } as const;

  const s = suggestions[intent];
  const Icon = s.icon;

  return (
    <div
      className="mb-4 flex items-start gap-3 rounded-xl border border-border bg-accent/5 px-4 py-3"
      role="status"
      aria-live="polite"
    >
      <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${s.color}`} aria-hidden />
      <div className="flex-1">
        <p className="text-sm font-medium text-foreground">{s.title}</p>
        <p className="mt-0.5 text-xs text-muted">{s.description}</p>
        {s.action && s.onClick && (
          <button
            type="button"
            onClick={s.onClick}
            className="mt-2 text-xs font-semibold text-accent hover:text-accent-hover"
          >
            {s.action} →
          </button>
        )}
      </div>
    </div>
  );
}
