import clsx from "clsx";

/*
 * Hero illustration: a distribution board drawn in the brand palette.
 * Original artwork used in place of a stock photo until genuine PhaseForge
 * project photography is supplied (spec 5.1).
 */

const BLUE = "#3b9bff";
const LINE = "rgba(225,232,240,0.5)";
const FAINT = "rgba(225,232,240,0.16)";

const breakers = Array.from({ length: 8 }, (_, i) => i);
const tripped = new Set([2]);

export function HeroArt({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 440 460"
      className={clsx("h-auto w-full", className)}
      role="img"
      aria-label="Illustration of an electrical distribution board"
    >
      <defs>
        <linearGradient id="hero-panel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#15253f" />
          <stop offset="1" stopColor="#0b1628" />
        </linearGradient>
        <radialGradient id="hero-glow" cx="0.5" cy="0.4" r="0.55">
          <stop offset="0" stopColor="rgba(59,155,255,0.22)" />
          <stop offset="1" stopColor="rgba(59,155,255,0)" />
        </radialGradient>
        <pattern id="hero-grid" width="22" height="22" patternUnits="userSpaceOnUse">
          <path d="M22 0 H0 V22" fill="none" stroke="rgba(59,155,255,0.06)" strokeWidth="1" />
        </pattern>
      </defs>

      <rect width="440" height="460" fill="url(#hero-grid)" />
      <rect width="440" height="460" fill="url(#hero-glow)" />

      {/* Incoming supply cables */}
      <g fill="none" strokeLinecap="round" strokeWidth="5">
        <path d="M170 0 V70" stroke="#0aa0d6" />
        <path d="M200 0 V70" stroke="#3a7bd5" />
        <path d="M230 0 V70" stroke="#2b2b2b" />
        <path d="M260 0 V70" stroke="#3b9bff" />
      </g>

      {/* Enclosure */}
      <rect x="70" y="70" width="300" height="320" rx="18" fill="url(#hero-panel)" stroke={LINE} strokeWidth="2" />
      <rect x="92" y="92" width="256" height="40" rx="8" fill="none" stroke={FAINT} strokeWidth="2" />
      <text x="110" y="118" fill={BLUE} fontFamily="ui-monospace, monospace" fontSize="13" letterSpacing="2">
        MAIN · 230V
      </text>
      <circle cx="326" cy="112" r="6" fill={BLUE} className="pf-blink" />

      {/* DIN rail with breakers */}
      <rect x="92" y="156" width="256" height="112" rx="8" fill="rgba(5,9,14,0.6)" stroke={FAINT} strokeWidth="2" />
      <path d="M92 212 H348" stroke={FAINT} strokeWidth="2" />
      {breakers.map((i) => {
        const x = 104 + i * 30;
        const off = tripped.has(i);
        return (
          <g key={i}>
            <rect x={x} y="168" width="24" height="88" rx="4" fill="#e9ecef" opacity={i === 0 ? 1 : 0.92} />
            <rect
              x={x + 6}
              y={off ? 222 : 186}
              width="12"
              height="26"
              rx="3"
              fill={off ? "#6b7a90" : i === 0 ? BLUE : "#1d3050"}
            />
            <rect x={x + 4} y="244" width="16" height="4" rx="2" fill={off ? "#2ec5f5" : "#3c8d5a"} />
          </g>
        );
      })}

      {/* Circuit labels */}
      {["LIGHTS", "SOCKETS", "A/C", "COOKER"].map((t, i) => (
        <g key={t}>
          <rect x={92 + i * 66} y="286" width="58" height="22" rx="5" fill="none" stroke={FAINT} strokeWidth="1.5" />
          <text
            x={121 + i * 66}
            y="301"
            textAnchor="middle"
            fill="rgba(225,232,240,0.6)"
            fontFamily="ui-monospace, monospace"
            fontSize="9"
            letterSpacing="1"
          >
            {t}
          </text>
        </g>
      ))}

      {/* Earth bar */}
      <rect x="92" y="326" width="256" height="40" rx="8" fill="none" stroke={FAINT} strokeWidth="2" />
      {Array.from({ length: 10 }, (_, i) => (
        <circle key={i} cx={112 + i * 24} cy="346" r="5" fill="none" stroke="#3c8d5a" strokeWidth="2" />
      ))}

      {/* Outgoing circuits */}
      <g fill="none" strokeLinecap="round" strokeWidth="3" stroke={BLUE} strokeDasharray="6 7">
        <path d="M140 390 V430 H40" />
        <path d="M300 390 V420 H410" />
      </g>
      <circle cx="40" cy="430" r="7" fill={BLUE} />
      <circle cx="410" cy="420" r="7" fill={BLUE} />
    </svg>
  );
}
