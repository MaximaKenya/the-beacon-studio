/**
 * One set of wave shapes for both themes.
 * Fills read --wave-1..4, so dark indigo and light mint share the geometry.
 */
export function WaveField() {
  return (
    <div className="wave-field" aria-hidden>
      <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="beacon-wave-blur" x="-45%" y="-45%" width="190%" height="190%">
            <feGaussianBlur stdDeviation="64" />
          </filter>
        </defs>
        <g filter="url(#beacon-wave-blur)">
          <path
            fill="var(--wave-1)"
            d="M-120 280C140 60 300 340 560 190C820 40 980 300 1220 160C1380 70 1520 210 1580 140L1580-120H-120Z"
          />
          <path
            fill="var(--wave-2)"
            d="M-120 470C180 300 360 560 660 420C960 280 1120 520 1400 390C1520 330 1580 420 1600 370L1600 560C1360 700 1100 460 800 590C480 730 220 500-120 640Z"
          />
          <path
            fill="var(--wave-3)"
            d="M-120 640C100 500 300 800 560 700C820 600 900 840 1180 750C1360 690 1520 860 1600 780V1020H-120Z"
          />
          <ellipse cx="1260" cy="150" rx="320" ry="210" fill="var(--wave-2)" />
          <ellipse cx="180" cy="800" rx="400" ry="250" fill="var(--wave-3)" />
          <ellipse cx="780" cy="470" rx="340" ry="150" fill="var(--wave-4)" />
        </g>
      </svg>
    </div>
  );
}
