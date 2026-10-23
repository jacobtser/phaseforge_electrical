import Link from "next/link";
import clsx from "clsx";
import { site, solarEvWaLink } from "@/lib/site";
import { ArrowRightIcon, SunIcon, WhatsAppIcon } from "./Icons";

export function SolarEvContact({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  const href = solarEvWaLink(
    "Hello PhaseForge, I'd like to speak with your solar & backup power specialist about a solar, inverter or battery project.",
  );

  return (
    <div
      className={clsx(
        "relative overflow-hidden rounded-2xl border border-forge-400/25 bg-gradient-to-br from-forge-500/15 via-ink-900 to-ink-950",
        compact ? "p-5" : "p-6 sm:p-8",
        className,
      )}
    >
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-forge-500/20 blur-3xl" />
      <div
        className={clsx(
          "relative gap-5",
          compact ? "flex flex-wrap items-center" : "flex flex-col lg:flex-row lg:items-center",
        )}
      >
        <span className="icon-chip icon-chip-forge">
          <SunIcon className="h-6 w-6" />
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-forge-300">
            Solar &amp; backup power specialist
          </p>
          <h2
            className={clsx(
              "mt-1 font-display font-extrabold text-white",
              compact ? "text-lg" : "text-2xl",
            )}
          >
            Solar, inverter &amp; battery enquiries
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-mist-300">
            Planning solar, adding backup power or replacing batteries? Message our specialist
            directly on WhatsApp.
          </p>
        </div>

        <div className="flex w-full shrink-0 flex-col gap-2.5 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-wa btn-sm justify-center"
          >
            <WhatsAppIcon className="h-4.5 w-4.5" />
            WhatsApp {site.solarEv.label}
          </a>
          <Link
            href="/book"
            className="btn btn-forge btn-sm justify-center"
          >
            Book an assessment <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
