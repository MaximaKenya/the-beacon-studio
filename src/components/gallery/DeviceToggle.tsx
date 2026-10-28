"use client";

import { LayoutGrid, Monitor, Smartphone } from "lucide-react";
import type { ProductShot } from "@/data/product-shots";

export type DeviceFilter = "all" | "desktop" | "mobile";

const OPTIONS = [
  { id: "all", label: "All", Icon: LayoutGrid },
  { id: "desktop", label: "Desktop", Icon: Monitor },
  { id: "mobile", label: "Mobile", Icon: Smartphone },
] as const;

export function filterByDevice(shots: ProductShot[], device: DeviceFilter): ProductShot[] {
  return device === "all" ? shots : shots.filter((s) => s.device === device);
}

/** Segmented pill: All / Desktop / Mobile with a sliding thumb. Always rendered, so it is easy to find. */
export function DeviceToggle({
  value,
  onChange,
  shots,
  size = "md",
  className = "",
  label = "Show screens for",
}: {
  value: DeviceFilter;
  onChange: (v: DeviceFilter) => void;
  shots?: ProductShot[];
  size?: "sm" | "md";
  className?: string;
  label?: string;
}) {
  const idx = OPTIONS.findIndex((o) => o.id === value);
  return (
    <div
      className={`dev-toggle dev-toggle-${size} ${className}`}
      role="radiogroup"
      aria-label={label}
      data-active={idx}
      onKeyDown={(e) => {
        if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
        e.preventDefault();
        e.stopPropagation();
        const n = (idx + (e.key === "ArrowRight" ? 1 : -1) + OPTIONS.length) % OPTIONS.length;
        onChange(OPTIONS[n].id);
        (e.currentTarget.children[n + 1] as HTMLElement | undefined)?.focus();
      }}
    >
      <span className="dev-toggle-thumb" aria-hidden />
      {OPTIONS.map(({ id, label: text, Icon }) => {
        const count = shots ? filterByDevice(shots, id).length : null;
        const disabled = count === 0;
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={value === id}
            tabIndex={value === id ? 0 : -1}
            disabled={disabled}
            className="dev-toggle-btn"
            onClick={() => onChange(id)}
          >
            <Icon className="dev-toggle-icon" aria-hidden />
            <span>{text}</span>
            {count !== null && size === "md" ? <span className="dev-toggle-count">{count}</span> : null}
          </button>
        );
      })}
    </div>
  );
}
