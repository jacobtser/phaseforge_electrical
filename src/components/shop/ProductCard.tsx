import Link from "next/link";
import { ArrowRightIcon, WhatsAppIcon } from "@/components/Icons";
import { ProductArt } from "./ProductArt";
import { StockBadge } from "./StockBadge";
import { AddToCartButton } from "./CartButtons";
import { formatGHS, productOrderMessage, type Product } from "@/lib/products";
import { site, waLink } from "@/lib/site";

export function ProductCard({ product, priority }: { product: Product; priority?: boolean }) {
  const image = product.image ?? null;
  const whatsappNumber =
    product.category === "solar" ? site.solarEv.whatsapp : site.whatsapp;
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-ink-900/60 transition-all hover:-translate-y-1 hover:border-volt-400/50 hover:bg-ink-850">
      <Link
        href={`/shop/${product.slug}`}
        className="relative block aspect-[4/3] overflow-hidden bg-ink-950"
        tabIndex={-1}
        aria-hidden="true"
      >
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element -- product photos drop in from /public/products
          <img
            src={image}
            alt=""
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading={priority ? "eager" : "lazy"}
          />
        ) : (
          <div className="h-full w-full p-4 transition-transform duration-500 group-hover:scale-105">
            <ProductArt art={product.art} />
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-lg bg-ink-950/80 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-mist-200 backdrop-blur">
          {product.brand}
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-bold leading-snug text-white">
            <Link href={`/shop/${product.slug}`} className="hover:text-volt-300">
              {product.name}
            </Link>
          </h3>
        </div>

        <p className="mt-1.5 text-xs text-mist-400">{product.keySpec}</p>

        <div className="mt-3 flex items-baseline gap-2">
          {product.price !== null ? (
            <span className="font-display text-xl font-extrabold text-white">
              {formatGHS(product.price)}
            </span>
          ) : (
            <span className="font-display text-base font-bold text-forge-300">
              Request a quote
            </span>
          )}
          <span className="text-xs text-mist-500">/ {product.unit}</span>
        </div>

        <div className="mt-3">
          <StockBadge status={product.stock} stockLeft={product.stockLeft} />
        </div>

        <div className="mt-5 flex-1" />

        <div className="flex items-center gap-2">
          <AddToCartButton product={product} compact className="flex-1" />
          <a
            href={waLink(productOrderMessage(product, 1), whatsappNumber)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Order ${product.name} on WhatsApp`}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#25D366]/10 text-[#25D366] ring-1 ring-[#25D366]/30 transition-colors hover:bg-[#25D366]/20"
          >
            <WhatsAppIcon className="h-5 w-5" />
          </a>
        </div>
        <Link
          href={`/shop/${product.slug}`}
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-volt-300 hover:underline"
        >
          View details <ArrowRightIcon className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}
