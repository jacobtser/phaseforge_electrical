"use client";

import Link from "next/link";
import { CartIcon } from "./Icons";
import { useCart } from "@/lib/cart";

export function CartButton() {
  const { count, ready } = useCart();
  // `ready` is false during SSR and the first hydration pass, so the badge
  // appears only once the client cart has loaded — no hydration mismatch.
  const showCount = ready && count > 0;

  return (
    <Link
      href="/cart"
      aria-label={showCount ? `Cart, ${count} items` : "Cart"}
      className="relative grid h-10 w-10 place-items-center rounded-lg border border-white/10 text-white transition-colors hover:border-volt-400/50"
    >
      <CartIcon className="h-5 w-5" />
      {showCount && (
        <span className="absolute -right-1.5 -top-1.5 grid min-w-5 place-items-center rounded-full bg-forge-400 px-1 text-[10px] font-extrabold leading-5 text-ink-950">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
