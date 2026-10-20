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

export function ShopSection() {
  const featured = [
    ...byCollection("best-sellers").slice(0, 2),
    ...byCollection("deals").slice(0, 1),
    ...byCollection("solar").slice(0, 1),
  ];

  return (
    <section className="border-y border-white/5 bg-ink-900/40">
      <div className="mx-auto max-w-7xl px-4 py-20">
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-volt-400">
              Electrical materials shop
            </p>
            <h2 className="mt-3 font-display text-3xl font-extrabold text-white sm:text-4xl">
              Genuine parts, ready when you need them
            </h2>
            <p className="mt-4 text-mist-300">
              Breakers, cable, lighting, solar and tools from Schneider, ABB, Legrand, MK and
              Chint — priced in GHS, delivered across Greater Accra and nationwide.
            </p>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 font-semibold text-volt-300 hover:underline"
          >
            Shop all products <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </Reveal>

        {/* Category shortcuts */}
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((c, i) => {
            const Icon = iconMap[c.icon];
            const count = byCollection(c.id).length;
            return (
              <Reveal key={c.id} delay={i * 60} as="article">
                <Link
                  href={`/shop?collection=${c.id}`}
                  className="group flex h-full flex-col rounded-2xl border border-white/10 bg-ink-950/60 p-5 transition-all hover:-translate-y-1 hover:border-volt-400/50"
                >
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-volt-500/10 text-volt-300 ring-1 ring-volt-400/20">
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
            <h3 className="mt-14 font-display text-xl font-bold text-white">
              Popular right now
            </h3>
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {featured.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          </>
        )}

        {/* Trust strip */}
        <Reveal className="mt-14">
          <div className="grid gap-4 rounded-2xl border border-white/10 bg-ink-950/60 p-6 sm:grid-cols-3">
            {[
              { icon: ShieldIcon, title: "Genuine stock only", text: "Boxed, branded items with full manufacturer warranty." },
              { icon: BoltIcon, title: "Fast Accra delivery", text: "Same/next-day delivery in Greater Accra, 2–4 days nationwide." },
              { icon: StarIcon, title: "Trade-trusted brands", text: "Schneider, ABB, Legrand, MK, Chint and more — the brands we install ourselves." },
            ].map((item) => (
              <div key={item.title} className="flex gap-3.5">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-volt-500/10 text-volt-300 ring-1 ring-volt-400/20">
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
