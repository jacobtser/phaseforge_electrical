"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckIcon, CartIcon } from "@/components/Icons";
import { useCart } from "@/lib/cart";
import type { Product } from "@/lib/products";

export function AddToCartButton({
  product,
  qty = 1,
  className,
  compact,
}: {
  product: Product;
  qty?: number;
  className?: string;
  compact?: boolean;
}) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  return (
    <button
      type="button"
      onClick={() => {
        add(product.slug, qty);
        setAdded(true);
        window.setTimeout(() => setAdded(false), 1800);
      }}
      className={
        className ??
        "inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-3.5 font-semibold text-white transition-colors hover:border-volt-400/60 hover:bg-white/10"
      }
      aria-label={`Add ${product.name} to cart`}
    >
      {added ? (
        <>
          <CheckIcon className="h-4 w-4 text-emerald-300" /> Added
        </>
      ) : (
        <>
          <CartIcon className="h-4 w-4 text-volt-300" />
          {compact ? "Add" : "Add to Cart"}
        </>
      )}
    </button>
  );
}

export function BuyNowButton({
  product,
  qty = 1,
  className,
}: {
  product: Product;
  qty?: number;
  className?: string;
}) {
  const { add } = useCart();
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => {
        add(product.slug, qty);
        router.push("/cart");
      }}
      className={
        className ??
        "inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-volt-400 to-volt-600 px-5 py-3.5 font-bold text-ink-950 shadow-[0_0_36px_-10px_rgba(241,190,41,0.9)] transition-transform hover:-translate-y-0.5"
      }
      aria-label={`Buy ${product.name} now`}
    >
      Buy Now
    </button>
  );
}
