import type { Metadata } from "next";
import { CartContents } from "@/components/shop/CartContents";

export const metadata: Metadata = {
  title: "Your Cart",
  robots: { index: false, follow: true },
};

export const dynamic = "force-dynamic";

export default function CartPage() {
  const paystackEnabled = Boolean(process.env.PAYSTACK_SECRET_KEY?.trim());

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="font-display text-3xl font-extrabold text-white">Your cart</h1>
      <p className="mt-2 text-mist-400">
        Review your items, then pay securely by card or Mobile Money through Paystack — or send us
        an order request on WhatsApp and we&apos;ll confirm stock and the final amount first.
      </p>
      <div className="mt-8">
        <CartContents paystackEnabled={paystackEnabled} />
      </div>
    </div>
  );
}
