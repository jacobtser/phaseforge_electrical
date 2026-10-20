import Link from "next/link";
import clsx from "clsx";

export function Logo({
  className,
  showText = true,
  href = "/",
}: {
  className?: string;
  showText?: boolean;
  href?: string;
}) {
  const mark = (
    <span className="inline-flex items-center gap-2.5">
      <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-volt-400 to-volt-600 shadow-[0_0_24px_-6px_rgba(14,165,233,0.8)] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element -- inline SVG logo in /public */}
        <img src="/logo-mark.svg" alt="" className="h-9 w-9" aria-hidden="true" />
        <span className="absolute inset-0 rounded-xl ring-1 ring-white/20" />
      </span>
      {showText && (
        <span className="leading-none">
          <span className="block font-display text-lg font-extrabold tracking-tight text-white">
            Phase<span className="text-volt-400">Forge</span>
          </span>
          <span className="block text-[10px] font-medium uppercase tracking-[0.22em] text-mist-400">
            Electrical &amp; Power
          </span>
        </span>
      )}
    </span>
  );

  if (!href) return <span className={className}>{mark}</span>;
  return (
    <Link href={href} className={clsx("group", className)} aria-label="PhaseForge Electrical home">
      {mark}
    </Link>
  );
}
