/**
 * Logo concepts for The Beacon Studio.
 * Default shipped mark is Beacon Dot in BeaconMark.tsx — all four live on /brand.
 */

type ConceptProps = {
  size?: number;
  className?: string;
};

/** Soft studio badge — shared across marks. */
export const ROUNDED_TILE =
  "M11 4H21A7 7 0 0 1 28 11V21A7 7 0 0 1 21 28H11A7 7 0 0 1 4 21V11A7 7 0 0 1 11 4Z";

/* ─── Beacon Dot (SHIPPED) — custom B + signal disc ─── */

export const BEACON_DOT_STEM = "M10.1 8.1h3.7v15.8H10.1V8.1Z";
export const BEACON_DOT_LOWER =
  "M13.8 15.45h3.15c3.55 0 5.95 2 5.95 4.75 0 2.95-2.5 5.05-6.35 5.05H13.8V15.45Z";
export const BEACON_DOT_COUNTER =
  "M16.55 18.2c1.7 0 2.75.95 2.75 2.25s-1.05 2.25-2.75 2.25H13.8v-4.5h2.75Z";
export const BEACON_DOT_DISC_CX = 17.35;
export const BEACON_DOT_DISC_CY = 11.95;
export const BEACON_DOT_DISC_R = 4.45;
export const BEACON_DOT_DISC_PATH = `M${BEACON_DOT_DISC_CX} ${BEACON_DOT_DISC_CY}m-${BEACON_DOT_DISC_R} 0a${BEACON_DOT_DISC_R} ${BEACON_DOT_DISC_R} 0 1 0 ${BEACON_DOT_DISC_R * 2} 0a${BEACON_DOT_DISC_R} ${BEACON_DOT_DISC_R} 0 1 0 -${BEACON_DOT_DISC_R * 2} 0`;
export const BEACON_DOT_MONO = `${ROUNDED_TILE}${BEACON_DOT_STEM}${BEACON_DOT_LOWER}${BEACON_DOT_DISC_PATH}${BEACON_DOT_COUNTER}`;

/** Concept A (SHIPPED): Beacon Dot — custom geometric B; upper mass is a solid signal disc. */
export function MarkConceptBeaconDot({ size = 64, className = "" }: ConceptProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <path d={ROUNDED_TILE} fill="currentColor" />
      <path d={BEACON_DOT_STEM} fill="var(--accent)" />
      <path d={BEACON_DOT_LOWER} fill="var(--accent)" />
      <path d={BEACON_DOT_COUNTER} fill="currentColor" />
      <circle
        cx={BEACON_DOT_DISC_CX}
        cy={BEACON_DOT_DISC_CY}
        r={BEACON_DOT_DISC_R}
        fill="var(--accent)"
      />
    </svg>
  );
}

/* ─── Orbit Node (Concept B) ─── */

const ORBIT_ARCS = [
  "M22.4 9.85a7.6 7.6 0 1 0 0 12.3",
  "M20.75 11.2a5.5 5.5 0 1 0 0 9.6",
  "M19.1 12.55a3.4 3.4 0 1 0 0 6.9",
] as const;

/** Concept B: Orbit Node — concentric open arcs + solid teal node. Not arrow/mountain/lighthouse. */
export function MarkConceptOrbit({ size = 64, className = "" }: ConceptProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <path d={ROUNDED_TILE} fill="currentColor" />
      <g fill="none" stroke="#e2e8f0" strokeWidth="1.55" strokeLinecap="butt">
        {ORBIT_ARCS.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
      <circle cx="15.85" cy="16" r="2.4" fill="var(--accent)" />
    </svg>
  );
}

/* ─── Interlock BS (Concept C) ─── */

/** Concept C: Interlock BS — B and S sharing a spine. */
export function MarkConceptInterlock({ size = 64, className = "" }: ConceptProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <path d={ROUNDED_TILE} fill="currentColor" />
      <rect x="11.2" y="8.4" width="2.9" height="15.2" rx="0.4" fill="var(--accent)" />
      <path
        d="M14.1 8.4h4.2c2.55 0 4.15 1.45 4.15 3.55S20.85 15.5 18.3 15.5H14.1V8.4Z"
        fill="var(--accent)"
      />
      <path
        d="M16.3 10.55h1.7c1.05 0 1.65.55 1.65 1.4s-.6 1.4-1.65 1.4H14.1v-2.8h2.2Z"
        fill="currentColor"
      />
      <path
        d="M14.1 15.5h5.4c2.15 0 3.5 1.2 3.5 2.95 0 1.45-.9 2.45-2.35 2.85l2.55 2.9H19.4l-2.2-2.55H14.1V15.5Z"
        fill="var(--accent)"
      />
      <path
        d="M14.1 21.65h4.2c1.2 0 1.95.55 1.95 1.45s-.75 1.5-2 1.5H11.2v2.05h7.35c3.05 0 4.95-1.65 4.95-4.05 0-1.95-1.2-3.25-3.35-3.7l-1.5.05H14.1v2.7Z"
        fill="var(--accent)"
      />
    </svg>
  );
}

/* ─── Studio Seal (Concept D) ─── */

/** Concept D: Studio Seal — soft circular badge with teal signal + typography. */
export function MarkConceptSeal({ size = 64, className = "" }: ConceptProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <circle cx="16" cy="16" r="12.2" stroke="currentColor" strokeWidth="1.1" fill="none" />
      <circle cx="16" cy="16" r="10.4" stroke="currentColor" strokeWidth="0.55" fill="none" />
      <circle cx="16" cy="8.6" r="1.55" fill="var(--accent)" />
      <text
        x="16"
        y="13.2"
        textAnchor="middle"
        fill="currentColor"
        style={{ fontSize: "2.4px", fontWeight: 600, letterSpacing: "0.35px" }}
        fontFamily="system-ui, sans-serif"
      >
        THE
      </text>
      <text
        x="16"
        y="17.4"
        textAnchor="middle"
        fill="currentColor"
        style={{ fontSize: "4.6px", fontWeight: 700, letterSpacing: "-0.15px" }}
        fontFamily="Georgia, 'Times New Roman', serif"
      >
        BEACON
      </text>
      <text
        x="16"
        y="21.2"
        textAnchor="middle"
        fill="currentColor"
        style={{ fontSize: "2.6px", fontWeight: 600, letterSpacing: "0.85px" }}
        fontFamily="system-ui, sans-serif"
      >
        STUDIO
      </text>
      <path d="M11.5 23.1h9" stroke="currentColor" strokeWidth="0.55" strokeLinecap="round" />
      <circle cx="16" cy="24.85" r="0.55" fill="currentColor" />
    </svg>
  );
}

export const MARK_CONCEPTS = [
  {
    id: "beacon-dot",
    name: "Beacon Dot",
    status: "default" as const,
    blurb:
      "Custom geometric B with a solid signal disc as the upper mass — lettermark craft that doubles as an app tile. Ownable silhouette, sharp at 16px.",
    Mark: MarkConceptBeaconDot,
  },
  {
    id: "orbit",
    name: "Orbit Node",
    status: "alternate" as const,
    blurb:
      "Three open concentric arcs wrapping a teal node — abstract signal / focus. Not an arrow, mountain, or lighthouse.",
    Mark: MarkConceptOrbit,
  },
  {
    id: "interlock",
    name: "Interlock BS",
    status: "alternate" as const,
    blurb:
      "B and S sharing one spine as a solid geometric glyph — monogram lockup for tight UI and seals.",
    Mark: MarkConceptInterlock,
  },
  {
    id: "seal",
    name: "Studio Seal",
    status: "alternate" as const,
    blurb:
      "Soft circular studio badge: double ring, teal signal, stacked typography. Best at larger sizes (deck covers, print).",
    Mark: MarkConceptSeal,
  },
] as const;
