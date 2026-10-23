"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import clsx from "clsx";
import { Logo } from "./Logo";
import { CartButton } from "./CartButton";
import { MenuIcon, CloseIcon, PhoneIcon, BoltIcon } from "./Icons";
import { headerNav, site } from "@/lib/site";

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
      {/* Utility bar — contact details only */}
      <div className="hidden border-b border-white/5 bg-ink-950/80 backdrop-blur md:block">
        <div className="shell flex items-center justify-between py-1.5 text-xs text-mist-400">
          <a
            href={`tel:${site.phones[0].tel}`}
            className="inline-flex items-center gap-1.5 transition-colors hover:text-volt-300"
          >
            <BoltIcon className="h-3.5 w-3.5 text-forge-400" />
            <span className="text-mist-200">{site.emergency}</span>
            <span className="text-mist-500">·</span>
            <span>{site.serviceArea}</span>
          </a>
          <span className="flex items-center gap-4">
            {site.phones.map((p) => (
              <a
                key={p.tel}
                href={`tel:${p.tel}`}
                className="font-medium text-mist-300 transition-colors hover:text-volt-300"
              >
                {p.label}
              </a>
            ))}
          </span>
        </div>
      </div>

      {/* Main bar */}
      <div
        className={clsx(
          "border-b transition-colors",
          scrolled
            ? "border-white/10 bg-ink-900/85 backdrop-blur-xl"
            : "border-transparent bg-transparent",
        )}
      >
        <div className="shell flex items-center justify-between gap-4 py-3">
          <Logo />

          <nav className="hidden items-center gap-1 lg:flex">
            {headerNav.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href.split("#")[0]);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={clsx(
                    "relative rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
                    active ? "text-white" : "text-mist-200 hover:bg-white/5 hover:text-white",
                  )}
                >
                  {item.label}
                  <span
                    aria-hidden
                    className={clsx(
                      "absolute inset-x-3.5 -bottom-px h-0.5 rounded-full transition-colors",
                      active ? "bg-volt-400" : "bg-transparent",
                    )}
                  />
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <CartButton />
            <a
              href={`tel:${site.phones[0].tel}`}
              className="btn btn-secondary btn-sm hidden sm:inline-flex"
            >
              <PhoneIcon className="h-4 w-4 text-volt-400" />
              Call now
            </a>
            <Link href="/book" className="btn btn-primary btn-sm hidden xs:inline-flex">
              Book a visit
            </Link>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              className="grid h-10 w-10 place-items-center rounded-lg border border-white/10 text-white transition-colors hover:border-volt-400/50 lg:hidden"
            >
              {open ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-b border-white/10 bg-ink-900/97 backdrop-blur-xl lg:hidden">
          <nav className="shell grid gap-1 py-3">
            {headerNav.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href.split("#")[0]);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={clsx(
                    "rounded-lg px-3 py-2.5 text-base font-medium transition-colors",
                    active
                      ? "bg-white/5 text-white"
                      : "text-mist-100 hover:bg-white/5 hover:text-white",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
            <div className="mt-2 grid gap-2 border-t border-white/5 pt-3">
              <Link
                href="/book"
                onClick={() => setOpen(false)}
                className="btn btn-primary w-full"
              >
                Book a visit
              </Link>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/cart"
                  onClick={() => setOpen(false)}
                  className="btn btn-secondary btn-sm w-full"
                >
                  Cart
                </Link>
                <a
                  href={`tel:${site.phones[0].tel}`}
                  className="btn btn-secondary btn-sm w-full"
                >
                  Call us
                </a>
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
