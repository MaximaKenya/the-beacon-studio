"use client";

import { openAdminCompose } from "@/lib/admin-compose";
import { telHref, whatsappHrefFor } from "@/lib/lead-extract";

export function LeadPhoneLinks({ phone }: { phone: string }) {
  const value = phone.trim();
  const tel = telHref(value);
  const whatsapp = whatsappHrefFor(value);
  if (!value || value === "—" || !tel) return <span>{value || "—"}</span>;
  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <a href={tel} className="font-medium text-accent underline">
        {value}
      </a>
      {whatsapp && (
        <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-accent">
          WhatsApp
        </a>
      )}
    </span>
  );
}

export function LeadEmailButton({ email, subject = "" }: { email: string; subject?: string }) {
  const value = email.trim();
  if (!value || value === "—") return <span>—</span>;
  return (
    <button
      type="button"
      className="font-medium text-accent underline"
      onClick={() => openAdminCompose(value, subject)}
    >
      {value}
    </button>
  );
}
