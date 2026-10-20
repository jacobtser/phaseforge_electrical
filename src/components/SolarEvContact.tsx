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
    "Hello PhaseForge, I'd like to speak with your solar & EV specialist about a solar, inverter, battery or EV charger project.",
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
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-forge-500/15 text-forge-300 ring-1 ring-forge-400/30">
          <SunIcon className="h-6 w-6" />
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-forge-300">
            Solar &amp; EV specialist
          </p>
          <h2
            className={clsx(
              "mt-1 font-display font-extrabold text-white",
              compact ? "text-lg" : "text-2xl",
            )}
          >
            Solar, inverter, battery &amp; EV charger enquiries
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-mist-300">
            Planning solar, adding backup power or installing an EV charger? Message our solar &amp;
            EV specialist directly on WhatsApp.
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2.5">
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-4 py-2.5 text-sm font-bold text-[#052e16] transition-transform hover:-translate-y-0.5"
          >
            <WhatsAppIcon className="h-4.5 w-4.5" />
            WhatsApp {site.solarEv.label}
          </a>
          <Link
            href="/book"
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:border-forge-400/60"
          >
            Book an assessment <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
