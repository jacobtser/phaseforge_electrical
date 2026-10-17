import type { Metadata } from "next";
import { site } from "@/lib/site";
import { BookingForm } from "@/components/BookingForm";
import { CheckIcon, ClockIcon, PhoneIcon, ShieldIcon, WhatsAppIcon } from "@/components/Icons";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Book a Visit or Order a Service",
  description:
    "Book an electrical appointment, order a service or request a free quote from PhaseForge Electrical in Accra and Tema. Fast confirmation by email and WhatsApp.",
  alternates: { canonical: "/book" },
};

const REASSURANCE = [
  { icon: CheckIcon, title: "Free quotes", text: "No-obligation estimates for scheduled work." },
  { icon: ClockIcon, title: "Quick response", text: "We confirm and reply within hours." },
  { icon: ShieldIcon, title: "Licensed & insured", text: "Safe, code-compliant workmanship." },
];

export default function BookPage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-grid [mask-image:radial-gradient(60%_70%_at_50%_0%,#000_25%,transparent_100%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:py-16">
          <Reveal className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-volt-400">
              Book online
            </p>
            <h1 className="mt-3 font-display text-4xl font-extrabold text-white sm:text-5xl">
              Book a visit or order a service
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-mist-300">
              Tell us what you need and we&apos;ll be in touch fast. Book an appointment, order a job
              or request a free quote — it takes under a minute.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14">
        <div className="grid gap-10 lg:grid-cols-[1.35fr_0.65fr]">
          <Reveal>
            <div className="rounded-2xl border border-white/10 bg-ink-900/50 p-6 sm:p-8">
              <BookingForm mode="full" />
            </div>
          </Reveal>

          <Reveal delay={120}>
            <aside className="space-y-4 lg:sticky lg:top-24">
              <div className="rounded-2xl border border-white/10 bg-ink-900/60 p-6">
                <h2 className="font-display text-lg font-extrabold text-white">What happens next</h2>
                <ol className="mt-4 space-y-3 text-sm text-mist-300">
                  {[
                    "We log your request with a reference number.",
                    "Our team is alerted by email and WhatsApp instantly.",
                    "You get an emailed confirmation.",
                    "We contact you to confirm details and timing.",
                  ].map((s, i) => (
                    <li key={s} className="flex gap-3">
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-volt-500/15 text-xs font-bold text-volt-300">
                        {i + 1}
                      </span>
                      {s}
                    </li>
                  ))}
                </ol>
              </div>

              <div className="space-y-3 rounded-2xl border border-white/10 bg-ink-900/60 p-6">
                {REASSURANCE.map((r) => (
                  <div key={r.title} className="flex gap-3">
                    <r.icon className="mt-0.5 h-5 w-5 shrink-0 text-forge-400" />
                    <div>
                      <div className="text-sm font-semibold text-white">{r.title}</div>
                      <div className="text-xs text-mist-400">{r.text}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-forge-500/20 bg-forge-500/10 p-6">
                <h2 className="font-display text-lg font-extrabold text-white">Emergency?</h2>
                <p className="mt-2 text-sm text-forge-200/90">
                  Don&apos;t wait on a form — call us now and we&apos;ll dispatch a licensed
                  electrician.
                </p>
                <div className="mt-4 flex flex-col gap-2">
                  {site.phones.map((p) => (
                    <a
                      key={p.tel}
                      href={`tel:${p.tel}`}
                      className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-ink-950/40 px-3 py-2 text-sm font-medium text-white hover:border-forge-400/50"
                    >
                      <PhoneIcon className="h-4 w-4 text-forge-400" /> {p.label}
                    </a>
                  ))}
                  <a
                    href={`https://wa.me/${site.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-3 py-2 text-sm font-bold text-[#052e16]"
                  >
                    <WhatsAppIcon className="h-4 w-4" /> WhatsApp
                  </a>
                </div>
              </div>
            </aside>
          </Reveal>
        </div>
      </section>
    </>
  );
}
