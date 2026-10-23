import type { ReactNode } from "react";
import clsx from "clsx";
import { Reveal } from "./Reveal";

/**
 * Banner at the top of every inner page. Keeping this in one place means the
 * eyebrow, heading, intro copy and call-to-action all land in the same
 * position on /services, /about, /contact, /book and /shop.
 */
export function PageHero({
  eyebrow,
  title,
  lede,
  actions,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  lede?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b border-white/5">
      <div className="absolute inset-0 bg-grid [mask-image:radial-gradient(60%_70%_at_50%_0%,#000_25%,transparent_100%)]" />
      <div className="shell relative py-16 sm:py-20">
        <Reveal className="max-w-3xl">
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="page-title mt-3">{title}</h1>
          {lede ? <p className="lead mt-5 max-w-2xl">{lede}</p> : null}
          {actions ? (
            <div className="mt-7 flex flex-wrap items-center gap-3">{actions}</div>
          ) : null}
          {children}
        </Reveal>
      </div>
    </section>
  );
}

/**
 * Eyebrow + heading + intro block used to open a content section.
 */
export function SectionHeading({
  eyebrow,
  title,
  lede,
  tone = "volt",
  align = "left",
  className,
  children,
}: {
  eyebrow?: string;
  title: ReactNode;
  lede?: ReactNode;
  tone?: "volt" | "forge";
  align?: "left" | "center";
  className?: string;
  children?: ReactNode;
}) {
  return (
    <Reveal
      className={clsx(
        align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl",
        className,
      )}
    >
      {eyebrow ? (
        <p className={tone === "forge" ? "eyebrow-forge" : "eyebrow"}>{eyebrow}</p>
      ) : null}
      <h2 className={clsx("section-title mt-3", !eyebrow && "mt-0")}>{title}</h2>
      {lede ? <p className="lead mt-4 text-base sm:text-lg">{lede}</p> : null}
      {children}
    </Reveal>
  );
}
