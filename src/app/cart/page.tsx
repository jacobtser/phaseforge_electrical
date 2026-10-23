import type { Metadata } from "next";
import { CartContents } from "@/components/shop/CartContents";
import { paystackConfigured, paystackMode } from "@/lib/paystack";

export const metadata: Metadata = {
  title: "Your Cart",
  robots: { index: false, follow: true },
};

export const dynamic = "force-dynamic";

export default function CartPage() {
  const paystackEnabled = paystackConfigured();
  const paystackTestMode = paystackEnabled && paystackMode() === "test";

  return (
    <div className="shell py-10">
      <h1 className="page-title">Your cart</h1>
      <p className="mt-3 max-w-3xl text-mist-400">
        {paystackEnabled
          ? "Review your items, then pay securely by card or Mobile Money through Paystack — or send us an order request on WhatsApp and we'll confirm stock and the final amount first."
          : "Review your items, then send us an order request on WhatsApp. We'll confirm stock and the final amount, then arrange Mobile Money, bank transfer or cash payment."}
      </p>
      <div className="mt-8">
        <CartContents
          paystackEnabled={paystackEnabled}
          paystackTestMode={paystackTestMode}
        />
      </div>
    </div>
  );
}
