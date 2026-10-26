import Link from "next/link";
import { site, serviceGroups, waLink } from "@/lib/site";
import {
  BoltIcon,
  ArrowRightIcon,
  ShieldIcon,
  ClockIcon,
  WrenchIcon,
  SparkIcon,
  PhoneIcon,
  WhatsAppIcon,
  iconByName,
} from "@/components/Icons";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        {/* Hero — direct format from example */}
        <section className="relative bg-ink-950 overflow-hidden">
          <div className="shell pt-16 pb-12 sm:pt-24 sm:pb-16">
            <div className="max-w-3xl">
              <p className="text-volt-300 font-bold tracking-widest text-sm uppercase">Reliable. Professional. Local.</p>
              <h1 className="mt-4 font-display text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-[1.05] tracking-tight">
                Trusted electricians <span className="text-volt-300">for your home and business.</span>
              </h1>
              <p className="mt-6 lead max-w-xl">
                Safe, high-quality electrical work across Greater Accra — wiring, repairs, solar, generators and testing. Clear quotes, no hidden costs.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/book" className="btn btn-primary">Request a Quote <ArrowRightIcon className="h-4 w-4" /></Link>
                <Link href="/services" className="btn btn-secondary">Our Services <ArrowRightIcon className="h-4 w-4" /></Link>
              </div>
            </div>
          </div>
        </section>

        {/* 4 direct value cards — from example layout */}
        <section className="shell section">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: ShieldIcon, title: "NICEIC standard", text: "Work carried out to recognised electrical safety practices, fully documented." },
              { icon: ClockIcon, title: "Responsive scheduling", text: "Urgent faults handled quickly. Clear availability across Greater Accra." },
              { icon: WrenchIcon, title: "Right the first time", text: "Proper diagnosis, correct materials and reliable workmanship." },
              { icon: SparkIcon, title: "Energy-smart", text: "Solar, LED retrofits and backup upgrades that cut bills." },
            ].map((v) => (
              <div key={v.title} className="card card-quiet">
                <v.icon className="h-6 w-6 text-volt-400" />
                <h3 className="mt-4 font-bold text-white">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-mist-400">{v.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Services intro — direct */}
        <section className="shell section">
          <div className="text-center max-w-2xl mx-auto">
            <span className="inline-block rounded-full bg-volt-400/10 px-3 py-1 text-xs font-bold tracking-widest text-volt-300 uppercase">Quality Services</span>
            <h2 className="section-title mt-4">We Provide Electrical Services</h2>
            <p className="lead mt-4">From small repairs to full installations — domestic, commercial, solar, generators and safety testing.</p>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {serviceGroups.map((g) => {
              const Icon = iconByName[g.icon];
              return (
                <div key={g.id} className="card">
                  <div className="flex items-center gap-3">
                    <span className="icon-chip"><Icon className="h-5 w-5" /></span>
                    <h3 className="font-display font-extrabold text-lg text-white">{g.title}</h3>
                  </div>
                  <p className="mt-3 text-sm text-mist-300 leading-relaxed">{g.blurb}</p>
                  <Link href={`/services#${g.id}`} className="link-accent mt-4 inline-flex">Read More <ArrowRightIcon className="h-4 w-4" /></Link>
                </div>
              );
            })}
          </div>
        </section>

        {/* Bottom info strip — direct format from example */}
        <section className="shell pb-12">
          <div className="rounded-2xl border border-white/10 bg-ink-950 p-6 sm:p-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-5 text-sm">
            <div>
              <p className="font-bold text-white">Location</p>
              <p className="text-mist-400 mt-1">Greater Accra, Ghana</p>
            </div>
            <div>
              <p className="font-bold text-white">Call Today</p>
              <a href={`tel:${site.phones[0].tel}`} className="text-volt-300 hover:underline mt-1 block">{site.phones[0].label}</a>
            </div>
            <div>
              <p className="font-bold text-white">Opening Hours</p>
              <p className="text-mist-400 mt-1">Mon–Fri: 8:00am – 6:00pm</p>
              <p className="text-mist-400">Sat: 9:00am – 1:00pm</p>
            </div>
            <div>
              <p className="font-bold text-white">Fully Insured</p>
              <p className="text-mist-400 mt-1">Your safety is our priority.</p>
            </div>
            <div>
              <p className="font-bold text-white">WhatsApp</p>
              <a href={waLink("Hello PhaseForge.")} className="inline-flex items-center gap-2 mt-1 text-volt-300 hover:underline"><WhatsAppIcon className="h-4 w-4" /> Chat now</a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
