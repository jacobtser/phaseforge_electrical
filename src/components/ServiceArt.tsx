import clsx from "clsx";
import type { ServiceGroup } from "@/lib/site";

/*
 * Illustrated headers for the six service categories. These are original
 * line drawings, used until genuine PhaseForge project photos are available
 * (spec 5.1: do not imply staff, equipment or work that isn't real).
 * Swap a card to a photo by rendering an <img> in its place.
 */

const GOLD = "#f1be29";
const GOLD_SOFT = "#f8dd7a";
const LINE = "rgba(226,228,230,0.55)";
const FAINT = "rgba(226,228,230,0.18)";

function Scene({ id }: { id: ServiceGroup["id"] }) {
  switch (id) {
    case "home-electrical":
      return (
        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
          {/* House */}
          <path d="M92 150 V92 L160 44 L228 92 V150 Z" stroke={LINE} strokeWidth="2.5" />
          <path d="M118 150 V112 H146 V150" stroke={FAINT} strokeWidth="2" />
          {/* Socket */}
          <rect x="170" y="108" width="34" height="26" rx="5" stroke={GOLD} strokeWidth="2.5" />
          <circle cx="181" cy="121" r="2.6" fill={GOLD} />
          <circle cx="193" cy="121" r="2.6" fill={GOLD} />
          {/* Bulb */}
          <circle cx="160" cy="78" r="11" stroke={GOLD_SOFT} strokeWidth="2.5" />
          <path d="M155 92 h10" stroke={GOLD_SOFT} strokeWidth="2.5" />
          <path d="M140 66 l-6 -5 M180 66 l6 -5 M160 58 v-7" stroke={GOLD} strokeWidth="2" />
          {/* Wiring run */}
          <path d="M160 92 V100 H187 V108" stroke={GOLD} strokeWidth="1.6" strokeDasharray="3 4" />
        </g>
      );
    case "commercial-industrial":
      return (
        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
          <rect x="70" y="56" width="74" height="96" rx="3" stroke={LINE} strokeWidth="2.5" />
          <rect x="150" y="34" width="92" height="118" rx="3" stroke={LINE} strokeWidth="2.5" />
          {[0, 1, 2, 3].map((r) =>
            [0, 1, 2].map((c) => (
              <rect
                key={`${r}-${c}`}
                x={162 + c * 26}
                y={48 + r * 24}
                width="16"
                height="12"
                rx="2"
                stroke={r === 1 && c === 1 ? GOLD : FAINT}
                fill={r === 1 && c === 1 ? "rgba(241,190,41,0.25)" : "none"}
                strokeWidth="1.8"
              />
            )),
          )}
          {[0, 1, 2].map((r) => (
            <rect key={r} x="84" y={72 + r * 24} width="46" height="12" rx="2" stroke={FAINT} strokeWidth="1.8" />
          ))}
          {/* Three-phase lines */}
          {[0, 1, 2].map((i) => (
            <path key={i} d={`M20 ${70 + i * 10} H62`} stroke={i === 0 ? GOLD : i === 1 ? GOLD_SOFT : LINE} strokeWidth="2.2" />
          ))}
          <path d="M62 70 V100" stroke={LINE} strokeWidth="2" />
          <path d="M268 152 V120 L282 108 L296 120 V152" stroke={FAINT} strokeWidth="2" />
        </g>
      );
    case "solar-backup":
      return (
        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="250" cy="48" r="14" stroke={GOLD} strokeWidth="2.5" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
            const r1 = 20;
            const r2 = 27;
            const rad = (a * Math.PI) / 180;
            return (
              <path
                key={a}
                d={`M${250 + r1 * Math.cos(rad)} ${48 + r1 * Math.sin(rad)} L${250 + r2 * Math.cos(rad)} ${48 + r2 * Math.sin(rad)}`}
                stroke={GOLD}
                strokeWidth="2"
              />
            );
          })}
          {/* Panel array */}
          <path d="M56 128 L86 70 H196 L166 128 Z" stroke={LINE} strokeWidth="2.5" />
          <path d="M93 70 L63 128 M130 70 L100 128 M163 70 L133 128" stroke={FAINT} strokeWidth="1.8" />
          <path d="M71 99 H181" stroke={FAINT} strokeWidth="1.8" />
          <path d="M100 128 V150 M150 128 V150" stroke={LINE} strokeWidth="2" />
          {/* Battery */}
          <rect x="220" y="104" width="52" height="40" rx="5" stroke={GOLD_SOFT} strokeWidth="2.5" />
          <path d="M238 104 v-5 h16 v5" stroke={GOLD_SOFT} strokeWidth="2" />
          <path d="M248 112 l-7 13 h10 l-6 12" stroke={GOLD} strokeWidth="2.2" />
          <path d="M166 120 H220" stroke={GOLD} strokeWidth="1.6" strokeDasharray="3 4" />
        </g>
      );
    case "testing-safety":
      return (
        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
          {/* Meter body */}
          <rect x="112" y="30" width="96" height="124" rx="12" stroke={LINE} strokeWidth="2.5" />
          <rect x="126" y="44" width="68" height="34" rx="4" stroke={GOLD} strokeWidth="2.2" />
          <path d="M136 66 l8 -10 l8 6 l10 -12 l10 8 l12 -6" stroke={GOLD_SOFT} strokeWidth="2" />
          <circle cx="160" cy="112" r="20" stroke={LINE} strokeWidth="2.2" />
          <path d="M160 112 L172 100" stroke={GOLD} strokeWidth="2.5" />
          <circle cx="160" cy="112" r="3" fill={GOLD} />
          {/* Probes */}
          <path d="M128 154 C110 172 80 150 66 120" stroke={GOLD} strokeWidth="2" />
          <path d="M192 154 C212 172 240 150 254 120" stroke={LINE} strokeWidth="2" />
          <path d="M66 120 l-6 -14 M254 120 l6 -14" stroke={LINE} strokeWidth="3" />
          {/* Check badge */}
          <circle cx="244" cy="56" r="16" stroke={GOLD} strokeWidth="2.2" />
          <path d="M236 56 l6 6 l10 -12" stroke={GOLD} strokeWidth="2.5" />
        </g>
      );
    case "emergency":
      return (
        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M160 32 L232 150 H88 Z" stroke={GOLD} strokeWidth="3" />
          <path d="M166 70 L146 108 H164 L154 136 L180 96 H162 L172 70 Z" fill={GOLD} stroke="none" />
          {/* Signal arcs */}
          <path d="M252 70 a28 28 0 0 1 0 40 M262 60 a42 42 0 0 1 0 60" stroke={LINE} strokeWidth="2.2" />
          <path d="M68 70 a28 28 0 0 0 0 40 M58 60 a42 42 0 0 0 0 60" stroke={LINE} strokeWidth="2.2" />
        </g>
      );
    case "projects-contracts":
    default:
      return (
        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
          {/* Blueprint sheet */}
          <rect x="62" y="34" width="196" height="120" rx="6" stroke={LINE} strokeWidth="2.5" />
          <path d="M84 56 H170 V96 H84 Z M170 56 H236 V132 H170 M84 96 V132 H170" stroke={FAINT} strokeWidth="2" />
          {/* Circuit run through rooms */}
          <path d="M100 76 H150 V116 H210 V80" stroke={GOLD} strokeWidth="2" strokeDasharray="4 4" />
          {[
            [100, 76],
            [150, 76],
            [150, 116],
            [210, 116],
            [210, 80],
          ].map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r="4.5" fill="#090f16" stroke={GOLD} strokeWidth="2" />
          ))}
          {/* Ruler */}
          <path d="M62 166 H258" stroke={GOLD_SOFT} strokeWidth="2" />
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <path key={i} d={`M${62 + i * 28} 166 v-6`} stroke={GOLD_SOFT} strokeWidth="2" />
          ))}
        </g>
      );
  }
}

export function ServiceArt({
  id,
  className,
}: {
  id: ServiceGroup["id"];
  className?: string;
}) {
  const pid = `grid-${id}`;
  return (
    <svg
      viewBox="0 0 320 180"
      preserveAspectRatio="xMidYMid slice"
      className={clsx("block h-full w-full", className)}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <pattern id={pid} width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M20 0 H0 V20" fill="none" stroke="rgba(241,190,41,0.07)" strokeWidth="1" />
        </pattern>
        <radialGradient id={`${pid}-glow`} cx="0.5" cy="0.45" r="0.6">
          <stop offset="0" stopColor="rgba(241,190,41,0.16)" />
          <stop offset="1" stopColor="rgba(241,190,41,0)" />
        </radialGradient>
      </defs>
      <rect width="320" height="180" fill="#0b141d" />
      <rect width="320" height="180" fill={`url(#${pid})`} />
      <rect width="320" height="180" fill={`url(#${pid}-glow)`} />
      <Scene id={id} />
    </svg>
  );
}
