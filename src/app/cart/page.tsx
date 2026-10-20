import type { Metadata } from "next";
import { CartContents } from "@/components/shop/CartContents";

export const metadata: Metadata = {
  title: "Your Cart",
  robots: { index: false, follow: true },
};

export default function CartPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="font-display text-3xl font-extrabold text-white">Your cart</h1>
      <p className="mt-2 text-mist-400">
        Review your items, then send us an order request on WhatsApp — we confirm stock and the
        final amount before any payment.
      </p>
      <div className="mt-8">
        <CartContents />
      </div>
    </div>
  );
}
