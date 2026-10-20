import type { Metadata } from "next";
import Link from "next/link";
import { site, waLink } from "@/lib/site";
import { PaymentDetails } from "@/components/PaymentDetails";
import { ArrowRightIcon, CheckIcon, ShieldIcon, WhatsAppIcon } from "@/components/Icons";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Payment Information",
  description:
    "Pay PhaseForge Electrical online by card or Mobile Money through Paystack, or by Mobile Money, bank transfer or cash after your order is confirmed.",
  alternates: { canonical: "/payment" },
};

const STEPS = [
  {
    title: "Choose your items or send a request",
    text: "Add items to your cart for instant online checkout, or send an order or quote request on WhatsApp.",
  },
  {
    title: "Pay securely",
    text: "Pay by card or Mobile Money through Paystack at checkout. For WhatsApp orders, we confirm stock and the final amount first, then arrange payment.",
  },
  {
    title: "We prepare your order",
    text: "We confirm the payment, arrange delivery or pickup, and keep you updated on WhatsApp.",
  },
];

export default function PaymentPage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-grid [mask-image:radial-gradient(60%_70%_at_50%_0%,#000_25%,transparent_100%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:py-20">
          <Reveal className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-forge-400">
              Payments
            </p>
            <h1 className="mt-3 font-display text-4xl font-extrabold text-white sm:text-5xl">
              Simple, secure payments
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-mist-300">
              Pay online by card or Mobile Money through Paystack at cart checkout. Prefer a manual
              transfer? We also accept Mobile Money, bank transfer and cash after we confirm your
              WhatsApp order.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <Reveal>
            <PaymentDetails showDetailsLink={false} />
          </Reveal>

          <Reveal delay={100}>
            <div className="space-y-5">
              <div className="rounded-2xl border border-emerald-400/25 bg-emerald-500/10 p-6 sm:p-7">
                <h2 className="flex items-center gap-2 font-display text-xl font-extrabold text-white">
                  <ShieldIcon className="h-5 w-5 text-emerald-300" /> Pay online with Paystack
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-mist-300">
                  Card and Mobile Money payments are handled securely by Paystack. You&apos;ll be
                  redirected to Paystack&apos;s checkout and brought back to a payment confirmation
                  page when the payment is complete.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link
                    href="/shop"
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-volt-400 to-volt-600 px-4 py-2.5 text-sm font-bold text-ink-950"
                  >
                    Shop and pay online <ArrowRightIcon className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/cart"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold text-white hover:border-emerald-400/60"
                  >
                    Go to cart
                  </Link>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-ink-900/60 p-6 sm:p-7">
                <h2 className="font-display text-xl font-extrabold text-white">
                  How payment works
                </h2>
                <ol className="mt-5 space-y-4">
                  {STEPS.map((step, i) => (
                    <li key={step.title} className="flex gap-3.5">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-volt-500/15 text-sm font-bold text-volt-300">
                        {i + 1}
                      </span>
                      <div>
                        <h3 className="font-bold text-white">{step.title}</h3>
                        <p className="mt-1 text-sm leading-relaxed text-mist-400">{step.text}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="rounded-2xl border border-white/10 bg-ink-900/60 p-6">
                <h2 className="flex items-center gap-2 font-display text-lg font-extrabold text-white">
                  <ShieldIcon className="h-5 w-5 text-forge-400" /> Pay safely
                </h2>
                <ul className="mt-4 space-y-2.5 text-sm text-mist-300">
                  {[
                    "Online payments are processed by Paystack — we never see your card details.",
                    "For manual payments, only pay after we confirm your order and final amount.",
                    "Always use the Mobile Money number shown on this page for manual payments.",
                    "Keep your payment receipt and order reference until delivery is complete.",
                    "Never send money to a number that has not been confirmed by our team.",
                  ].map((item) => (
                    <li key={item} className="flex gap-2.5">
                      <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-forge-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-forge-400/25 bg-forge-500/10 p-6">
                <h2 className="font-display text-lg font-extrabold text-white">
                  Need help with a payment?
                </h2>
                <p className="mt-2 text-sm text-mist-300">
                  Message us on WhatsApp or call {site.phones[0].label} and we&apos;ll check it
                  against your order.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <a
                    href={waLink(
                      "Hello PhaseForge, I need help with a payment for my order.",
                      site.payments.mobileMoney.whatsapp,
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-4 py-2.5 text-sm font-bold text-[#052e16]"
                  >
                    <WhatsAppIcon className="h-4 w-4" /> WhatsApp us
                  </a>
                  <Link
                    href="/shop"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold text-white hover:border-forge-400/60"
                  >
                    Back to shop <ArrowRightIcon className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
