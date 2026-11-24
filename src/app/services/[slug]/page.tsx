import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getServiceGroup, serviceGroups, site, waLink } from "@/lib/site";
import { ServiceArt } from "@/components/ServiceArt";
import { ServiceCard } from "@/components/ServiceCard";
import { SolarEvContact } from "@/components/SolarEvContact";
import {
  ArrowRightIcon,
  BoltIcon,
  CheckIcon,
  ClipboardIcon,
  PhoneIcon,
  WhatsAppIcon,
  iconByName,
} from "@/components/Icons";

type Params = { slug: string };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return serviceGroups.map((g) => ({ slug: g.id }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const group = getServiceGroup(slug);
  if (!group) return {};
  return {
    title: `${group.title} in Greater Accra`,
    description: group.blurb,
    alternates: { canonical: `/services/${group.id}` },
    openGraph: { title: `${group.title} · ${site.shortName}`, description: group.blurb },
  };
}

export default async function ServiceDetailPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const group = getServiceGroup(slug);
  if (!group) notFound();

  const Icon = iconByName[group.icon];
  const isEmergency = group.id === "emergency";
  const others = serviceGroups.filter((g) => g.id !== group.id).slice(0, 3);
  const bookHref = `/book?category=${encodeURIComponent(group.id)}&type=quote`;

  return (
    <>
      {/* Header */}
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-grid [mask-image:radial-gradient(60%_70%_at_30%_0%,#000_25%,transparent_100%)]" />
        <div className="shell relative grid items-center gap-10 py-14 sm:py-16 lg:grid-cols-2">
          <div>
            <nav aria-label="Breadcrumb" className="text-sm text-mist-400">
              <ol className="flex flex-wrap items-center gap-2">
                <li>
                  <Link href="/services" className="hover:text-volt-300">
                    Services
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li aria-current="page" className="text-mist-200">
                  {group.title}
                </li>
              </ol>
            </nav>
            <div className="mt-6 flex items-center gap-3">
              <span className="icon-chip">
                <Icon className="h-6 w-6" />
              </span>
              <p className="eyebrow">{group.short}</p>
            </div>
            <h1 className="page-title mt-4">{group.title}</h1>
            <p className="lead mt-5 max-w-xl">{group.blurb}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              {isEmergency ? (
                <a href={`tel:${site.emergencyPhone.tel}`} className="btn btn-primary">
                  <PhoneIcon className="h-4 w-4" /> Call {site.emergencyPhone.label}
                </a>
              ) : (
                <Link href={bookHref} className="btn btn-primary">
                  Request a Quote <ArrowRightIcon className="h-4 w-4" />
                </Link>
              )}
              <a
                href={waLink(`Hello PhaseForge, I'd like help with: ${group.title}.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
              >
                <WhatsAppIcon className="h-4 w-4 text-[#25D366]" /> WhatsApp us
              </a>
            </div>
            {isEmergency && (
              <p className="mt-4 max-w-xl text-sm text-mist-400">
                Emergency line — call to check availability. If there is fire, smoke or someone has
                been hurt, call the emergency services first and keep away from the equipment.
              </p>
            )}
          </div>
          <div className="overflow-hidden rounded-3xl border border-white/10">
            <ServiceArt id={group.id} className="aspect-[16/9]" />
          </div>
        </div>
      </section>

      {/* What's included / reasons / what we need */}
      <section className="shell section">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="card">
            <h2 className="font-display text-lg font-extrabold text-white">What&apos;s included</h2>
            <ul className="mt-4 space-y-3 text-sm text-mist-200">
              {group.items.map((item) => (
                <li key={item} className="flex gap-2.5">
                  <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-volt-400" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="card">
            <h2 className="font-display text-lg font-extrabold text-white">Typical reasons to call us</h2>
            <ul className="mt-4 space-y-3 text-sm text-mist-200">
              {group.reasons.map((item) => (
                <li key={item} className="flex gap-2.5">
                  <BoltIcon className="mt-0.5 h-4 w-4 shrink-0 text-forge-400" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="card border-volt-400/25">
            <h2 className="font-display text-lg font-extrabold text-white">What we need to quote</h2>
            <ul className="mt-4 space-y-3 text-sm text-mist-200">
              {group.quoteNeeds.map((item) => (
                <li key={item} className="flex gap-2.5">
                  <ClipboardIcon className="mt-0.5 h-4 w-4 shrink-0 text-volt-400" />
                  {item}
                </li>
              ))}
            </ul>
            {!isEmergency && (
              <Link href={bookHref} className="btn btn-primary btn-sm mt-6 w-full">
                Start a request <ArrowRightIcon className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>

        {group.id === "solar-backup" && <SolarEvContact className="mt-8" />}

        <p className="mt-8 text-sm text-mist-400">
          A request is not a confirmed appointment. We contact you to agree the scope, price and
          timing before any work starts.
        </p>
      </section>

      {/* Other services */}
      <section className="section-alt">
        <div className="shell section">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="section-title">Other services</h2>
            <Link href="/services" className="link-accent">
              All services <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((g) => (
              <ServiceCard key={g.id} group={g} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
