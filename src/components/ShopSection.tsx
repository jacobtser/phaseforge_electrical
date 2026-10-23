import Link from "next/link";
import { Reveal } from "./Reveal";
import { ProductCard } from "./shop/ProductCard";
import {
  StarIcon,
  SparkIcon,
  SunIcon,
  BriefcaseIcon,
  ShieldIcon,
  BoltIcon,
  ArrowRightIcon,
} from "./Icons";
import { byCollection, collections } from "@/lib/products";

const iconMap = {
  star: StarIcon,
  sparkle: SparkIcon,
  sun: SunIcon,
  briefcase: BriefcaseIcon,
  shield: ShieldIcon,
  bolt: BoltIcon,
} as const;

const TRUST = [
  { icon: ShieldIcon, title: "Genuine stock only", text: "Boxed, branded items with full manufacturer warranty." },
  { icon: BoltIcon, title: "Fast Accra delivery", text: "Same/next-day delivery in Greater Accra, 2–4 days nationwide." },
  { icon: StarIcon, title: "Trade-trusted brands", text: "Schneider, ABB, Legrand, MK, Chint and more — the brands we install ourselves." },
];

export function ShopSection() {
  const featured = [
    ...byCollection("best-sellers").slice(0, 2),
    ...byCollection("deals").slice(0, 1),
    ...byCollection("solar").slice(0, 1),
  ];

  return (
    <section className="section-alt">
      <div className="shell section">
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <p className="eyebrow">Electrical materials shop</p>
            <h2 className="section-title mt-3">Genuine parts, ready when you need them</h2>
            <p className="lead mt-4 text-base sm:text-lg">
              Breakers, cable, lighting, solar and tools from Schneider, ABB, Legrand, MK and
              Chint — priced in GHS, delivered across Greater Accra and nationwide.
            </p>
          </div>
          <Link href="/shop" className="link-accent">
            Shop all products <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </Reveal>

        {/* Category shortcuts */}
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((c, i) => {
            const Icon = iconMap[c.icon];
            const count = byCollection(c.id).length;
            return (
              <Reveal key={c.id} delay={i * 60} as="article" className="h-full">
                <Link
                  href={`/shop?collection=${c.id}`}
                  className="card card-quiet card-p5 card-hover group flex h-full flex-col"
                >
                  <span className="icon-chip">
                    <Icon className="h-5.5 w-5.5" />
                  </span>
                  <h3 className="mt-4 text-base font-bold text-white">{c.title}</h3>
                  <p className="mt-1.5 flex-1 text-sm leading-relaxed text-mist-400">{c.blurb}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-volt-300">
                    {count} {count === 1 ? "product" : "products"}
                    <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </div>

        {/* Featured products */}
        {featured.length > 0 && (
          <>
            <h3 className="mt-14 font-display text-xl font-bold text-white">Popular right now</h3>
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {featured.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          </>
        )}

        {/* Trust strip */}
        <Reveal className="mt-14">
          <div className="card card-quiet grid gap-6 sm:grid-cols-3">
            {TRUST.map((item) => (
              <div key={item.title} className="flex gap-3.5">
                <span className="icon-chip">
                  <item.icon className="h-5 w-5" />
                </span>
                <div>
                  <h4 className="text-sm font-bold text-white">{item.title}</h4>
                  <p className="mt-1 text-sm leading-relaxed text-mist-400">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
