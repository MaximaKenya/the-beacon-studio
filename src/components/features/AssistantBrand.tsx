"use client";

import { X } from "lucide-react";
import { BeaconMark } from "@/components/brand/BeaconMark";
import {
  ASSISTANT_BRAND_NAME,
  ASSISTANT_DIALOG_LABEL,
  ASSISTANT_SUBTITLE,
  type AssistantFabMode,
} from "@/components/features/assistant-fab";

export function AssistantPanelHeader({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3">
      <div className="flex min-w-0 items-center gap-2.5">
        <BeaconMark size={34} className="shrink-0" />
        <div className="min-w-0">
          <p className="truncate font-display text-sm font-semibold leading-tight text-heading">
            {ASSISTANT_BRAND_NAME}
          </p>
          <p className="text-[10px] font-medium leading-tight text-muted">{ASSISTANT_SUBTITLE}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="rounded-xl p-1.5 text-muted hover:bg-surface hover:text-heading"
        aria-label={`Close ${ASSISTANT_BRAND_NAME}`}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

const fabSizeClass: Record<AssistantFabMode, string> = {
  pill: "h-[52px] w-[244px] gap-2.5 py-1 pl-1.5 pr-4",
  compact: "h-[48px] w-[204px] gap-1.5 py-1 pl-1 pr-3",
  expanded: "assistant-fab-expand h-[48px] w-[204px] gap-1.5 py-1 pl-1 pr-3",
  mark: "h-[52px] w-[52px]",
};

export function AssistantFabButton({
  mode,
  onClick,
}: {
  mode: AssistantFabMode;
  onClick: () => void;
}) {
  const named = mode !== "mark";
  const markSize = mode === "pill" ? 30 : 26;

  return (
    <button
      type="button"
      data-assistant-fab=""
      data-assistant-fab-mode={mode}
      onClick={onClick}
      aria-label={ASSISTANT_DIALOG_LABEL}
      className={`sleek-card inline-flex touch-manipulation items-center rounded-full text-heading ${
        named ? "justify-start" : "justify-center"
      } ${fabSizeClass[mode]}`}
    >
      <BeaconMark size={markSize} className="shrink-0" />
      {named ? (
        <span
          data-assistant-name=""
          className={`whitespace-nowrap font-display font-semibold leading-none ${
            mode === "pill" ? "text-sm" : "text-[12.5px]"
          }`}
        >
          {ASSISTANT_BRAND_NAME}
        </span>
      ) : (
        <span className="sr-only">{ASSISTANT_BRAND_NAME}</span>
      )}
      </button>
  );
}
