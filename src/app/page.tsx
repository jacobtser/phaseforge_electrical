import Link from "next/link";
import { site, serviceGroups, waLink } from "@/lib/site";
import { HeroArt } from "@/components/HeroArt";
import { ServiceCard } from "@/components/ServiceCard";
import { ShopSection } from "@/components/ShopSection";
import { SectionHeading } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import {
  ArrowRightIcon,
  BoltIcon,
  CheckIcon,
  ClipboardIcon,
  ClockIcon,
  GaugeIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  TagIcon,
  WhatsAppIcon,
} from "@/components/Icons";

/* Trust strip — factual statements about how the business works only.
   Spec 5.2: no unverified licences, insurance, job counts or 24/7 promises. */
const TRUST = [
  {
    icon: ClipboardIcon,
    title: "Clear quotes first",
    text: "You see and approve the price before any work starts.",
  },
  {
    icon: GaugeIcon,
    title: "Tested before handover",
    text: "Circuits are checked and explained to you when the job is done.",
  },
  {
    icon: MapPinIcon,
    title: "Local to Greater Accra",
    text: "Kasoa, Tema, Kpone, East Legon and surrounding areas.",
  },
  {
    icon: TagIcon,
    title: "Pay the way that suits you",
    text: "Mobile Money, card, bank transfer or cash.",
  },
];

/* The service workflow from the specification ("How it works"). */
const STEPS = [
  { title: "Request", text: "Book online, call or WhatsApp with what you need." },
  { title: "Review", text: "We look at the details and photos, and ask anything missing." },
  { title: "Quote & approval", text: "You get a clear price and decide — no work before you agree." },
  { title: "Schedule", text: "We confirm a date and time that works for you." },
  { title: "Work & testing", text: "The job is done safely, then tested before handover." },
  { title: "Payment & follow-up", text: "Pay your preferred way. We check in afterwards." },
];

export default function HomePage() {
  return (
    <>
      {/* Hero — split layout: message left, illustration right */}
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-grid [mask-image:radial-gradient(70%_80%_at_30%_10%,#000_20%,transparent_100%)]" />
        <div className="shell relative grid items-center gap-12 pt-12 pb-16 sm:pt-16 lg:grid-cols-[1.1fr_0.9fr] lg:pb-20">
          <div>
            <p className="eyebrow">{site.tagline}</p>
            <h1 className="mt-4 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-[4.25rem]">
              Electrical work for your <span className="text-gradient">home and business.</span>
            </h1>
            <p className="lead mt-6 max-w-xl">
              Wiring, repairs, distribution boards, solar and backup power, and safety testing across
              Greater Accra. Clear quotes, safe work, tested before handover.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/book?type=quote" className="btn btn-primary btn-lg">
                <BoltIcon className="h-4 w-4" /> Request a Quote
              </Link>
              <Link href="/services" className="btn btn-secondary btn-lg">
                Explore Services <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-mist-300">
              <li>
                <a href={`tel:${site.phones[0].tel}`} className="inline-flex items-center gap-2 hover:text-volt-300">
                  <PhoneIcon className="h-4 w-4 text-volt-400" /> {site.phones[0].label}
                </a>
              </li>
              <li>
                <a
                  href={waLink("Hello PhaseForge, I'd like help with some electrical work.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 hover:text-volt-300"
                >
                  <WhatsAppIcon className="h-4 w-4 text-[#25D366]" /> WhatsApp us
                </a>
              </li>
              <li className="inline-flex items-center gap-2">
                <MapPinIcon className="h-4 w-4 text-volt-400" /> {site.location}
              </li>
            </ul>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="rounded-3xl border border-white/10 bg-ink-900/70 p-4 shadow-[0_40px_120px_-40px_rgba(59,155,255,0.35)] sm:p-6">
              <HeroArt />
            </div>
            <div className="absolute -left-2 top-8 hidden rounded-xl border border-white/10 bg-ink-950/95 px-4 py-3 text-sm shadow-xl backdrop-blur sm:block lg:-left-8">
              <p className="flex items-center gap-2 font-semibold text-white">
                <CheckIcon className="h-4 w-4 text-volt-400" /> Price agreed before work
              </p>
            </div>
            <div className="absolute -right-2 bottom-10 hidden rounded-xl border border-white/10 bg-ink-950/95 px-4 py-3 text-sm shadow-xl backdrop-blur sm:block lg:-right-4">
              <p className="text-xs uppercase tracking-widest text-mist-400">Covering</p>
              <p className="mt-1 font-semibold text-white">Kasoa · Tema · Kpone · East Legon</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust strip — factual statements only */}
      <section className="shell -mt-px py-10">
        <ul className="grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
          {TRUST.map((t) => (
            <li key={t.title} className="flex gap-4 bg-ink-950 p-6">
              <span className="icon-chip h-11 w-11">
                <t.icon className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-sm font-bold text-white">{t.title}</h2>
                <p className="mt-1 text-sm leading-relaxed text-mist-400">{t.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Services — six image-led cards */}
      <section className="shell section">
        <SectionHeading
          align="center"
          eyebrow="Our services"
          title="Electrical services for every kind of property"
          lede="From a single faulty socket to a full solar backup system — choose a service to see what's included and what we need to quote."
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {serviceGroups.map((g, i) => (
            <Reveal key={g.id} delay={i * 60} className="h-full">
              <ServiceCard group={g} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="section-alt">
        <div className="shell section">
          <SectionHeading
            eyebrow="How it works"
            title="From first message to finished job"
            lede="A clear process, so you always know what happens next — and a request is never mistaken for a confirmed appointment."
          />
          <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.title} className="card card-quiet flex gap-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-volt-400 font-display text-sm font-extrabold text-ink-950">
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-bold text-white">{s.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-mist-400">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Product spotlight */}
      <ShopSection />

      {/* Contact strip */}
      <section className="shell section">
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-ink-800 via-ink-900 to-ink-950">
          <div className="grid gap-10 p-8 sm:p-10 lg:grid-cols-[1fr_1.3fr] lg:p-12">
            <div>
              <p className="eyebrow">Get in touch</p>
              <h2 className="section-title mt-3">Tell us what you need</h2>
              <p className="lead mt-4 text-base">
                Send a request with a short description and photos if you have them. We reply during
                working hours with next steps.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/book" className="btn btn-primary">
                  Book a visit <ArrowRightIcon className="h-4 w-4" />
                </Link>
                <a
                  href={waLink("Hello PhaseForge, I'd like help with some electrical work.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-wa"
                >
                  <WhatsAppIcon className="h-5 w-5" /> WhatsApp
                </a>
              </div>
            </div>

            <dl className="grid gap-6 text-sm sm:grid-cols-2">
              <div className="flex gap-3">
                <PhoneIcon className="mt-0.5 h-5 w-5 shrink-0 text-volt-400" />
                <div>
                  <dt className="font-bold text-white">Call</dt>
                  {site.phones.map((p) => (
                    <dd key={p.tel}>
                      <a href={`tel:${p.tel}`} className="text-mist-300 hover:text-volt-300">
                        {p.label}
                      </a>
                    </dd>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <BoltIcon className="mt-0.5 h-5 w-5 shrink-0 text-forge-400" />
                <div>
                  <dt className="font-bold text-white">Emergency line</dt>
                  <dd>
                    <a href={`tel:${site.emergencyPhone.tel}`} className="text-mist-300 hover:text-volt-300">
                      {site.emergencyPhone.label}
                    </a>
                  </dd>
                  <dd className="text-mist-500">Call to check availability</dd>
                </div>
              </div>
              <div className="flex gap-3">
                <ClockIcon className="mt-0.5 h-5 w-5 shrink-0 text-volt-400" />
                <div>
                  <dt className="font-bold text-white">Hours</dt>
                  {site.hours.map((h) => (
                    <dd key={h.day} className="text-mist-300">
                      <span className="text-mist-500">{h.day}:</span> {h.time}
                    </dd>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <MailIcon className="mt-0.5 h-5 w-5 shrink-0 text-volt-400" />
                <div>
                  <dt className="font-bold text-white">Email</dt>
                  <dd>
                    <a href={`mailto:${site.email}`} className="break-all text-mist-300 hover:text-volt-300">
                      {site.email}
                    </a>
                  </dd>
                </div>
              </div>
              <div className="flex gap-3 sm:col-span-2">
                <MapPinIcon className="mt-0.5 h-5 w-5 shrink-0 text-volt-400" />
                <div>
                  <dt className="font-bold text-white">Service area</dt>
                  <dd className="text-mist-300">{site.serviceArea}</dd>
                </div>
              </div>
            </dl>
          </div>
        </div>
      </section>
    </>
  );
}
