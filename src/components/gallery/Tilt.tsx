"use client";

import { useRef, type ReactNode } from "react";

/** Pointer-driven 3D tilt + parallax via CSS vars. Mouse/pen only; off for reduced motion. */
export function Tilt({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const frame = useRef(0);
  return (
    <div
      ref={ref}
      className={`pg-tilt ${className}`}
      onPointerMove={(e) => {
        if (e.pointerType === "touch") return;
        const el = ref.current;
        if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        cancelAnimationFrame(frame.current);
        frame.current = requestAnimationFrame(() => {
          el.style.setProperty("--tx", x.toFixed(3));
          el.style.setProperty("--ty", y.toFixed(3));
        });
      }}
      onPointerLeave={() => {
        ref.current?.style.setProperty("--tx", "0");
        ref.current?.style.setProperty("--ty", "0");
      }}
    >
      {children}
    </div>
  );
}
