import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductArt } from "@/components/shop/ProductArt";
import { StockBadge } from "@/components/shop/StockBadge";
import { PurchasePanel } from "@/components/shop/PurchasePanel";
import { ProductCard } from "@/components/shop/ProductCard";
import { PaymentDetails } from "@/components/PaymentDetails";
import { SolarEvContact } from "@/components/SolarEvContact";
import { ArrowRightIcon, CheckIcon } from "@/components/Icons";
import { categories, getProduct, products } from "@/lib/products";
import { site } from "@/lib/site";
import { paystackConfigured } from "@/lib/paystack";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return {};
  return {
    title: product.name,
    description: `${product.name} by ${product.brand} — ${product.keySpec}. ${product.description.slice(0, 120)}`,
    alternates: { canonical: `/shop/${product.slug}` },
    openGraph: {
      title: `${product.name} · ${site.shortName} Shop`,
      description: product.keySpec,
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const category = categories.find((c) => c.id === product.category);
  const related = products
    .filter((p) => p.category === product.category && p.slug !== product.slug)
    .slice(0, 4);
  const image = product.image ?? null;
  const onlinePayments = paystackConfigured();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.sku,
    brand: { "@type": "Brand", name: product.brand },
    description: product.description,
    offers: {
      "@type": "Offer",
      url: `${site.url}/shop/${product.slug}`,
      priceCurrency: "GHS",
      ...(product.price !== null
        ? { price: product.price, availability: "https://schema.org/InStock" }
        : { availability: "https://schema.org/MadeToOrder" }),
    },
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="text-sm text-mist-400">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/shop" className="hover:text-volt-300">
              Shop
            </Link>
          </li>
          <li aria-hidden>·</li>
          {category && (
            <>
              <li>
                <Link href={`/shop?category=${category.id}`} className="hover:text-volt-300">
                  {category.label}
                </Link>
              </li>
              <li aria-hidden>·</li>
            </>
          )}
          <li className="text-mist-200" aria-current="page">
            {product.name}
          </li>
        </ol>
      </nav>

      {/* Main product layout */}
      <div className="mt-6 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        {/* Photo */}
        <div>
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-ink-900/60">
            <div className="aspect-[4/3] bg-ink-950">
              {image ? (
                // eslint-disable-next-line @next/next/no-img-element -- product photos drop in from /public/products
                <img src={image} alt={product.name} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full p-8">
                  <ProductArt art={product.art} />
                </div>
              )}
            </div>
          </div>

          {/* Specifications */}
          <div className="mt-6 rounded-2xl border border-white/10 bg-ink-900/60 p-6">
            <h2 className="font-display text-lg font-bold text-white">Specifications</h2>
            <dl className="mt-4 divide-y divide-white/5">
              <Row label="SKU" value={product.sku} />
              <Row label="Brand" value={product.brand} />
              <Row label="Unit of sale" value={`1 ${product.unit}`} />
              {product.specs.map((s) => (
                <Row key={s.label} label={s.label} value={s.value} />
              ))}
            </dl>
          </div>

          {/* Description + notes */}
          <div className="mt-6 rounded-2xl border border-white/10 bg-ink-900/60 p-6">
            <h2 className="font-display text-lg font-bold text-white">Description</h2>
            <p className="mt-3 leading-relaxed text-mist-300">{product.description}</p>
            {product.notes && (
              <div className="mt-4 rounded-xl border border-volt-400/20 bg-volt-500/5 p-4">
                <h3 className="text-sm font-bold text-volt-300">Compatibility &amp; safety notes</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-mist-300">{product.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Buy column */}
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-lg bg-white/5 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-mist-200 ring-1 ring-white/10">
              {product.brand}
            </span>
            <StockBadge status={product.stock} stockLeft={product.stockLeft} />
          </div>

          <h1 className="mt-4 font-display text-3xl font-extrabold leading-tight text-white">
            {product.name}
          </h1>
          <p className="mt-2 text-lg font-semibold text-volt-300">{product.keySpec}</p>

          <div className="mt-6">
            <PurchasePanel product={product} onlinePayments={onlinePayments} />
          </div>

          {product.category === "solar" && (
            <SolarEvContact compact className="mt-6" />
          )}

          <PaymentDetails compact className="mt-6" onlinePayments={onlinePayments} />

          {/* Delivery / returns quick facts */}
          <div className="mt-6 rounded-2xl border border-white/10 bg-ink-950/60 p-6">
            <h2 className="font-display text-base font-bold text-white">
              Delivery &amp; order process
            </h2>
            <ul className="mt-4 space-y-3 text-sm text-mist-300">
              <li className="flex gap-2.5">
                <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-forge-400" />
                Order request received → we confirm stock on WhatsApp → payment method agreed →
                delivery or pickup.
              </li>
              <li className="flex gap-2.5">
                <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-forge-400" />
                Greater Accra delivery same/next day. Nationwide 2–4 working days by courier.
              </li>
              <li className="flex gap-2.5">
                <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-forge-400" />
                Pickup from our workshop — {site.location}.
              </li>
              <li className="flex gap-2.5">
                <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-forge-400" />
                Sealed-box returns within 7 days. Installed or cut-to-length items excluded.
              </li>
            </ul>
            <p className="mt-4 text-xs text-mist-500">
              Warranty: {product.warranty}. Manufacturer terms apply after inspection.
            </p>
          </div>
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <section className="mt-16">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-extrabold text-white">
                More in {category?.label ?? "this category"}
              </h2>
              <p className="mt-1 text-sm text-mist-400">Items frequently bought together.</p>
            </div>
            <Link
              href={`/shop?category=${product.category}`}
              className="hidden items-center gap-1.5 text-sm font-semibold text-volt-300 hover:underline sm:inline-flex"
            >
              View all <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </section>
      )}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2.5">
      <dt className="text-sm text-mist-400">{label}</dt>
      <dd className="text-right text-sm font-semibold text-white">{value}</dd>
    </div>
  );
}
