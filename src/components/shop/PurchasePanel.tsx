"use client";

import { useState } from "react";
import { CheckIcon, TruckIcon, WhatsAppIcon, ShieldIcon } from "@/components/Icons";
import { QuantityStepper } from "./QuantityStepper";
import { AddToCartButton, BuyNowButton } from "./CartButtons";
import { formatGHS, productOrderMessage, type Product } from "@/lib/products";
import { site, waLink } from "@/lib/site";

export function PurchasePanel({
  product,
  onlinePayments = false,
}: {
  product: Product;
  onlinePayments?: boolean;
}) {
  const [qty, setQty] = useState(1);
  const total = product.price !== null ? product.price * qty : null;
  const isSolar = product.category === "solar";
  const whatsappNumber = isSolar ? site.solarEv.whatsapp : site.whatsapp;

  return (
    <div className="rounded-2xl border border-white/10 bg-ink-900/60 p-6">
      {/* Price */}
      {product.price !== null ? (
        <div className="flex items-baseline gap-3">
          <span className="font-display text-3xl font-extrabold text-white">
            {formatGHS(product.price)}
          </span>
          <span className="text-sm text-mist-400">per {product.unit}</span>
        </div>
      ) : (
        <div className="rounded-xl border border-forge-400/30 bg-forge-500/10 p-4">
          <p className="font-display text-lg font-bold text-forge-300">
            Request a quote / availability
          </p>
          <p className="mt-1 text-sm text-mist-300">
            High-value equipment — price and supplier stock confirmed on request.
          </p>
        </div>
      )}

      {total !== null && qty > 1 && (
        <p className="mt-2 text-sm text-mist-400">
          {qty} × {product.unit}s ={" "}
          <span className="font-semibold text-white">{formatGHS(total)}</span>
        </p>
      )}

      {/* Quantity + actions */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <QuantityStepper qty={qty} onChange={setQty} />
        <span className="text-xs text-mist-500">Max 999 per order</span>
      </div>

      {product.price !== null ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <AddToCartButton product={product} qty={qty} />
          <BuyNowButton product={product} qty={qty} />
        </div>
      ) : (
        <div className="mt-4">
          <AddToCartButton product={product} qty={qty} className="w-full" />
        </div>
      )}

      <a
        href={waLink(productOrderMessage(product, qty), whatsappNumber)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 py-3.5 font-bold text-[#052e16] transition-transform hover:-translate-y-0.5"
      >
        <WhatsAppIcon className="h-5 w-5" />{" "}
        {isSolar ? "Order via Solar & EV specialist" : "Order on WhatsApp"}
      </a>

      {isSolar && (
        <p className="mt-3 flex flex-wrap items-center justify-center gap-1.5 text-center text-xs text-mist-400">
          <span className="font-semibold text-forge-300">Solar &amp; EV specialist:</span>
          <a
            href={`tel:${site.solarEv.label.replace(/[^\d+]/g, "")}`}
            className="font-semibold text-white hover:text-forge-300"
          >
            {site.solarEv.label}
          </a>
          <span className="text-mist-500">· WhatsApp orders go straight to this line.</span>
        </p>
      )}

      <p className="mt-3 text-center text-xs text-mist-500">
        {onlinePayments ? (
          <>
            Add to cart and pay securely by card or Mobile Money at checkout, or send the order on
            WhatsApp and we&apos;ll confirm stock first.
          </>
        ) : (
          <>
            Order requests are confirmed by our team on WhatsApp before payment. Pay by Mobile Money
            to {site.payments.mobileMoney.label} after confirmation.
          </>
        )}
      </p>

      {/* Reassurance strip */}
      <ul className="mt-5 space-y-2.5 border-t border-white/10 pt-5 text-sm text-mist-300">
        <li className="flex items-center gap-2.5">
          <TruckIcon className="h-4 w-4 shrink-0 text-volt-400" />
          Delivery: Greater Accra &amp; nationwide
        </li>
        <li className="flex items-center gap-2.5">
          <CheckIcon className="h-4 w-4 shrink-0 text-forge-400" />
          Pickup from our {site.location} workshop
        </li>
        <li className="flex items-center gap-2.5">
          <ShieldIcon className="h-4 w-4 shrink-0 text-emerald-400" />
          {product.warranty}
        </li>
      </ul>
    </div>
  );
}
