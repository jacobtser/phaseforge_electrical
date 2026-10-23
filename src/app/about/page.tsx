import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";
import {
  ArrowRightIcon,
  CheckIcon,
  ClockIcon,
  MapPinIcon,
  ShieldIcon,
  SparkIcon,
  WrenchIcon,
} from "@/components/Icons";
import { Reveal } from "@/components/Reveal";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "PhaseForge Electrical & Power is a Ghanaian electrical contractor serving Greater Accra with safety-first residential, commercial and backup-power expertise.",
  alternates: { canonical: "/about" },
};

const VALUES = [
  { icon: ShieldIcon, title: "Safety without compromise", text: "Work carried out to recognised electrical safety practices, tested and documented." },
  { icon: WrenchIcon, title: "Craftsmanship", text: "Neat, durable work using quality materials — built to last, not to patch." },
  { icon: ClockIcon, title: "Respect for your time", text: "We agree a time, keep you updated and explain the work before we start." },
  { icon: SparkIcon, title: "Practical innovation", text: "Energy-saving upgrades such as LED retrofits, solar and smart backup power." },
];

const AREAS = [
  "Kasoa and the western corridor",
  "East Legon, Spintex and Madina",
  "Tema and the industrial area",
  "Kpone and wider Greater Accra",
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About us"
        title="Electrical expertise you can build on"
        lede={
          <>
            {site.name} is a Ghanaian electrical contractor based in {site.location}. We specialise
            in residential and commercial electrical work, power solutions and testing — delivered
            with the care and precision your property deserves.
          </>
        }
        actions={
          <>
            <Link href="/book" className="btn btn-primary">
              Work with us <ArrowRightIcon className="h-4 w-4" />
            </Link>
            <Link href="/services" className="btn btn-secondary">
              See our services
            </Link>
          </>
        }
      />

      <section className="shell section">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <h2 className="section-title">Our story</h2>
            <div className="mt-4 space-y-4 text-mist-300">
              <p>
                PhaseForge was founded on a simple belief: electrical work should be safe, honest and
                done properly the first time. Too many homes and businesses live with dodgy wiring,
                nuisance tripping and unreliable power. We exist to fix that.
              </p>
              <p>
                From full home rewires and distribution-board work to backup generators, solar and
                preventive maintenance, we bring a problem-solving mindset to every job — big or
                small.
              </p>
              <p>
                We serve homeowners, landlords, restaurants, offices, warehouses and facilities
                across {site.serviceArea}. Not sure whether your location is covered? Call and
                we&apos;ll confirm straight away.
              </p>
            </div>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/book" className="btn btn-primary">
                Work with us <ArrowRightIcon className="h-4 w-4" />
              </Link>
              <Link href="/services" className="btn btn-secondary">
                See our services
              </Link>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="grid gap-4 sm:grid-cols-2">
              {VALUES.map((v) => (
                <div key={v.title} className="card h-full">
                  <v.icon className="h-6 w-6 text-volt-400" />
                  <h3 className="mt-4 font-bold text-white">{v.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-mist-400">{v.text}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section-alt">
        <div className="shell grid gap-8 py-16 sm:grid-cols-3">
          {[
            { value: "6", label: "Service categories covered" },
            { value: "GHS", label: "Local pricing and materials" },
            { value: site.location, label: "Where we operate" },
          ].map((s, i) => (
            <Reveal key={s.label} delay={i * 70} className="text-center">
              <div className="font-display text-2xl font-extrabold text-volt-300 sm:text-3xl">
                {s.value}
              </div>
              <div className="mt-2 text-sm text-mist-400">{s.label}</div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="shell section">
        <div className="grid gap-8 lg:grid-cols-2">
          <Reveal className="h-full">
            <div className="card card-p8 h-full">
              <span className="icon-chip-forge">
                <MapPinIcon className="h-7 w-7" />
              </span>
              <h2 className="mt-4 font-display text-2xl font-extrabold text-white">Where we work</h2>
              <p className="mt-3 text-mist-300">
                We cover {site.serviceArea} and surrounding areas. Not sure if you&apos;re in
                range? Give us a call — we&apos;ll let you know straight away.
              </p>
              <ul className="mt-5 space-y-2.5">
                {AREAS.map((a) => (
                  <li key={a} className="flex items-center gap-2.5 text-sm text-mist-200">
                    <CheckIcon className="h-4 w-4 shrink-0 text-volt-300" /> {a}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={100} className="h-full">
            <div className="card card-p8 h-full">
              <span className="icon-chip-forge">
                <ClockIcon className="h-7 w-7" />
              </span>
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
