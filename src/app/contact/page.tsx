import type { Metadata } from "next";
import { site, solarEvWaLink, waLink } from "@/lib/site";
import { BookingForm } from "@/components/BookingForm";
import { ClockIcon, MailIcon, MapPinIcon, PhoneIcon, WhatsAppIcon } from "@/components/Icons";
import { Reveal } from "@/components/Reveal";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Contact PhaseForge Electrical & Power in Greater Accra. Call, email or WhatsApp us, or send a message and we'll get back to you.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title={"Let's talk power"}
        lede="Questions, quotes or emergencies — reach us however suits you. Messages sent here go straight to our team by email and WhatsApp."
      />

      <section className="shell section">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <Reveal>
            <div className="space-y-4">
              <ContactCard icon={PhoneIcon} title="Call or text">
                {site.phones.map((p) => (
                  <a
                    key={p.tel}
                    href={`tel:${p.tel}`}
                    className="block text-mist-200 transition-colors hover:text-volt-300"
                  >
                    {p.label}
                  </a>
                ))}
              </ContactCard>

              <ContactCard icon={WhatsAppIcon} title="WhatsApp">
                <a
                  href={waLink(`Hello ${site.shortName}, I have a question.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-mist-200 transition-colors hover:text-[#25D366]"
                >
                  Chat with us now
                </a>
                <a
                  href={solarEvWaLink(
                    "Hello PhaseForge, I'd like to speak with your solar & EV specialist.",
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-forge-300 transition-colors hover:text-forge-200"
                >
                  Solar &amp; EV specialist: {site.solarEv.label}
                </a>
              </ContactCard>

              <ContactCard icon={MailIcon} title="Email">
                <a
                  href={`mailto:${site.email}`}
                  className="text-mist-200 transition-colors hover:text-volt-300"
                >
                  {site.email}
                </a>
              </ContactCard>

              <ContactCard icon={MapPinIcon} title="Service area">
                <span className="text-mist-200">{site.serviceArea}</span>
              </ContactCard>

              <ContactCard icon={ClockIcon} title="Hours">
                {site.hours.map((h) => (
                  <div key={h.day} className="flex justify-between gap-4 text-mist-300">
                    <span>{h.day}</span>
                    <span className="text-mist-200">{h.time}</span>
                  </div>
                ))}
                <p className="mt-2 font-semibold text-forge-300">{site.emergency}</p>
                <a
                  href={`tel:${site.emergencyPhone.tel}`}
                  className="link-accent mt-2 text-sm"
                >
                  Call the emergency line: {site.emergencyPhone.label}
                </a>
              </ContactCard>

              <div className="overflow-hidden rounded-2xl border border-white/10">
                <iframe
                  title="PhaseForge service area map"
                  src="https://www.google.com/maps?q=Accra%2C%20Ghana&output=embed"
                  className="h-64 w-full"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="card card-p6 sm:card-p8">
              <h2 className="font-display text-2xl font-extrabold text-white">Send us a message</h2>
              <p className="mt-2 text-sm text-mist-400">
                Fill in the form and we&apos;ll respond by email, phone or WhatsApp.
              </p>
              <div className="mt-6">
                <BookingForm mode="contact" />
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

function ContactCard({
  icon: Icon,
  title,
  children,
}: {
  icon: (p: { className?: string }) => React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card card-p5">
      <div className="flex items-center gap-3">
        <span className="icon-chip">
          <Icon className="h-5 w-5" />
        </span>
        <h2 className="font-bold text-white">{title}</h2>
      </div>
      <div className="mt-3 space-y-1 text-sm">{children}</div>
    </div>
  );
}
