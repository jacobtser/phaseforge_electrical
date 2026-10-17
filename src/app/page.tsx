import Link from "next/link";
import { site, serviceGroups } from "@/lib/site";
import { iconByName, ArrowRightIcon, BoltIcon, CheckIcon, ClockIcon, PhoneIcon, ShieldIcon, SparkIcon, WhatsAppIcon, WrenchIcon } from "@/components/Icons";
import { Reveal } from "@/components/Reveal";

const FEATURES = [
  { icon: ShieldIcon, title: "Licensed & compliant", text: "Work carried out to recognised electrical safety codes, with clear documentation." },
  { icon: ClockIcon, title: "Fast response", text: "Same-day emergency callouts and quick scheduling across Accra and Tema." },
  { icon: WrenchIcon, title: "Right the first time", text: "Diagnostics, parts and workmanship you can rely on — no repeat visits." },
  { icon: SparkIcon, title: "Energy-smart upgrades", text: "LED retrofits, power quality fixes and efficiency upgrades that cut bills." },
];

const PROCESS = [
  { n: "01", title: "Tell us what you need", text: "Book online or call. Describe the job, urgency and your location." },
  { n: "02", title: "Free assessment & quote", text: "We review the work and give you a clear, upfront price." },
  { n: "03", title: "We do the work", text: "A licensed electrician completes the job safely and tidily." },
  { n: "04", title: "Tested & guaranteed", text: "Everything is tested, explained and backed by our workmanship guarantee." },
];

const TESTIMONIALS = [
  { name: "Ama O.", role: "Homeowner, East Legon", text: "They rewired our whole house and installed a backup generator. Tidy, professional and on budget." },
  { name: "Kwesi B.", role: "Restaurant owner, Osu", text: "Our power kept tripping during service. PhaseForge found the fault and fixed it the same day." },
  { name: "Nadia A.", role: "Facilities, Tema", text: "Reliable preventive maintenance for our warehouse. Downtime has dropped noticeably." },
];

const TRUST = [
  "Panel & service upgrades",
  "Generator installation",
  "EV charger setup",
  "Emergency lighting",
  "Whole-home surge protection",
  "LED retrofits",
  "Safety inspections",
  "Low-voltage cabling",
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid [mask-image:radial-gradient(70%_60%_at_50%_0%,#000_30%,transparent_100%)]" />
        <div className="absolute -top-24 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-volt-500/20 blur-[120px]" />
        <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-16 sm:pt-24">
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <Reveal>
                <a href={`tel:${site.phones[0].tel}`} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-mist-200 hover:text-volt-300">
                  <span className="grid h-1.5 w-1.5 place-items-center">
                    <span className="h-1.5 w-1.5 rounded-full bg-forge-400 pulse-ring" />
                  </span>
                  {site.emergency} · Call now · {site.serviceArea}
                </a>
              </Reveal>
              <Reveal delay={80}>
                <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.05] text-white sm:text-5xl lg:text-6xl">
                  Power done right,{" "}
                  <span className="text-gradient">every single time.</span>
                </h1>
              </Reveal>
              <Reveal delay={160}>
                <p className="mt-5 max-w-xl text-lg leading-relaxed text-mist-300">
                  From flickering lights to full rewires, generator installs and EV chargers —
                  {` ${site.shortName}`} delivers safe, code-compliant electrical work for homes and
                  businesses in Accra and Tema.
                </p>
              </Reveal>
              <Reveal delay={240}>
                <div className="mt-8 flex flex-wrap items-center gap-3">
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
              <Reveal delay={320}>
                <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4">
                  {site.stats.map((s) => (
                    <div key={s.label}>
                      <dt className="font-display text-2xl font-extrabold text-white sm:text-3xl">
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
      <section className="border-y border-white/5 bg-ink-900/60">
        <div className="relative flex overflow-hidden py-4">
          <div className="marquee-track flex shrink-0 items-center gap-8 pr-8">
            {[...TRUST, ...TRUST].map((t, i) => (
              <span key={i} className="inline-flex items-center gap-2 whitespace-nowrap text-sm text-mist-400">
                <BoltIcon className="h-4 w-4 text-forge-400" />
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="mx-auto max-w-7xl px-4 py-20">
        <Reveal className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-volt-400">What we do</p>
          <h2 className="mt-3 font-display text-3xl font-extrabold text-white sm:text-4xl">
            Complete electrical services, one trusted team
          </h2>
          <p className="mt-4 text-mist-300">
            Whether it&apos;s a quick repair or a full power-system upgrade, our licensed electricians
            handle it safely, efficiently and to the highest standards.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {serviceGroups.map((g, i) => {
            const Icon = iconByName[g.icon];
            return (
              <Reveal key={g.id} delay={i * 70} as="article">
                <Link
                  href={`/services#${g.id}`}
                  className="group flex h-full flex-col rounded-2xl border border-white/10 bg-ink-900/60 p-6 transition-all hover:-translate-y-1 hover:border-volt-400/50 hover:bg-ink-850"
                >
                  <span className="grid h-12 w-12 place-items-center rounded-xl bg-volt-500/10 text-volt-300 ring-1 ring-volt-400/20">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-5 text-lg font-bold text-white">{g.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-mist-400">{g.blurb}</p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-volt-300">
                    {g.items.length} services
                    <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* Features */}
      <section className="border-y border-white/5 bg-ink-900/40">
        <div className="mx-auto max-w-7xl px-4 py-20">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <Reveal>
              <p className="text-sm font-semibold uppercase tracking-widest text-forge-400">
                Why PhaseForge
              </p>
              <h2 className="mt-3 font-display text-3xl font-extrabold text-white sm:text-4xl">
                Safety first. Excellence always.
              </h2>
              <p className="mt-4 text-mist-300">
                You&apos;re trusting us with your home or business. We treat that seriously — clear
                communication, honest pricing and workmanship we&apos;re proud to stand behind.
              </p>
              <Link
                href="/about"
                className="mt-6 inline-flex items-center gap-2 font-semibold text-volt-300 hover:underline"
              >
                More about us <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </Reveal>
            <div className="grid gap-4 sm:grid-cols-2">
              {FEATURES.map((f, i) => (
                <Reveal key={f.title} delay={i * 70}>
                  <div className="h-full rounded-2xl border border-white/10 bg-ink-950/60 p-6">
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
      <section className="mx-auto max-w-7xl px-4 py-20">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-volt-400">
            How it works
          </p>
          <h2 className="mt-3 font-display text-3xl font-extrabold text-white sm:text-4xl">
            Simple, transparent, done
          </h2>
        </Reveal>
        <ol className="mt-12 grid gap-5 md:grid-cols-4">
          {PROCESS.map((p, i) => (
            <Reveal key={p.n} delay={i * 80} as="li">
              <div className="relative h-full rounded-2xl border border-white/10 bg-ink-900/60 p-6">
                <span className="font-display text-3xl font-extrabold text-volt-500/40">{p.n}</span>
                <h3 className="mt-3 font-bold text-white">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-mist-400">{p.text}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </section>

      {/* Testimonials */}
      <section className="border-y border-white/5 bg-ink-900/40">
        <div className="mx-auto max-w-7xl px-4 py-20">
          <Reveal className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-volt-400">
              Loved by clients
            </p>
            <h2 className="mt-3 font-display text-3xl font-extrabold text-white sm:text-4xl">
              Trusted across Accra &amp; Tema
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={t.name} delay={i * 80}>
                <figure className="h-full rounded-2xl border border-white/10 bg-ink-950/60 p-6">
                  <div className="flex gap-1 text-forge-400" aria-hidden>
                    {Array.from({ length: 5 }).map((_, k) => (
                      <span key={k}>★</span>
                    ))}
                  </div>
                  <blockquote className="mt-4 text-sm leading-relaxed text-mist-200">
                    &ldquo;{t.text}&rdquo;
                  </blockquote>
                  <figcaption className="mt-4 text-xs text-mist-400">
                    <span className="font-semibold text-white">{t.name}</span> · {t.role}
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-20">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-volt-400/20 bg-gradient-to-br from-volt-600/20 via-ink-900 to-ink-950 p-8 sm:p-12">
            <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-forge-500/20 blur-3xl" />
            <div className="relative grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-center">
              <div>
                <h2 className="font-display text-3xl font-extrabold text-white sm:text-4xl">
                  Got an electrical job? Let&apos;s forge a plan.
                </h2>
                <p className="mt-4 max-w-xl text-mist-300">
                  Book online in under a minute. We&apos;ll confirm your appointment and get a licensed
                  electrician to you fast.
                </p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <Link
                    href="/book"
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-volt-400 to-volt-600 px-6 py-3.5 font-bold text-ink-950 shadow-[0_0_36px_-10px_rgba(14,165,233,0.9)] transition-transform hover:-translate-y-0.5"
                  >
                    Book a visit <ArrowRightIcon className="h-4 w-4" />
                  </Link>
                  <a
                    href={`https://wa.me/${site.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-6 py-3.5 font-bold text-[#052e16] transition-transform hover:-translate-y-0.5"
                  >
                    <WhatsAppIcon className="h-5 w-5" /> WhatsApp us
                  </a>
                </div>
              </div>
              <ul className="space-y-3">
                {["Free, no-obligation quotes", "Same-day emergency response", "Workmanship guarantee"].map(
                  (item) => (
                    <li key={item} className="flex items-center gap-3 rounded-xl border border-white/10 bg-ink-950/50 px-4 py-3 text-sm text-mist-200">
                      <CheckIcon className="h-5 w-5 shrink-0 text-forge-400" />
                      {item}
                    </li>
                  ),
                )}
              </ul>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}

function HeroPanel() {
  const rows = [
    { label: "Main panel", value: "Stable", tone: "ok" as const },
    { label: "Backup generator", value: "Standby", tone: "ok" as const },
    { label: "Surge protection", value: "Active", tone: "ok" as const },
  ];
  return (
    <div className="relative">
      <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br from-volt-500/20 to-forge-500/10 blur-2xl" />
      <div className="rounded-3xl border border-white/10 bg-ink-900/80 p-6 shadow-2xl backdrop-blur">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-widest text-mist-400">Live job board</div>
            <div className="mt-1 font-display text-lg font-bold text-white">
              System status
            </div>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300 ring-1 ring-emerald-400/20">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> All good
          </span>
        </div>

        <div className="mt-5 space-y-2.5">
          {rows.map((r) => (
            <div
              key={r.label}
              className="flex items-center justify-between rounded-xl border border-white/5 bg-ink-950/60 px-4 py-3"
            >
              <span className="text-sm text-mist-300">{r.label}</span>
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-300">
                <CheckIcon className="h-4 w-4" /> {r.value}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-xl border border-white/5 bg-gradient-to-br from-volt-500/10 to-transparent p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <BoltIcon className="h-4 w-4 text-forge-400" />
            Emergency? We answer 24/7.
          </div>
          <div className="mt-3 flex flex-col gap-2 text-sm sm:flex-row sm:items-center">
            {site.phones.map((p) => (
              <a
                key={p.tel}
                href={`tel:${p.tel}`}
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-mist-100 hover:border-volt-400/50"
              >
                <PhoneIcon className="h-4 w-4 text-volt-400" /> {p.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
