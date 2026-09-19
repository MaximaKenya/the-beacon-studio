/** Lightweight confetti burst — respects reduced motion via caller. */
export function fireConfetti(durationMs = 1200): void {
  if (typeof window === "undefined") return;

  const colors = ["#22d3ee", "#fb7185", "#fbbf24", "#a78bfa", "#34d399"];
  const container = document.createElement("div");
  container.setAttribute("aria-hidden", "true");
  container.style.cssText =
    "pointer-events:none;position:fixed;inset:0;z-index:9999;overflow:hidden";
  document.body.appendChild(container);

  const count = 48;
  for (let i = 0; i < count; i++) {
    const piece = document.createElement("span");
    const size = 6 + Math.random() * 6;
    piece.style.cssText = `
      position:absolute;
      left:${45 + Math.random() * 10}%;
      top:40%;
      width:${size}px;
      height:${size * 0.6}px;
      background:${colors[i % colors.length]};
      border-radius:2px;
      opacity:0.9;
      transform:rotate(${Math.random() * 360}deg);
      animation:confetti-fall ${0.8 + Math.random() * 0.6}s ease-out forwards;
      animation-delay:${Math.random() * 0.15}s;
    `;
    container.appendChild(piece);
  }

  if (!document.getElementById("confetti-keyframes")) {
    const style = document.createElement("style");
    style.id = "confetti-keyframes";
    style.textContent = `
      @keyframes confetti-fall {
        0% { transform: translateY(0) rotate(0deg); opacity: 1; }
        100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }

  setTimeout(() => container.remove(), durationMs);
}
