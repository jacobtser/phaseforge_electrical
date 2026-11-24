import Link from "next/link";
import clsx from "clsx";
import { useId } from "react";

/**
 * The PhaseForge bolt: an amber upper blade and a blue lower blade, redrawn
 * as vector from the approved logo (public/logo.jpg) so it stays sharp at
 * header and favicon sizes.
 */
export function LogoMark({ className }: { className?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 64 80" className={className} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${id}-a`} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#ffc24a" />
          <stop offset="1" stopColor="#ff7a2f" />
        </linearGradient>
        <linearGradient id={`${id}-b`} x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3fb0ff" />
          <stop offset="1" stopColor="#1f5cff" />
        </linearGradient>
      </defs>
      <path d="M2 41 L40 0 L28 41 Z" fill={`url(#${id}-a)`} />
      <path d="M32 35 L62 35 L22 80 Z" fill={`url(#${id}-b)`} />
    </svg>
  );
}

export function Logo({
  className,
  href = "/",
}: {
  className?: string;
  href?: string;
}) {
  const mark = (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark className="h-9 w-auto shrink-0" />
      <span className="flex flex-col leading-none">
        <span className="font-display text-[1.05rem] font-extrabold tracking-tight text-white">
          PhaseForge
        </span>
        <span className="mt-1 text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-mist-400">
          Electrical &amp; Power
        </span>
      </span>
    </span>
  );

  if (!href) return <span className={className}>{mark}</span>;
  return (
    <Link
      href={href}
      className={clsx("group rounded-lg", className)}
      aria-label="PhaseForge Electrical & Power — home"
    >
      {mark}
    </Link>
  );
}
