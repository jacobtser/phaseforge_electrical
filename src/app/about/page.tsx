import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";
import { ArrowRightIcon, CheckIcon, ClockIcon, MapPinIcon, ShieldIcon, SparkIcon, WrenchIcon } from "@/components/Icons";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "PhaseForge Electrical and Power Solutions is a licensed electrical contractor serving Accra and Tema with safety-first residential, commercial and backup-power expertise.",
  alternates: { canonical: "/about" },
};

const VALUES = [
  { icon: ShieldIcon, title: "Safety without compromise", text: "Every job is done to recognised electrical codes, tested and documented." },
  { icon: WrenchIcon, title: "Craftsmanship", text: "Neat, durable work using quality materials — built to last, not to patch." },
  { icon: ClockIcon, title: "Respect for your time", text: "We show up when we say we will and keep you updated throughout." },
  { icon: SparkIcon, title: "Practical innovation", text: "Energy-efficient, future-ready solutions like EV chargers and smart backup power." },
];

export default function AboutPage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-grid [mask-image:radial-gradient(60%_70%_at_50%_0%,#000_25%,transparent_100%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:py-20">
          <Reveal className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-volt-400">About us</p>
            <h1 className="mt-3 font-display text-4xl font-extrabold text-white sm:text-5xl">
              Electrical expertise you can build on
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-mist-300">
              {site.name} is a licensed electrical contractor based in {site.location}. We specialise
              in residential and commercial electrical work, power solutions and specialty services —
              delivered with the care and precision your property deserves.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <h2 className="font-display text-3xl font-extrabold text-white">Our story</h2>
            <div className="mt-4 space-y-4 text-mist-300">
              <p>
                PhaseForge was founded on a simple belief: electrical work should be safe, honest and
                done properly the first time. Too many homes and businesses live with dodgy wiring,
                nuisance tripping and unreliable power. We exist to fix that.
              </p>
              <p>
                From full home rewires and panel upgrades to backup generators, EV chargers and
                preventive maintenance programs, our team brings a problem-solving mindset to every
                job — big or small.
              </p>
              <p>
                We serve homeowners, landlords, restaurants, offices, warehouses and facilities across{" "}
                {site.serviceArea}, with 24/7 emergency response when it matters most.
              </p>
            </div>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/book"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-volt-400 to-volt-600 px-6 py-3.5 font-bold text-ink-950 transition-transform hover:-translate-y-0.5"
              >
                Work with us <ArrowRightIcon className="h-4 w-4" />
              </Link>
              <Link
                href="/services"
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-6 py-3.5 font-semibold text-white transition-colors hover:border-volt-400/60"
              >
                See our services
              </Link>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="grid gap-4 sm:grid-cols-2">
              {VALUES.map((v) => (
                <div key={v.title} className="rounded-2xl border border-white/10 bg-ink-900/60 p-6">
                  <v.icon className="h-6 w-6 text-volt-400" />
                  <h3 className="mt-4 font-bold text-white">{v.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-mist-400">{v.text}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-y border-white/5 bg-ink-900/40">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:grid-cols-3">
          {site.stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 70} className="text-center">
              <div className="font-display text-4xl font-extrabold text-white">{s.value}</div>
              <div className="mt-2 text-sm text-mist-400">{s.label}</div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid gap-8 lg:grid-cols-2">
          <Reveal>
            <div className="h-full rounded-2xl border border-white/10 bg-ink-900/60 p-8">
              <MapPinIcon className="h-7 w-7 text-forge-400" />
              <h2 className="mt-4 font-display text-2xl font-extrabold text-white">Where we work</h2>
              <p className="mt-3 text-mist-300">
                We cover {site.serviceArea} and surrounding areas. Not sure if you&apos;re in range?
                Give us a call — we&apos;ll let you know straight away.
              </p>
              <ul className="mt-5 space-y-2.5">
                {["Accra Central & suburbs", "East Legon, Spintex, Madina", "Tema & Tema Industrial Area", "Greater Accra region"].map(
                  (a) => (
                    <li key={a} className="flex items-center gap-2.5 text-sm text-mist-200">
                      <CheckIcon className="h-4 w-4 text-volt-300" /> {a}
                    </li>
                  ),
                )}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="h-full rounded-2xl border border-white/10 bg-ink-900/60 p-8">
              <ClockIcon className="h-7 w-7 text-forge-400" />
              <h2 className="mt-4 font-display text-2xl font-extrabold text-white">Working hours</h2>
              <ul className="mt-4 divide-y divide-white/5">
                {site.hours.map((h) => (
                  <li key={h.day} className="flex justify-between py-3 text-sm">
                    <span className="text-mist-300">{h.day}</span>
                    <span className="font-medium text-white">{h.time}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 rounded-xl border border-forge-500/20 bg-forge-500/10 px-4 py-3 text-sm text-forge-300">
                {site.emergency} — call {site.phones[0].label}.
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
