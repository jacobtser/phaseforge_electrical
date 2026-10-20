import Link from "next/link";
import { Logo } from "./Logo";
import { site, serviceGroups, nav, solarEvWaLink } from "@/lib/site";
import { MailIcon, MapPinIcon, PhoneIcon, SunIcon, WhatsAppIcon } from "./Icons";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative mt-24 border-t border-white/10 bg-ink-950">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <Logo />
          <p className="max-w-xs text-sm leading-relaxed text-mist-400">
            Licensed electricians delivering safe, code-compliant residential, commercial and
            backup-power work across {site.serviceArea}.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href={`https://wa.me/${site.whatsapp}`}
              className="grid h-10 w-10 place-items-center rounded-lg border border-white/10 text-mist-200 transition-colors hover:border-[#25D366]/60 hover:text-[#25D366]"
              aria-label="Chat on WhatsApp"
              target="_blank"
              rel="noopener noreferrer"
            >
              <WhatsAppIcon className="h-5 w-5" />
            </a>
            <a
              href={`mailto:${site.email}`}
              className="grid h-10 w-10 place-items-center rounded-lg border border-white/10 text-mist-200 transition-colors hover:border-volt-400/60 hover:text-volt-300"
              aria-label="Email us"
            >
              <MailIcon className="h-5 w-5" />
            </a>
            <a href={`tel:${site.phones[0].tel}`} className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-mist-200 hover:text-volt-300">
              <PhoneIcon className="h-4 w-4" /> {site.phones[0].label}
            </a>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Services</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {serviceGroups.map((g) => (
              <li key={g.id}>
                <Link
                  href={`/services#${g.id}`}
                  className="text-mist-400 transition-colors hover:text-volt-300"
                >
                  {g.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Company</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-mist-400 transition-colors hover:text-volt-300"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/book" className="text-mist-400 transition-colors hover:text-volt-300">
                Book a visit
              </Link>
            </li>
            <li>
              <Link href="/payment" className="text-mist-400 transition-colors hover:text-volt-300">
                Payment information
              </Link>
            </li>
            <li>
              <Link
                href="/admin/login"
                className="text-mist-500 transition-colors hover:text-mist-300"
              >
                Team login
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Get in touch</h3>
          <ul className="mt-4 space-y-3 text-sm text-mist-400">
            <li className="flex gap-2.5">
              <PhoneIcon className="mt-0.5 h-4 w-4 shrink-0 text-volt-400" />
              <span className="flex flex-col">
                {site.phones.map((p) => (
                  <a key={p.tel} href={`tel:${p.tel}`} className="hover:text-volt-300">
                    {p.label}
                  </a>
                ))}
              </span>
            </li>
            <li className="flex gap-2.5">
              <SunIcon className="mt-0.5 h-4 w-4 shrink-0 text-forge-400" />
              <a
                href={solarEvWaLink(
                  "Hello PhaseForge, I'd like to speak with your solar & EV specialist.",
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-forge-300"
              >
                Solar &amp; EV: {site.solarEv.label}
              </a>
            </li>
            <li className="flex gap-2.5">
              <MailIcon className="mt-0.5 h-4 w-4 shrink-0 text-volt-400" />
              <a href={`mailto:${site.email}`} className="hover:text-volt-300">
                {site.email}
              </a>
            </li>
            <li className="flex gap-2.5">
              <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-volt-400" />
              {site.location}
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/5">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 text-xs text-mist-500 sm:flex-row">
          <p>
            © {year} {site.name}. All rights reserved.
          </p>
          <p>
            Licensed &amp; insured · {site.domain}
          </p>
        </div>
      </div>
    </footer>
  );
}
