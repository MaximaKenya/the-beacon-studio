"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export function AnimatedBackground({ subtle = false }: { subtle?: boolean }) {
  const reducedMotion = useReducedMotion();

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div
        className={`absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,var(--aurora-1),transparent)] ${subtle ? "opacity-60" : ""}`}
      />
      <div
        className={`absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_80%_50%,var(--aurora-2),transparent)] ${subtle ? "opacity-50" : ""}`}
      />
      <div
        className={`absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_20%_80%,var(--aurora-3),transparent)] ${subtle ? "opacity-50" : ""}`}
      />

      {reducedMotion || subtle ? (
        <>
          <div
            className={`absolute -left-1/4 top-1/4 h-[480px] w-[480px] rounded-full blur-[110px] ${subtle ? "bg-accent/[0.06]" : "bg-accent/12"}`}
          />
          <div
            className={`absolute -right-1/4 bottom-1/4 h-[400px] w-[400px] rounded-full blur-[100px] ${subtle ? "bg-accent-warm/[0.05]" : "bg-accent-warm/10"}`}
          />
          <div
            className={`absolute left-1/3 top-1/2 h-[340px] w-[340px] rounded-full blur-[90px] ${subtle ? "bg-accent-violet/[0.04]" : "bg-accent-violet/8"}`}
          />
        </>
      ) : (
        <>
          <motion.div
            className="aurora-blob absolute -left-1/4 top-1/4 h-[480px] w-[480px] rounded-full bg-accent/12 blur-[110px]"
            animate={{ x: [0, 20, 6, 0], y: [0, -14, -6, 0], scale: [1, 1.03, 1.01, 1] }}
            transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="aurora-blob-delayed absolute -right-1/4 bottom-1/4 h-[400px] w-[400px] rounded-full bg-accent-warm/10 blur-[100px]"
            animate={{ x: [0, -18, -8, 0], y: [0, 12, 6, 0], scale: [1, 1.04, 1.02, 1] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />
          <motion.div
            className="absolute left-1/3 top-1/2 h-[340px] w-[340px] rounded-full bg-accent-violet/8 blur-[90px]"
            animate={{ x: [0, 12, -5, 0], y: [0, -10, 5, 0] }}
            transition={{ duration: 32, repeat: Infinity, ease: "easeInOut" }}
          />
        </>
      )}

      {!subtle && (
        <>
          <div
            className="mesh-grid absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)`,
              backgroundSize: "56px 56px",
            }}
          />
          <div className="dot-pattern absolute inset-0 hidden opacity-[0.025] md:block" aria-hidden />
        </>
      )}
    </div>
  );
}
