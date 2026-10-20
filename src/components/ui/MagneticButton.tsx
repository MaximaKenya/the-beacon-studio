"use client";

import { useRef, useState, type ReactNode, type MouseEvent } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

type MagneticButtonProps = {
  children: ReactNode;
  className?: string;
  href?: string;
  onClick?: () => void;
  strength?: number;
};

/** CSS tilt instead of a motion library, so the hero does not load animation code. */
export function MagneticButton({
  children,
  className = "",
  href,
  onClick,
  strength = 0.14,
}: MagneticButtonProps) {
  const ref = useRef<HTMLAnchorElement & HTMLButtonElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const reducedMotion = useReducedMotion();

  const handleMove = (event: MouseEvent) => {
    if (reducedMotion || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    setOffset({ x: x * strength, y: y * strength });
  };

  const style = reducedMotion ? undefined : { transform: `translate(${offset.x}px, ${offset.y}px)` };
  const motionClass = reducedMotion ? "" : "transition-transform duration-150 hover:scale-[1.04] active:scale-[0.96]";

  if (href) {
    return (
      <a
        ref={ref as React.RefObject<HTMLAnchorElement>}
        href={href}
        className={`${className} ${motionClass}`}
        style={style}
        onMouseMove={handleMove}
        onMouseLeave={() => setOffset({ x: 0, y: 0 })}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      ref={ref as React.RefObject<HTMLButtonElement>}
      type="button"
      className={`${className} ${motionClass}`}
      style={style}
      onClick={onClick}
      onMouseMove={handleMove}
      onMouseLeave={() => setOffset({ x: 0, y: 0 })}
    >
      {children}
    </button>
  );
}
