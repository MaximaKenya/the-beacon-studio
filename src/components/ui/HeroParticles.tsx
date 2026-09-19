"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

type Particle = {
  x: number;
  y: number;
  speed: number;
  opacity: number;
  char: string;
  drift: number;
  hue: number;
  twinkle: number;
};

const CODE_CHARS = "01{}[]<>/=;constletfn=>✦";

const HUES = [174, 330, 45, 270];

export function HeroParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let particles: Particle[] = [];
    let tick = 0;

    const resize = () => {
      const dpr = window.devicePixelRatio;
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.floor((canvas.offsetWidth * canvas.offsetHeight) / 18000);
      particles = Array.from({ length: Math.min(count, 45) }, () => ({
        x: Math.random() * canvas.offsetWidth,
        y: Math.random() * canvas.offsetHeight,
        speed: 0.3 + Math.random() * 0.8,
        opacity: 0.08 + Math.random() * 0.22,
        char: CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]!,
        drift: (Math.random() - 0.5) * 0.4,
        hue: HUES[Math.floor(Math.random() * HUES.length)]!,
        twinkle: Math.random() * Math.PI * 2,
      }));
    };

    const draw = () => {
      tick += 1;
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

      for (const p of particles) {
        const twinkle = 0.75 + 0.25 * Math.sin(tick * 0.03 + p.twinkle);
        ctx.font = `${12 + Math.sin(p.twinkle) * 2}px monospace`;
        ctx.fillStyle = `hsla(${p.hue}, 75%, 65%, ${p.opacity * twinkle})`;
        ctx.fillText(p.char, p.x, p.y);
        p.y += p.speed;
        p.x += p.drift;
        if (p.y > canvas.offsetHeight + 10) {
          p.y = -10;
          p.x = Math.random() * canvas.offsetWidth;
          p.char = CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]!;
        }
        if (p.x < -10) p.x = canvas.offsetWidth + 10;
        if (p.x > canvas.offsetWidth + 10) p.x = -10;
      }

      animationId = requestAnimationFrame(draw);
    };

    resize();
    draw();

    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, [reducedMotion]);

  if (reducedMotion) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full opacity-50"
      aria-hidden
    />
  );
}
