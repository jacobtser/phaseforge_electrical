"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart, useCartLines } from "@/lib/cart";
import { formatGHS } from "@/lib/products";
import { site, waLink } from "@/lib/site";
import { ProductArt } from "@/components/shop/ProductArt";
import { QuantityStepper } from "@/components/shop/QuantityStepper";
import { StockBadge } from "@/components/shop/StockBadge";
import { PaymentDetails } from "@/components/PaymentDetails";
import {
  ArrowRightIcon,
  CartIcon,
  CheckIcon,
  MailIcon,
  PhoneIcon,
  TrashIcon,
  TruckIcon,
  WhatsAppIcon,
} from "@/components/Icons";

const FULFILMENT_OPTIONS = [
  { id: "delivery-accra", label: "Delivery — Greater Accra", note: "Same/next day" },
  { id: "delivery-nationwide", label: "Delivery — Nationwide", note: "2–4 working days" },
  { id: "pickup", label: "Pickup from workshop", note: site.location },
] as const;

export function CartContents() {
  const { ready, subtotal, clear, remove, setQty } = useCart();
  const lines = useCartLines();
  const [fulfilment, setFulfilment] = useState<string>(FULFILMENT_OPTIONS[0].id);
  const [details, setDetails] = useState({ name: "", phone: "", location: "" });

  if (!ready) {
    return (
      <div className="rounded-2xl border border-white/10 bg-ink-900/60 p-10 text-center text-mist-400">
        Loading your cart…
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/15 bg-ink-900/40 p-12 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-volt-500/10 text-volt-300 ring-1 ring-volt-400/20">
          <CartIcon className="h-7 w-7" />
        </span>
        <h2 className="mt-5 font-display text-xl font-bold text-white">Your cart is empty</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-mist-400">
          Browse the shop for breakers, cable, lighting, solar and tools — or ask us on WhatsApp
          if you can&apos;t find what you need.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-volt-400 to-volt-600 px-5 py-3 font-bold text-ink-950 transition-transform hover:-translate-y-0.5"
          >
            Browse the shop <ArrowRightIcon className="h-4 w-4" />
          </Link>
          <a
            href={waLink("Hello PhaseForge, I'm looking for an electrical item — can you help?")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-5 py-3 font-bold text-[#052e16] transition-transform hover:-translate-y-0.5"
          >
            <WhatsAppIcon className="h-5 w-5" /> Ask on WhatsApp
          </a>
        </div>
      </div>
    );
  }

  const quoteOnlyLines = lines.filter((l) => l.product.price === null);
  const detailsComplete = details.name.trim() !== "" && details.phone.trim() !== "";
  const hasSolar = lines.some((l) => l.product.category === "solar");
  const orderWhatsApp = hasSolar ? site.solarEv.whatsapp : site.whatsapp;

  const orderMessage = () => {
    const priced = lines.filter((l) => l.product.price !== null);
    const parts: string[] = [
      `Hello ${site.shortName}, I'd like to place an order request:`,
      "",
      ...priced.map((l) => {
        const total = (l.product.price ?? 0) * l.item.qty;
        return `• ${l.product.name} (${l.product.brand})\n  ${l.item.qty} × ${l.product.unit} @ ${formatGHS(l.product.price ?? 0)} = ${formatGHS(total)}\n  SKU: ${l.product.sku}`;
      }),
      "",
      `Items total: ${formatGHS(priced.reduce((s, l) => s + (l.product.price ?? 0) * l.item.qty, 0))}`,
    ];
    if (quoteOnlyLines.length > 0) {
      parts.push(
        "",
        "Also requesting availability/price for:",
        ...quoteOnlyLines.map((l) => `• ${l.product.name} (${l.product.brand}) — SKU: ${l.product.sku}`),
      );
    }
    const fulfil = FULFILMENT_OPTIONS.find((f) => f.id === fulfilment);
    parts.push("", `Fulfilment: ${fulfil?.label ?? "Delivery"}`);
    if (details.name.trim()) parts.push(`Name: ${details.name.trim()}`);
    if (details.phone.trim()) parts.push(`Phone: ${details.phone.trim()}`);
    if (details.location.trim()) parts.push(`Location: ${details.location.trim()}`);
    return parts.join("\n");
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1.4fr_0.9fr] lg:items-start">
      {/* Line items */}
      <div className="space-y-4">
        {lines.map(({ item, product }) => {
          const lineTotal = product.price !== null ? product.price * item.qty : null;
          return (
            <article
              key={item.slug}
              className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-ink-900/60 p-4 sm:flex-row sm:items-center"
            >
              <Link
                href={`/shop/${product.slug}`}
                className="h-24 w-full shrink-0 overflow-hidden rounded-xl bg-ink-950 sm:w-28"
                aria-hidden="true"
                tabIndex={-1}
              >
                {product.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={product.image} alt="" className="h-full w-full object-cover" />
                ) : (
                  <ProductArt art={product.art} />
                )}
              </Link>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h2 className="text-sm font-bold text-white">
                    <Link href={`/shop/${product.slug}`} className="hover:text-volt-300">
                      {product.name}
                    </Link>
                  </h2>
                  <button
                    type="button"
                    onClick={() => remove(item.slug)}
                    aria-label={`Remove ${product.name} from cart`}
                    className="rounded-lg p-1.5 text-mist-400 transition-colors hover:bg-white/5 hover:text-red-300"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
                <p className="mt-0.5 text-xs text-mist-400">
                  {product.brand} · {product.keySpec} · {product.sku}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <StockBadge status={product.stock} stockLeft={product.stockLeft} />
                  {product.price !== null && (
                    <span className="text-xs text-mist-400">
                      {formatGHS(product.price)} / {product.unit}
                    </span>
                  )}
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <QuantityStepper
                    qty={item.qty}
                    onChange={(n) => setQty(item.slug, n)}
                  />
                  <p className="font-display text-lg font-extrabold text-white">
                    {lineTotal !== null ? formatGHS(lineTotal) : "Quote on request"}
                  </p>
                </div>
              </div>
            </article>
          );
        })}

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-volt-300 hover:underline"
          >
            <ArrowRightIcon className="h-4 w-4 rotate-180" /> Continue shopping
          </Link>
          <button
            type="button"
            onClick={clear}
            className="text-sm font-semibold text-mist-400 transition-colors hover:text-red-300"
          >
            Clear cart
          </button>
        </div>
      </div>

      {/* Summary / order request */}
      <aside className="rounded-2xl border border-white/10 bg-ink-900/60 p-6 lg:sticky lg:top-28">
        <h2 className="font-display text-lg font-bold text-white">Order summary</h2>

        <dl className="mt-4 space-y-2.5 text-sm">
          <div className="flex items-baseline justify-between">
            <dt className="text-mist-400">
              Items ({lines.reduce((n, l) => n + l.item.qty, 0)})
            </dt>
            <dd className="font-semibold text-white">{formatGHS(subtotal)}</dd>
          </div>
          <div className="flex items-baseline justify-between">
            <dt className="text-mist-400">Delivery</dt>
            <dd className="text-mist-300">Confirmed on WhatsApp</dd>
          </div>
        </dl>

        <div className="mt-4 flex items-baseline justify-between border-t border-white/10 pt-4">
          <span className="font-semibold text-white">Estimated total</span>
          <span className="font-display text-2xl font-extrabold text-white">
            {formatGHS(subtotal)}
          </span>
        </div>
        {quoteOnlyLines.length > 0 && (
          <p className="mt-2 text-xs text-mist-400">
            {quoteOnlyLines.length} on-request item
            {quoteOnlyLines.length > 1 ? "s" : ""} excluded — priced separately.
          </p>
        )}

        {/* Fulfilment */}
        <fieldset className="mt-6">
          <legend className="text-xs font-semibold uppercase tracking-wider text-mist-400">
            Delivery or pickup
          </legend>
          <div className="mt-3 space-y-2">
            {FULFILMENT_OPTIONS.map((opt) => (
              <label
                key={opt.id}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors ${
                  fulfilment === opt.id
                    ? "border-volt-400/60 bg-volt-500/5"
                    : "border-white/10 hover:border-white/20"
                }`}
              >
                <input
                  type="radio"
                  name="fulfilment"
                  value={opt.id}
                  checked={fulfilment === opt.id}
                  onChange={() => setFulfilment(opt.id)}
                  className="accent-volt-400"
                />
                <span className="flex-1 text-sm font-medium text-white">{opt.label}</span>
                <span className="text-xs text-mist-400">{opt.note}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {/* Contact details */}
        <div className="mt-6 space-y-3">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-mist-400">
              Your name
            </span>
            <input
              type="text"
              value={details.name}
              onChange={(e) => setDetails((d) => ({ ...d, name: e.target.value }))}
              placeholder="Kwame Mensah"
              className="w-full rounded-xl border border-white/10 bg-ink-950/70 px-3.5 py-2.5 text-sm text-white placeholder:text-mist-500 focus:border-volt-400/60 focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-mist-400">
              Phone number
            </span>
            <input
              type="tel"
              value={details.phone}
              onChange={(e) => setDetails((d) => ({ ...d, phone: e.target.value }))}
              placeholder="024 000 0000"
              className="w-full rounded-xl border border-white/10 bg-ink-950/70 px-3.5 py-2.5 text-sm text-white placeholder:text-mist-500 focus:border-volt-400/60 focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-mist-400">
              Location / landmark
            </span>
            <input
              type="text"
              value={details.location}
              onChange={(e) => setDetails((d) => ({ ...d, location: e.target.value }))}
              placeholder="East Legon, near A&C Mall"
              className="w-full rounded-xl border border-white/10 bg-ink-950/70 px-3.5 py-2.5 text-sm text-white placeholder:text-mist-500 focus:border-volt-400/60 focus:outline-none"
            />
          </label>
        </div>

        {/* Actions */}
        <a
          href={waLink(orderMessage(), orderWhatsApp)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 py-3.5 font-bold text-[#052e16] transition-transform hover:-translate-y-0.5"
        >
          <WhatsAppIcon className="h-5 w-5" />{" "}
          {hasSolar ? "Send order to Solar & EV specialist" : "Send order via WhatsApp"}
        </a>
        {!detailsComplete && (
          <p className="mt-2 text-center text-xs text-mist-500">
            Tip: add your name and phone so we can confirm your order faster.
          </p>
        )}

        {hasSolar && (
          <p className="mt-3 rounded-lg border border-forge-400/20 bg-forge-500/10 px-3 py-2 text-xs leading-relaxed text-forge-200">
            Your cart includes solar/backup equipment, so this order goes straight to our solar
            &amp; EV specialist on {site.solarEv.label}.
          </p>
        )}

        <p className="mt-4 text-xs leading-relaxed text-mist-500">
          This is an <strong className="text-mist-300">order request</strong>, not a payment. Our
          team confirms stock and the final amount on WhatsApp, then agrees the payment method
          (mobile money, bank transfer or cash on delivery/pickup).
        </p>

        <PaymentDetails compact className="mt-5" />

        <ul className="mt-5 space-y-2.5 border-t border-white/10 pt-5 text-sm text-mist-300">
          <li className="flex items-center gap-2.5">
            <TruckIcon className="h-4 w-4 shrink-0 text-volt-400" /> Greater Accra &amp; nationwide
            delivery
          </li>
          <li className="flex items-center gap-2.5">
            <CheckIcon className="h-4 w-4 shrink-0 text-forge-400" /> Genuine, boxed stock only
          </li>
          <li className="flex items-center gap-2.5">
            <PhoneIcon className="h-4 w-4 shrink-0 text-emerald-400" /> Prefer to talk?{" "}
            <a href={`tel:${site.phones[0].tel}`} className="hover:text-volt-300">
              {site.phones[0].label}
            </a>
          </li>
          <li className="flex items-center gap-2.5">
            <MailIcon className="h-4 w-4 shrink-0 text-mist-400" /> {site.email}
          </li>
        </ul>
      </aside>
    </div>
  );
}
