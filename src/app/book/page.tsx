import type { Metadata } from "next";
import { serviceGroups, site } from "@/lib/site";
import { BookingForm } from "@/components/BookingForm";
import { CheckIcon, ClockIcon, PhoneIcon, ShieldIcon, WhatsAppIcon } from "@/components/Icons";
import { Reveal } from "@/components/Reveal";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Book a Visit or Order a Service",
  description:
    "Book an electrical appointment, order a service or request a quote from PhaseForge Electrical & Power in Greater Accra. Confirmation by email and WhatsApp.",
  alternates: { canonical: "/book" },
};

const REASSURANCE = [
  { icon: CheckIcon, title: "Free quotes", text: "No-obligation estimates for scheduled work." },
  { icon: ClockIcon, title: "Quick response", text: "We confirm and reply within hours." },
  { icon: ShieldIcon, title: "Safety first", text: "Work carried out to recognised electrical practice." },
];

const NEXT_STEPS = [
  "We log your request with a reference number.",
  "Our team is alerted by email and WhatsApp instantly.",
  "You get an emailed confirmation.",
  "We contact you to confirm details and timing.",
];

export default async function BookPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; service?: string }>;
}) {
  const params = await searchParams;
  const category = serviceGroups.find((group) => group.id === params.category)?.id;
  const service =
    category && typeof params.service === "string" ? params.service.slice(0, 120) : undefined;

  return (
    <>
      <PageHero
        eyebrow="Book online"
        title="Book a visit or order a service"
        lede="Tell us what you need and we’ll be in touch fast. Book an appointment, order a job or request a free quote — it takes under a minute."
      />

      <section className="shell section">
        <div className="grid gap-10 lg:grid-cols-[1.35fr_0.65fr]">
          <Reveal>
            <div className="card card-p6 sm:card-p8">
              <BookingForm mode="full" defaultCategory={category} defaultService={service} />
            </div>
          </Reveal>

          <Reveal delay={120}>
            <aside className="space-y-4 lg:sticky lg:top-24">
              <div className="card">
                <h2 className="font-display text-lg font-extrabold text-white">What happens next</h2>
                <ol className="mt-4 space-y-3 text-sm text-mist-300">
                  {NEXT_STEPS.map((s, i) => (
                    <li key={s} className="flex gap-3">
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-volt-500/15 text-xs font-bold text-volt-300">
                        {i + 1}
                      </span>
                      {s}
                    </li>
                  ))}
                </ol>
              </div>

              <div className="card space-y-3">
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
                <h2 className="font-display text-lg font-extrabold text-white">
                  Urgent electrical fault?
                </h2>
                <p className="mt-2 text-sm text-forge-200/90">
                  Don&apos;t wait on a form — call the emergency line to check availability. Keep
                  away from sparking or live equipment.
                </p>
                <div className="mt-4 flex flex-col gap-2">
                  {site.phones.map((p) => (
                    <a
                      key={p.tel}
                      href={`tel:${p.tel}`}
                      className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-ink-950/40 px-3 py-2 text-sm font-medium text-white transition-colors hover:border-forge-400/50"
                    >
                      <PhoneIcon className="h-4 w-4 text-forge-400" /> {p.label}
                    </a>
                  ))}
                  <a
                    href={`tel:${site.emergencyPhone.tel}`}
                    className="inline-flex items-center gap-2 rounded-lg border border-forge-400/40 bg-forge-500/15 px-3 py-2 text-sm font-semibold text-forge-100 transition-colors hover:border-forge-300/70"
                  >
                    <PhoneIcon className="h-4 w-4 text-forge-300" /> {site.emergencyPhone.label}{" "}
                    <span className="text-xs font-normal text-forge-200/80">(emergency)</span>
                  </a>
                  <a
                    href={`https://wa.me/${site.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-wa btn-sm justify-center"
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
