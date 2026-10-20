"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import clsx from "clsx";
import { Logo } from "./Logo";
import { CartButton } from "./CartButton";
import { MenuIcon, CloseIcon, PhoneIcon, BoltIcon } from "./Icons";
import { nav, site } from "@/lib/site";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50">
      <div className="hidden border-b border-white/5 bg-ink-950/80 backdrop-blur md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-1.5 text-xs text-mist-400">
          <a href={`tel:${site.phones[0].tel}`} className="inline-flex items-center gap-1.5 hover:text-volt-300">
            <BoltIcon className="h-3.5 w-3.5 text-forge-400" />
            <span className="text-mist-200">{site.emergency}</span>
            <span className="text-mist-500">·</span>
            <span>{site.serviceArea}</span>
            <span className="text-mist-500">·</span>
            <span className="font-semibold">Call {site.phones[0].label}</span>
          </a>
          <span className="flex items-center gap-4">
            {site.phones.map((p) => (
              <a key={p.tel} href={`tel:${p.tel}`} className="hover:text-volt-300">
                {p.label}
              </a>
            ))}
          </span>
        </div>
      </div>

      <div
        className={clsx(
          "border-b transition-colors",
          scrolled
            ? "border-white/10 bg-ink-900/85 backdrop-blur-xl"
            : "border-transparent bg-transparent",
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <Logo />

          <nav className="hidden items-center gap-1 lg:flex">
            {nav.map((item) => {
              const active =
                item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    "rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
                    active
                      ? "text-white"
                      : "text-mist-200 hover:bg-white/5 hover:text-white",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <CartButton />
            <a
              href={`tel:${site.phones[0].tel}`}
              className="hidden items-center gap-2 rounded-lg border border-white/10 px-3.5 py-2 text-sm font-medium text-mist-100 transition-colors hover:border-volt-400/50 hover:text-white sm:inline-flex"
            >
              <PhoneIcon className="h-4 w-4 text-volt-400" />
              Call now
            </a>
            <Link
              href="/book"
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-br from-volt-400 to-volt-600 px-4 py-2 text-sm font-bold text-ink-950 shadow-[0_0_28px_-8px_rgba(14,165,233,0.9)] transition-transform hover:-translate-y-0.5"
            >
              Book a visit
            </Link>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              className="grid h-10 w-10 place-items-center rounded-lg border border-white/10 text-white lg:hidden"
            >
              {open ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div className="border-b border-white/10 bg-ink-900/97 backdrop-blur-xl lg:hidden">
          <nav className="mx-auto grid max-w-7xl gap-1 px-4 py-3">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-base font-medium text-mist-100 hover:bg-white/5 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/book"
              onClick={() => setOpen(false)}
              className="mt-1 rounded-lg bg-gradient-to-br from-volt-400 to-volt-600 px-3 py-2.5 text-center text-base font-bold text-ink-950"
            >
              Book a visit
            </Link>
            <Link
              href="/cart"
              onClick={() => setOpen(false)}
              className="rounded-lg border border-white/10 px-3 py-2.5 text-center text-base font-medium text-mist-100 hover:bg-white/5"
            >
              Cart
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
