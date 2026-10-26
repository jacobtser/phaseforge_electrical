import type { Metadata } from "next";
import Link from "next/link";
import { site, serviceGroups, solarEvWaLink } from "@/lib/site";
import {
  ArrowRightIcon,
  BoltIcon,
  CheckIcon,
  PhoneIcon,
  WhatsAppIcon,
  iconByName,
} from "@/components/Icons";

export const metadata: Metadata = {
  title: "Electrical Services in Greater Accra",
  description: "Reliable electrical work across homes, businesses and projects in Greater Accra.",
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  return (
    <>
      <main>
        {/* Services header — direct from example */}
        <section className="relative bg-ink-950">
          <div className="shell pt-16 pb-12 text-center">
            <span className="inline-block rounded-full bg-volt-400/10 px-3 py-1 text-xs font-bold tracking-widest text-volt-300 uppercase">Quality Services</span>
            <h1 className="section-title mt-4">We Provide Electrical Services</h1>
            <p className="lead mt-4 max-w-2xl mx-auto">From repairs and installations to solar, generators and safety testing — done properly, priced clearly.</p>
            <div className="mt-6 flex justify-center gap-3">
              <Link href="/book" className="btn btn-primary">Request a Quote <ArrowRightIcon className="h-4 w-4" /></Link>
              <a href={`tel:${site.phones[0].tel}`} className="btn btn-secondary"><PhoneIcon className="h-4 w-4 text-volt-400" /> Call Us</a>
            </div>
          </div>
        </section>

        {/* Service cards — direct format from example */}
        <section className="shell section">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {serviceGroups.map((g) => {
              const Icon = iconByName[g.icon];
              return (
                <article key={g.id} id={g.id} className="card h-full flex flex-col">
                  <div className="h-48 bg-gradient-to-br from-ink-900 to-ink-950 rounded-2xl overflow-hidden relative flex items-center justify-center shadow-inner">
                    <span className="icon-chip-large">
                      <Icon className="h-8 w-8 text-volt-300" />
                    </span>
                  </div>
                  <h2 className="mt-5 font-display text-xl font-extrabold text-white">{g.title}</h2>
                  <p className="mt-2 text-sm text-mist-300 leading-relaxed flex-1">{g.blurb}</p>
                  <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                    {g.items.slice(0, 4).map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-mist-200">
                        <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-forge-400" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href={`/book?category=${encodeURIComponent(g.id)}`} className="btn btn-primary mt-5">Read More <ArrowRightIcon className="h-4 w-4" /></Link>
                </article>
              );
            })}
          </div>
        </section>

        {/* Contact / info strip */}
        <section className="shell pb-12">
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-forge-500/10 via-ink-900 to-ink-950 p-8 text-center sm:p-12">
            <BoltIcon className="mx-auto h-8 w-8 text-forge-400" />
            <h2 className="section-title mt-4">Not sure what you need?</h2>
            <p className="mx-auto mt-3 max-w-xl text-base text-mist-300">Describe the problem and we&apos;ll recommend the right fix — no jargon, no pressure. Free quotes for scheduled work.</p>
            <Link href="/book" className="btn btn-primary mt-6 inline-flex items-center gap-2">Request a Quote <ArrowRightIcon className="h-4 w-4" /></Link>
          </div>
        </section>
      </main>
    </>
  );
}
