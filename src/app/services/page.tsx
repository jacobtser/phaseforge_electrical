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
import { PageHero } from "@/components/PageHero";
import { SolarEvContact } from "@/components/SolarEvContact";

export const metadata: Metadata = {
  title: "Electrical Services in Greater Accra",
  description:
    "Home, commercial, solar and backup power, testing and safety, emergency and project electrical services across Greater Accra — wiring, rewiring, distribution boards, inverters, generators and inspections.",
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Our electrical services"
        title="Reliable electrical work for homes, businesses and projects"
        lede={
          <>
            From simple repairs to complete power-system upgrades, we get the job done safely and
            to recognised practice across {site.serviceArea}.
          </>
        }
        actions={
          <>
            <Link href="/book" className="btn btn-primary">
              Request a Quote <ArrowRightIcon className="h-4 w-4" />
            </Link>
            <a href={`tel:${site.phones[0].tel}`} className="btn btn-secondary">
              <PhoneIcon className="h-4 w-4 text-volt-400" /> {site.phones[0].label}
            </a>
          </>
        }
      />

      <div className="shell section">
        <div className="grid gap-6 lg:grid-cols-2">
          {serviceGroups.map((g, i) => {
            const Icon = iconByName[g.icon];
            return (
              <Reveal key={g.id} delay={i * 60} as="article" className="h-full">
                <div id={g.id} className="card card-p7 scroll-mt-28 h-full">
                  <div className="flex items-center gap-4">
                    <span className="icon-chip">
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
                            className="inline-flex shrink-0 items-center gap-1 text-[11px] font-semibold text-forge-300 transition-colors hover:text-forge-200"
                          >
                            <WhatsAppIcon className="h-3.5 w-3.5" /> WhatsApp
                          </a>
                        )}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={`/book?category=${encodeURIComponent(g.id)}`}
                    className="link-accent mt-6"
                  >
                    Request this service <ArrowRightIcon className="h-4 w-4" />
                  </Link>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>

      <section className="shell pb-8">
        <Reveal>
          <SolarEvContact />
        </Reveal>
      </section>

      <section className="shell pb-20">
        <Reveal>
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-forge-500/10 via-ink-900 to-ink-950 p-8 text-center sm:p-12">
            <BoltIcon className="mx-auto h-8 w-8 text-forge-400" />
            <h2 className="section-title mt-4">Not sure what you need?</h2>
            <p className="mx-auto mt-3 max-w-2xl text-base text-mist-300 sm:text-lg">
              Describe the problem and we&apos;ll recommend the right fix — no jargon, no pressure.
              Free quotes for scheduled work.
            </p>
            <Link href="/book" className="btn btn-primary mt-6">
              Request a Quote <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
