import type { Metadata } from "next";
import Link from "next/link";
import { isSolarOrEvRequest, site, serviceGroups, solarEvWaLink } from "@/lib/site";
import {
  iconByName,
  ArrowRightIcon,
  BoltIcon,
  CheckIcon,
  PhoneIcon,
  WhatsAppIcon,
} from "@/components/Icons";
import { Reveal } from "@/components/Reveal";
import { SolarEvContact } from "@/components/SolarEvContact";

export const metadata: Metadata = {
  title: "Electrical Services in Accra & Tema",
  description:
    "Residential, commercial, backup power and specialty electrical services across Accra and Tema — panel upgrades, rewiring, generators, EV chargers, inspections and more.",
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-grid [mask-image:radial-gradient(60%_70%_at_50%_0%,#000_25%,transparent_100%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:py-20">
          <Reveal className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-volt-400">
              Our electrical services
            </p>
            <h1 className="mt-3 font-display text-4xl font-extrabold text-white sm:text-5xl">
              Reliable, high-quality electrical work — homes &amp; businesses
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-mist-300">
              From simple repairs to complete power-system upgrades, our licensed electricians get the
              job done safely, efficiently and to the highest standards across {site.serviceArea}.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/book"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-volt-400 to-volt-600 px-6 py-3.5 font-bold text-ink-950 shadow-[0_0_36px_-10px_rgba(14,165,233,0.9)] transition-transform hover:-translate-y-0.5"
              >
                Book a visit <ArrowRightIcon className="h-4 w-4" />
              </Link>
              <a
                href={`tel:${site.phones[0].tel}`}
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-6 py-3.5 font-semibold text-white transition-colors hover:border-volt-400/60"
              >
                <PhoneIcon className="h-4 w-4 text-volt-400" /> {site.phones[0].label}
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid gap-6 lg:grid-cols-2">
          {serviceGroups.map((g, i) => {
            const Icon = iconByName[g.icon];
            return (
              <Reveal key={g.id} delay={i * 60} as="article">
                <div
                  id={g.id}
                  className="scroll-mt-28 rounded-2xl border border-white/10 bg-ink-900/60 p-7"
                >
                  <div className="flex items-center gap-4">
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-volt-500/10 text-volt-300 ring-1 ring-volt-400/20">
                      <Icon className="h-6 w-6" />
                    </span>
                    <div>
                      <h2 className="font-display text-xl font-extrabold text-white">{g.title}</h2>
                      <p className="text-sm text-mist-400">{g.short}</p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-mist-300">{g.blurb}</p>
                  <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
                    {g.items.map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-sm text-mist-200">
                        <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-forge-400" />
                        <span className="flex-1">{item}</span>
                        {isSolarOrEvRequest(item) && (
                          <a
                            href={solarEvWaLink(
                              `Hello PhaseForge, I'd like to ask about ${item.toLowerCase()}.`,
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`WhatsApp about ${item}`}
                            className="inline-flex shrink-0 items-center gap-1 text-[11px] font-semibold text-forge-300 hover:text-forge-200"
                          >
                            <WhatsAppIcon className="h-3.5 w-3.5" /> WhatsApp
                          </a>
                        )}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/book"
                    className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-volt-300 hover:underline"
                  >
                    Request this service <ArrowRightIcon className="h-4 w-4" />
                  </Link>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>

      <section className="mx-auto max-w-7xl px-4 pb-8">
        <Reveal>
          <SolarEvContact />
        </Reveal>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20">
        <Reveal>
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-forge-500/10 via-ink-900 to-ink-950 p-8 sm:p-12 text-center">
            <BoltIcon className="mx-auto h-8 w-8 text-forge-400" />
            <h2 className="mt-4 font-display text-2xl font-extrabold text-white sm:text-3xl">
              Not sure what you need?
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-mist-300">
              Describe the problem and we&apos;ll recommend the right fix — no jargon, no pressure.
              Free quotes for scheduled work.
            </p>
            <Link
              href="/book"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-volt-400 to-volt-600 px-6 py-3.5 font-bold text-ink-950 transition-transform hover:-translate-y-0.5"
            >
              Get a free quote <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
