import Link from "next/link";
import { site, serviceGroups, waLink } from "@/lib/site";
import {
  iconByName,
  ArrowRightIcon,
  BoltIcon,
  CheckIcon,
  ClockIcon,
  PhoneIcon,
  ShieldIcon,
  SparkIcon,
  WhatsAppIcon,
  WrenchIcon,
} from "@/components/Icons";
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/PageHero";
import { ShopSection } from "@/components/ShopSection";
import { SolarEvContact } from "@/components/SolarEvContact";

const FEATURES = [
  { icon: ShieldIcon, title: "Safety first", text: "Work carried out to recognised electrical safety practices, with clear documentation." },
  { icon: ClockIcon, title: "Responsive scheduling", text: "Emergency enquiries handled subject to availability across Greater Accra." },
  { icon: WrenchIcon, title: "Right the first time", text: "Proper diagnosis, suitable materials and workmanship you can rely on." },
  { icon: SparkIcon, title: "Energy-smart upgrades", text: "LED retrofits, power quality fixes and solar or backup upgrades that cut bills." },
];

const PROCESS = [
  { n: "01", title: "Tell us what you need", text: "Book online or call. Describe the job, urgency and your location." },
  { n: "02", title: "Assess & quote", text: "We review the work and give you a clear, itemised price." },
  { n: "03", title: "We do the work", text: "The job is completed safely, tidily and to agreed scope." },
  { n: "04", title: "Test & hand over", text: "Work is tested, explained to you and any findings documented." },
];

const TRUST = [
  "Wiring & rewiring",
  "Distribution boards",
  "Fault diagnosis",
  "Solar & inverters",
  "Generators & changeover",
  "Lighting installation",
  "Testing & safety checks",
  "Maintenance contracts",
];

const REASSURANCE = [
  "Free, no-obligation quotes",
  "Emergency line for urgent faults",
  "Clear, itemised pricing",
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid [mask-image:radial-gradient(70%_60%_at_50%_0%,#000_30%,transparent_100%)]" />
        <div className="absolute -top-24 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-volt-500/20 blur-[120px]" />
        <div className="shell relative pb-16 pt-16 sm:pt-24">
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <Reveal>
                <span className="inline-flex items-center gap-2 rounded-full border border-volt-400/25 bg-volt-400/10 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-volt-300">
                  <BoltIcon className="h-3.5 w-3.5" />
                  {site.serviceArea}
                </span>
              </Reveal>
              <Reveal delay={80}>
                <h1 className="mt-5 font-display text-4xl font-extrabold uppercase leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
                  Power done right,{" "}
                  <span className="text-gradient">every single time.</span>
                </h1>
              </Reveal>
              <Reveal delay={160}>
                <p className="lead mt-5 max-w-xl">
                  Electrical work for homes, businesses and backup power across Greater Accra —{" "}
                  wiring, fault finding, distribution boards, solar and generator systems. Local
                  pricing in GHS, safety-first workmanship.
                </p>
              </Reveal>
              <Reveal delay={240}>
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <Link href="/book" className="btn btn-primary">
                    Request a Quote <ArrowRightIcon className="h-4 w-4" />
                  </Link>
                  <Link href="/services" className="btn btn-secondary">
                    Explore Services
                  </Link>
                </div>
              </Reveal>
              <Reveal delay={320}>
                <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4">
                  {[
                    { value: "6", label: "Service categories" },
                    { value: "GHS", label: "Local pricing" },
                    { value: "Greater Accra", label: "Service area" },
                  ].map((s) => (
                    <div key={s.label}>
                      <dt className="font-display text-xl font-extrabold text-volt-300 sm:text-2xl">
                        {s.value}
                      </dt>
                      <dd className="mt-1 text-xs leading-snug text-mist-400">{s.label}</dd>
                    </div>
                  ))}
                </dl>
              </Reveal>
            </div>

            <Reveal delay={200}>
              <HeroPanel />
            </Reveal>
          </div>
        </div>
      </section>

      {/* Trust marquee */}
      <section className="section-alt">
        <div className="relative flex overflow-hidden py-4">
          <div className="marquee-track flex shrink-0 items-center gap-8 pr-8">
            {[...TRUST, ...TRUST].map((t, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-2 whitespace-nowrap text-sm text-mist-400"
              >
                <BoltIcon className="h-4 w-4 text-forge-400" />
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="shell section">
        <SectionHeading
          eyebrow="What we do"
          title="Six service categories, one reliable team"
          lede="Whether it's a quick repair or a full power-system upgrade, we handle it safely and to recognised practice — with clear scope and honest pricing."
        />

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {serviceGroups.map((g, i) => {
            const Icon = iconByName[g.icon];
            return (
              <Reveal key={g.id} delay={i * 70} as="article" className="h-full">
                <Link href={`/services#${g.id}`} className="card card-hover group flex h-full flex-col">
                  <span className="icon-chip">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-5 text-lg font-bold text-white">{g.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-mist-400">{g.blurb}</p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-volt-300">
                    Read more
                    <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* Shop */}
      <ShopSection />

      {/* Solar & EV specialist */}
      <section className="shell pt-16">
        <Reveal>
          <SolarEvContact compact />
        </Reveal>
      </section>

      {/* Features */}
      <section className="section-alt">
        <div className="shell section">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <Reveal>
              <p className="eyebrow-forge">Why PhaseForge</p>
              <h2 className="section-title mt-3">Safety first. Excellence always.</h2>
              <p className="lead mt-4 text-base sm:text-lg">
                You’re trusting us with your home or business. We treat that seriously — clear
                communication, honest pricing and workmanship we’re proud to stand behind.
              </p>
              <Link href="/about" className="link-accent mt-6">
                More about us <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </Reveal>
            <div className="grid gap-4 sm:grid-cols-2">
              {FEATURES.map((f, i) => (
                <Reveal key={f.title} delay={i * 70} className="h-full">
                  <div className="card card-quiet h-full">
                    <f.icon className="h-6 w-6 text-volt-400" />
                    <h3 className="mt-4 font-bold text-white">{f.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-mist-400">{f.text}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="shell section">
        <SectionHeading
          align="center"
          eyebrow="How it works"
          title="Simple, transparent, done"
        />
        <ol className="mt-12 grid gap-5 md:grid-cols-4">
          {PROCESS.map((p, i) => (
            <Reveal key={p.n} delay={i * 80} as="li" className="h-full">
              <div className="card h-full">
                <span className="font-display text-3xl font-extrabold text-volt-500/40">{p.n}</span>
                <h3 className="mt-3 font-bold text-white">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-mist-400">{p.text}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </section>

      {/* What we cover */}
      <section className="section-alt">
        <div className="shell section">
          <SectionHeading
            eyebrow="Coverage & approach"
            title="Straightforward service across Greater Accra"
            lede="From routine repairs to full project wiring, we work to clear scope and honest pricing. Tell us the job and we'll confirm what it needs."
          />
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              {
                title: "Clear scope before work starts",
                text: "We assess the job, explain what's involved and separate labour, materials and any travel or call-out charges.",
              },
              {
                title: "Materials you can trust",
                text: "We install and supply genuine, branded electrical materials with manufacturer warranties.",
              },
              {
                title: "Written findings on testing work",
                text: "Condition assessments and protective-device checks come with written findings and any remedial recommendations.",
              },
            ].map((t, i) => (
              <Reveal key={t.title} delay={i * 80} className="h-full">
                <figure className="card card-quiet h-full">
                  <span className="icon-chip">
                    <CheckIcon className="h-5 w-5" />
                  </span>
                  <figcaption className="mt-4 font-bold text-white">{t.title}</figcaption>
                  <p className="mt-2 text-sm leading-relaxed text-mist-400">{t.text}</p>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="shell section">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-volt-400/20 bg-gradient-to-br from-volt-600/20 via-ink-900 to-ink-950 p-8 sm:p-12">
            <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-forge-500/20 blur-3xl" />
            <div className="relative grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-center">
              <div>
                <h2 className="section-title">Got an electrical job? Let&apos;s scope it properly.</h2>
                <p className="lead mt-4 max-w-xl text-base sm:text-lg">
                  Send us the details and we&apos;ll come back with clear scope and pricing. For
                  urgent faults, call the emergency line to check availability.
                </p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <Link href="/book" className="btn btn-primary">
                    Request a Quote <ArrowRightIcon className="h-4 w-4" />
                  </Link>
                  <a
                    href={waLink("Hello PhaseForge, I'd like to discuss an electrical job.")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-wa"
                  >
                    <WhatsAppIcon className="h-5 w-5" /> WhatsApp us
                  </a>
                </div>
              </div>
              <ul className="space-y-3">
                {REASSURANCE.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-3 rounded-xl border border-white/10 bg-ink-950/50 px-4 py-3 text-sm text-mist-200"
                  >
                    <CheckIcon className="h-5 w-5 shrink-0 text-forge-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}

function HeroPanel() {
  const services = [
    "Wiring & rewiring",
    "Distribution boards",
    "Solar & inverters",
    "Generators & changeover",
  ];
  return (
    <div className="relative">
      <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br from-volt-500/20 to-forge-500/10 blur-2xl" />
      <div className="rounded-3xl border border-volt-400/20 bg-ink-900/80 p-6 shadow-2xl backdrop-blur">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-widest text-mist-400">What we cover</div>
            <div className="mt-1 font-display text-lg font-bold text-white">
              Across Greater Accra
            </div>
          </div>
          <span className="pill bg-volt-400/10 text-volt-300 ring-1 ring-volt-400/25">
            <BoltIcon className="h-3.5 w-3.5" /> GHS pricing
          </span>
        </div>

        <ul className="mt-5 space-y-2.5">
          {services.map((s) => (
            <li
              key={s}
              className="flex items-center gap-3 rounded-xl border border-white/5 bg-ink-950/60 px-4 py-3 text-sm text-mist-200"
            >
              <CheckIcon className="h-4 w-4 shrink-0 text-volt-400" />
              {s}
            </li>
          ))}
        </ul>

        <div className="mt-5 rounded-xl border border-white/5 bg-gradient-to-br from-volt-500/10 to-transparent p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <BoltIcon className="h-4 w-4 text-forge-400" />
            Urgent electrical fault?
          </div>
          <p className="mt-1.5 text-xs text-mist-400">
            Call our emergency line to check availability — keep away from sparking or live
            equipment.
          </p>
          <div className="mt-3 flex flex-col gap-2 text-sm sm:flex-row sm:items-center">
            {site.phones.map((p) => (
              <a
                key={p.tel}
                href={`tel:${p.tel}`}
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-mist-100 transition-colors hover:border-volt-400/50"
              >
                <PhoneIcon className="h-4 w-4 text-volt-400" /> {p.label}
              </a>
            ))}
            <a
              href={`tel:${site.emergencyPhone.tel}`}
              className="inline-flex items-center gap-2 rounded-lg border border-forge-400/30 bg-forge-500/10 px-3 py-2 text-forge-200 transition-colors hover:border-forge-400/60"
            >
              <PhoneIcon className="h-4 w-4 text-forge-400" /> {site.emergencyPhone.label}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
