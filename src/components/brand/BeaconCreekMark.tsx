import { useId } from "react";

export type BeaconCreekMarkVariant = "static" | "intro" | "loop";

type BeaconCreekMarkProps = {
  size?: number;
  className?: string;
  /** static: header/icons. intro: splash (rise, light, beam, creek). loop: loaders (gentle creek shimmer). */
  variant?: BeaconCreekMarkVariant;
  /** Accessible label; omit to hide from assistive tech. */
  label?: string;
};

/**
 * Beacon Creek motion. Colors follow the theme: teal on light, purple on dark.
 * All motion sits inside prefers-reduced-motion: no-preference, so reduced motion gets the static mark.
 */
export const BEACON_CREEK_MOTION = `
.bcm { --bc-a:#a78bfa; --bc-b:#6d28d9; --bc-w1:#ddd6fe; --bc-w2:#8b5cf6; }
[data-theme="light"] .bcm { --bc-a:#2dd4bf; --bc-b:#0f766e; --bc-w1:#99f6e4; --bc-w2:#14b8a6; }
.bcm * { transform-box: fill-box; }
@media (prefers-reduced-motion: no-preference) {
  .bcm-intro .bcm-tower { transform-origin: 50% 100%; animation: bcm-rise .7s cubic-bezier(.2,.8,.2,1) both; }
  .bcm-intro .bcm-lamp { animation: bcm-light .4s ease .5s both; }
  .bcm-intro .bcm-beam { transform-origin: 50% 50%; animation: bcm-sweep .8s ease-out .7s both; }
  .bcm-intro .bcm-creek { transform-origin: 30% 0%; animation: bcm-flow .7s ease-out .85s both; }
  .bcm-intro .bcm-glint { animation: bcm-light .4s ease 1.4s both; }
  .bcm-loop .bcm-shimmer, .bcm-intro .bcm-shimmer { animation: bcm-shimmer 2.4s ease-in-out infinite; }
  .bcm-loop .bcm-beam { animation: bcm-pulse 2.4s ease-in-out infinite; }
}
@keyframes bcm-rise { from { opacity:0; transform: translateY(18%) scaleY(.6); } to { opacity:1; transform:none; } }
@keyframes bcm-light { from { opacity:0; } to { opacity:1; } }
@keyframes bcm-sweep { 0% { opacity:0; transform: scaleX(.1); } 60% { opacity:1; transform: scaleX(1.08); } 100% { opacity:1; transform: none; } }
@keyframes bcm-flow { from { opacity:0; transform: translateY(-10%) scaleY(.3); } to { opacity:1; transform:none; } }
@keyframes bcm-shimmer { 0%,100% { opacity:.55; transform: translateX(0); } 50% { opacity:1; transform: translateX(6%); } }
@keyframes bcm-pulse { 0%,100% { opacity:.65; } 50% { opacity:1; } }
`;

export function BeaconCreekMark({ size = 64, className = "", variant = "static", label }: BeaconCreekMarkProps) {
  const id = useId().replace(/:/g, "");
  const t = `bcT${id}`;
  const w = `bcW${id}`;
  const g = `bcG${id}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      className={`bcm bcm-${variant} ${className}`}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {variant === "static" ? null : <style>{BEACON_CREEK_MOTION}</style>}
      <defs>
        <linearGradient id={t} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" style={{ stopColor: "var(--bc-a, #a78bfa)" }} />
          <stop offset="1" style={{ stopColor: "var(--bc-b, #6d28d9)" }} />
        </linearGradient>
        <linearGradient id={w} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" style={{ stopColor: "var(--bc-w1, #ddd6fe)" }} />
          <stop offset="1" style={{ stopColor: "var(--bc-w2, #8b5cf6)" }} />
        </linearGradient>
        <radialGradient id={g} cx="32" cy="17" r="26" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fde68a" stopOpacity=".9" />
          <stop offset="1" stopColor="#fde68a" stopOpacity="0" />
        </radialGradient>
      </defs>
      <path className="bcm-beam" d="M32 17 L4 9 Q2 17 4 25 Z M32 17 L60 9 Q62 17 60 25 Z" fill={`url(#${g})`} />
      <g className="bcm-tower">
        <circle cx="32" cy="6.5" r="1.6" fill={`url(#${t})`} />
        <path d="M25.5 14 Q32 5 38.5 14 Z" fill={`url(#${t})`} />
        <rect x="24" y="20" width="16" height="3" rx="1.5" fill={`url(#${t})`} />
        <path d="M27 23 H37 L39.6 43 Q40 45.5 37.5 45.5 H26.5 Q24 45.5 24.4 43 Z" fill={`url(#${t})`} />
        <path d="M26.2 29.5 H37.8 L38.4 34 H25.6 Z" fill="#fff" fillOpacity=".85" />
        <rect x="30" y="38.5" width="4" height="7" rx="2" fill="#fff" fillOpacity=".9" />
        <ellipse cx="32" cy="46" rx="10" ry="1.6" fill={`url(#${t})`} fillOpacity=".35" />
        <path d="M13 59 q-1.5-5 .5-9.5 M16 59 q.3-4 2.6-6.6 M10.5 59 q-.6-3 -2-5" fill="none" stroke={`url(#${t})`} strokeWidth="1.3" strokeLinecap="round" />
      </g>
      <g className="bcm-lamp">
        <rect x="27" y="13.5" width="10" height="7" rx="2.2" fill="#fde68a" />
        <circle cx="32" cy="17" r="2.2" fill="#fbbf24" />
      </g>
      <g className="bcm-creek">
        <path d="M29.5 46 C21 48.5 16.5 52.5 23.5 55.5 C30 58 39 57 35 63.5 H48 C52 56 39 53 31.5 51.8 C27.5 51 29.5 48 34.5 46 Z" fill={`url(#${w})`} />
        <path className="bcm-shimmer" d="M24.5 52.6 C26 54 29 54.6 32 55" fill="none" stroke="#fff" strokeOpacity=".85" strokeWidth="1.1" strokeLinecap="round" />
        <g className="bcm-glint">
          <path className="bcm-shimmer" d="M39 59.2 h4" stroke="#fde68a" strokeWidth="1.3" strokeLinecap="round" />
          <path d="M40.6 61.5 h2.4" stroke="#fde68a" strokeOpacity=".7" strokeWidth="1" strokeLinecap="round" />
        </g>
        <ellipse cx="45" cy="49.6" rx="2.3" ry="1.5" fill={`url(#${t})`} fillOpacity=".55" />
        <ellipse cx="50" cy="51.8" rx="1.5" ry="1.05" fill={`url(#${t})`} fillOpacity=".4" />
      </g>
    </svg>
  );
}
