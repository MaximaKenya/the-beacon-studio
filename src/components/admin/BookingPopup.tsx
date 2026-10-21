"use client";

import { useState, type ReactNode } from "react";
import { Loader2, X } from "lucide-react";
import type { InboxItem } from "@/lib/inbox";
import { LeadEmailButton, LeadPhoneLinks } from "@/components/admin/LeadContactLinks";

export function BookingPopup({
  item,
  busy,
  reply,
  onReplyChange,
  onConfirm,
  onDecline,
  onReschedule,
  onReply,
  onConvert,
  onClose,
  onDismiss,
}: {
  item: InboxItem;
  busy: boolean;
  reply: string;
  onReplyChange: (value: string) => void;
  onConfirm: () => void;
  onDecline: () => void;
  onReschedule: (input: { note: string; date: string; time: string }) => void;
  onReply: () => void;
  onConvert: () => void;
  onClose: () => void;
  onDismiss: () => void;
}) {
  const [note, setNote] = useState(item.rescheduleNote || "");
  const [date, setDate] = useState(item.date || "");
  const [time, setTime] = useState(item.time || "");

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center bg-background/60 p-4 sm:items-center"
      onClick={onDismiss}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-popup-title"
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-surface-elevated p-5 text-foreground shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="admin-kicker">Booking · {item.status}</p>
            <h3 id="booking-popup-title" className="mt-1 font-display text-xl font-semibold text-heading">
              {item.name}
            </h3>
          </div>
          <button
            type="button"
            onClick={onDismiss}
            className="rounded-lg p-2 text-muted hover:bg-surface"
            aria-label="Dismiss"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-3 space-y-1 text-sm">
          <p>
            <LeadEmailButton email={item.email} subject={`Re: ${item.meetingType || "Booking"}`} />
          </p>
          <p>
            <LeadPhoneLinks phone={item.phone} />
          </p>
          <p className="text-muted">
            {item.meetingType || "Call"}
            {item.date ? ` · ${item.date}` : ""}
            {item.time ? ` ${item.time}` : ""}
          </p>
          {item.convertedToLead && <p className="text-xs font-semibold text-accent">Saved as a lead</p>}
          <p className="whitespace-pre-wrap">{item.message}</p>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <label className="text-xs text-muted sm:col-span-1">
            Date
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="mt-1 w-full rounded-xl px-3 py-2 text-sm"
            />
          </label>
          <label className="text-xs text-muted">
            Time
            <input
              type="time"
              value={time}
              onChange={(event) => setTime(event.target.value)}
              className="mt-1 w-full rounded-xl px-3 py-2 text-sm"
            />
          </label>
          <label className="text-xs text-muted sm:col-span-3">
            Reschedule note
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={2}
              className="mt-1 w-full rounded-xl px-3 py-2 text-sm"
              placeholder="Why the time needs to move"
            />
          </label>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Action disabled={busy} onClick={onConfirm} primary>
            Confirm
          </Action>
          <Action
            disabled={busy}
            onClick={() => onReschedule({ note: note.trim() || "Reschedule requested", date, time })}
          >
            Reschedule
          </Action>
          <Action disabled={busy} onClick={onDecline}>
            Decline
          </Action>
          <Action disabled={busy} onClick={onConvert}>
            {item.convertedToLead ? "Update lead" : "Convert to lead"}
          </Action>
          <Action disabled={busy} onClick={onClose}>
            Close
          </Action>
        </div>

        <div className="mt-4 space-y-2">
          <label htmlFor="booking-reply" className="text-xs text-muted">
            Reply
          </label>
          <textarea
            id="booking-reply"
            rows={3}
            value={reply}
            onChange={(event) => onReplyChange(event.target.value)}
            placeholder="Write a reply the client can read in the portal…"
            className="w-full rounded-xl px-3 py-2 text-sm"
          />
          <Action disabled={busy} onClick={onReply} primary>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Reply
          </Action>
        </div>
      </div>
    </div>
  );
}

function Action({
  children,
  onClick,
  disabled,
  primary = false,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  primary?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex h-9 items-center gap-2 rounded-xl px-3 text-sm font-semibold disabled:opacity-50 ${
        primary ? "bg-accent text-background hover:bg-accent-hover" : "bg-surface text-foreground"
      }`}
    >
      {children}
    </button>
  );
}
