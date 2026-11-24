import type { Metadata } from "next";
import Link from "next/link";
import { site, serviceGroups } from "@/lib/site";
import { PageHero } from "@/components/PageHero";
import { ServiceCard } from "@/components/ServiceCard";
import { Reveal } from "@/components/Reveal";
import { ArrowRightIcon, BoltIcon, PhoneIcon } from "@/components/Icons";

export const metadata: Metadata = {
  title: "Electrical Services in Greater Accra",
  description:
    "Home electrical, commercial and industrial, solar and backup power, testing and safety, emergency assistance, and projects and contracts across Greater Accra.",
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Our services"
        title="Electrical services, done properly"
        lede="Six areas of work, from repairs and installations to solar, backup power and safety testing. Choose a service to see what's included and what we need to prepare a quote."
        actions={
          <>
            <Link href="/book?type=quote" className="btn btn-primary">
              Request a Quote <ArrowRightIcon className="h-4 w-4" />
            </Link>
            <a href={`tel:${site.phones[0].tel}`} className="btn btn-secondary">
              <PhoneIcon className="h-4 w-4 text-volt-400" /> {site.phones[0].label}
            </a>
          </>
        }
      />

      <section className="shell section">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {serviceGroups.map((g, i) => (
            <Reveal key={g.id} delay={i * 60} className="h-full">
              <ServiceCard group={g} headingLevel="h2" />
            </Reveal>
          ))}
        </div>
      </section>

      <section className="shell pb-4">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-ink-800 via-ink-900 to-ink-950 p-8 text-center sm:p-12">
          <BoltIcon className="mx-auto h-8 w-8 text-volt-400" />
          <h2 className="section-title mt-4">Not sure which service you need?</h2>
          <p className="mx-auto mt-3 max-w-xl text-base text-mist-300">
            Describe the problem in your own words and add a photo if you can. We&apos;ll recommend
            the right fix and give you a clear price before any work starts.
          </p>
          <Link href="/book?type=quote" className="btn btn-primary mt-6">
            Describe the problem <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}
