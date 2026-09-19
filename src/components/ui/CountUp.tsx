"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

type CountUpProps = {
  value: string;
  suffix?: string;
  duration?: number;
  className?: string;
};

export function CountUp({ value, suffix = "", duration = 1.8, className = "" }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reducedMotion = useReducedMotion();
  const [display, setDisplay] = useState(value);

  const numeric = parseFloat(value.replace(/[^0-9.]/g, ""));
  const isNumeric = !Number.isNaN(numeric) && value !== "∞";

  useEffect(() => {
    if (!inView || !isNumeric || reducedMotion) {
      setDisplay(value);
      return;
    }

    let start: number | null = null;
    let frame: number;

    const step = (timestamp: number) => {
      if (start === null) start = timestamp;
      const progress = Math.min((timestamp - start) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(String(Math.round(eased * numeric)));
      if (progress < 1) frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [inView, isNumeric, numeric, value, duration, reducedMotion]);

  return (
    <span ref={ref} className={className}>
      {display}
      {suffix && <span className="text-accent">{suffix}</span>}
    </span>
  );
}
