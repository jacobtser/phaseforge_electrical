import clsx from "clsx";
import type { ProductArt } from "@/lib/products";

/**
 * Inline product illustrations shown until a real photo is supplied.
 * Drop a photo at /public/products/<slug>.webp and pass `image` to override.
 */
export function ProductArt({
  art,
  className,
}: {
  art: ProductArt;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 160 120"
      fill="none"
      aria-hidden="true"
      className={clsx("h-full w-full", className)}
    >
      <defs>
        <linearGradient id="pa-glow" x1="0" y1="0" x2="160" y2="120" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f1be29" stopOpacity="0.16" />
          <stop offset="1" stopColor="#c98544" stopOpacity="0.10" />
        </linearGradient>
      </defs>
      <rect width="160" height="120" rx="14" fill="url(#pa-glow)" />
      <g
        stroke="#f8dd7a"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.95"
      >
        {shapes[art]}
      </g>
    </svg>
  );
}

const shapes: Record<ProductArt, React.ReactNode> = {
  mcb: (
    <>
      <rect x="55" y="24" width="50" height="72" rx="6" />
      <path d="M66 40h28M80 52v18" />
      <path d="M72 84h16" strokeWidth="5" />
      <circle cx="80" cy="34" r="3" fill="#f8dd7a" stroke="none" />
    </>
  ),
  rcd: (
    <>
      <rect x="46" y="26" width="68" height="68" rx="6" />
      <path d="M58 44h44M58 56h44" />
      <circle cx="80" cy="74" r="8" />
      <path d="m77 74 2.5 2.5L84 72" />
    </>
  ),
  socket: (
    <>
      <rect x="42" y="26" width="76" height="68" rx="8" />
      <circle cx="66" cy="60" r="11" />
      <circle cx="98" cy="60" r="11" />
      <path d="M66 54v6M98 54v6" strokeWidth="4" />
    </>
  ),
  switch: (
    <>
      <rect x="44" y="30" width="72" height="60" rx="8" />
      <rect x="56" y="44" width="20" height="32" rx="4" />
      <rect x="86" y="44" width="20" height="32" rx="4" />
    </>
  ),
  cable: (
    <>
      <circle cx="80" cy="60" r="34" />
      <circle cx="80" cy="60" r="20" />
      <path d="M110 78c10 4 18 2 24-6" />
      <path d="M134 72v-8" strokeWidth="4" />
    </>
  ),
  panel: (
    <>
      <rect x="38" y="28" width="84" height="64" rx="6" />
      <path d="M56 44h48M56 56h48M56 68h32" strokeOpacity="0.5" />
      <path d="M110 88V96M50 88V96" />
    </>
  ),
  floodlight: (
    <>
      <rect x="46" y="30" width="68" height="46" rx="6" />
      <path d="M56 42h48M56 52h48" strokeOpacity="0.5" />
      <path d="M80 76v14M62 100l18-10 18 10" />
    </>
  ),
  batten: (
    <>
      <rect x="30" y="50" width="100" height="20" rx="10" />
      <path d="M44 60h72" strokeWidth="6" strokeOpacity="0.55" />
      <path d="M52 50v-8M108 50v-8" />
    </>
  ),
  exit: (
    <>
      <rect x="46" y="30" width="68" height="40" rx="6" />
      <path d="M60 50h12l6-8 6 16 6-8h12" />
      <path d="M72 70v14M88 70v14M64 88h32" />
    </>
  ),
  solar: (
    <>
      <path d="M40 34h80l-8 52H48L40 34Z" />
      <path d="M44 52h72M50 70h60M66 34l-4 52M94 34l4 52" strokeOpacity="0.55" />
      <path d="M80 94v10M66 106h28" />
    </>
  ),
  inverter: (
    <>
      <rect x="44" y="28" width="72" height="64" rx="6" />
      <path d="M56 44h28" />
      <circle cx="100" cy="44" r="4" fill="#f8dd7a" stroke="none" />
      <path d="M74 58 62 78h12l-4 14 22-24H78l6-10" />
    </>
  ),
  battery: (
    <>
      <rect x="38" y="40" width="84" height="44" rx="6" />
      <path d="M54 32v8M106 32v8" strokeWidth="5" />
      <path d="M50 62h12M98 56v12M92 62h12" strokeWidth="4" />
      <path d="M68 62h16" strokeOpacity="0.5" />
    </>
  ),
  controller: (
    <>
      <rect x="50" y="28" width="60" height="64" rx="6" />
      <path d="M60 44h40" />
      <path d="M62 82V66l10-8 8 10 10-14 8 12" />
      <circle cx="62" cy="36" r="3" fill="#f8dd7a" stroke="none" />
    </>
  ),
  dboard: (
    <>
      <rect x="36" y="26" width="88" height="68" rx="6" />
      <path d="M46 44h68" />
      <rect x="48" y="54" width="12" height="30" rx="2" />
      <rect x="64" y="54" width="12" height="30" rx="2" />
      <rect x="80" y="54" width="12" height="30" rx="2" />
      <rect x="96" y="54" width="12" height="30" rx="2" />
    </>
  ),
  conduit: (
    <>
      <rect x="42" y="46" width="76" height="28" rx="14" />
      <path d="M58 46v28M102 46v28" strokeOpacity="0.5" />
      <path d="M126 60h14" strokeWidth="4" />
    </>
  ),
  toolbox: (
    <>
      <rect x="40" y="44" width="80" height="46" rx="6" />
      <path d="M64 44V34a4 4 0 0 1 4-4h24a4 4 0 0 1 4 4v10" />
      <path d="M40 60h80" />
      <path d="M72 60v10h16V60" />
    </>
  ),
  meter: (
    <>
      <rect x="52" y="24" width="56" height="72" rx="8" />
      <rect x="62" y="36" width="36" height="18" rx="3" />
      <circle cx="80" cy="76" r="10" />
      <path d="M80 70v6l4 4" />
    </>
  ),
  changer: (
    <>
      <rect x="48" y="28" width="64" height="64" rx="6" />
      <path d="M64 78V52l32-14" strokeWidth="4" />
      <circle cx="64" cy="80" r="4" fill="#f8dd7a" stroke="none" />
      <circle cx="98" cy="40" r="4" fill="#f8dd7a" stroke="none" />
      <path d="M58 40h12" />
    </>
  ),
};
