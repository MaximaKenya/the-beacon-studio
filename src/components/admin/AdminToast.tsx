"use client";

import { useState } from "react";

export function useAdminToast() {
  const [toast, setToast] = useState<string | null>(null);
  function flash(message: string) {
    setToast(message);
    window.setTimeout(() => {
      setToast((current) => (current === message ? null : current));
    }, 4200);
  }
  return { toast, flash };
}

export function AdminToast({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div
      role="status"
      className="fixed bottom-4 right-4 z-[120] max-w-sm rounded-2xl border border-accent/40 bg-surface-elevated px-4 py-3 text-sm text-foreground shadow-2xl"
    >
      {message}
    </div>
  );
}
