import type { Metadata } from "next";
import Link from "next/link";
import { ClearCartOnSuccess } from "@/components/shop/ClearCartOnSuccess";
import { CheckIcon, ShieldIcon, WhatsAppIcon } from "@/components/Icons";
import { getOrderByReference, markOrderFailed, markOrderPaid } from "@/lib/db";
import { notifyOrderPaid } from "@/lib/notify";
import { verifyPaystackTransaction } from "@/lib/paystack";
import { formatGHS } from "@/lib/products";
import { site, waLink } from "@/lib/site";
import type { OrderRecord } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Payment status",
  robots: { index: false, follow: false },
};

function single(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

const fulfilmentLabels: Record<string, string> = {
  "delivery-accra": "Delivery — Greater Accra",
  "delivery-nationwide": "Delivery — Nationwide",
  pickup: "Pickup from workshop",
};

const channelLabels: Record<string, string> = {
  card: "Card",
  bank: "Bank",
  mobile_money: "Mobile Money",
  bank_transfer: "Bank transfer",
  ussd: "USSD",
  qr: "QR",
};

export default async function PaymentCallbackPage({
  searchParams,
}: {
  searchParams: Promise<{
    reference?: string | string[];
    trxref?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const reference = single(params.reference) || single(params.trxref);

  if (!reference) {
    return (
      <ErrorPanel
        message="We couldn't find a payment reference in this link. If you were charged, contact us and we'll check it for you."
        reference=""
      />
    );
  }

  let transaction = null;
  let order: OrderRecord | null = null;
  let error = "";
  let paid = false;

  try {
    transaction = await verifyPaystackTransaction(reference);
  } catch (err) {
    console.error("[payment callback] Paystack verification failed", err);
    error =
      "We couldn't reach Paystack to verify this payment. If you were charged, please contact us with your reference.";
  }

  if (!transaction && !error) {
    error =
      "Paystack could not verify this payment. If you were charged, please contact us with your reference.";
  }

  if (transaction) {
    if (transaction.status !== "success") {
      error =
        transaction.status === "failed"
          ? "This payment did not go through. No money should have left your account — please try again or order on WhatsApp."
          : "This payment was not completed. If you were charged, please contact us with your reference.";

      if (transaction.status === "failed") {
        try {
          await markOrderFailed(reference);
        } catch (err) {
          console.error("[payment callback] could not mark order failed", err);
        }
      }
    } else {
      try {
        order = await getOrderByReference(reference);
      } catch (err) {
        console.error("[payment callback] could not load order", err);
        error =
          "Your payment was received, but we couldn't load the order details. Please contact us with your reference.";
      }

      if (!order && !error) {
        error = `Your payment was received, but we couldn't find the matching order. Please contact us with reference ${reference}.`;
      }

      if (order) {
        const currency = String(transaction.currency ?? "").toUpperCase();
        if (transaction.amount !== order.amount || currency !== order.currency) {
          error = `The amount Paystack confirmed (${formatGHS(
            transaction.amount / 100,
          )}) did not match your order (${formatGHS(
            order.amount / 100,
          )}). Please contact us with reference ${reference}.`;
        } else {
          try {
            const result = await markOrderPaid(reference, transaction.reference);
            order = result.order ?? order;
            paid = true;

            if (result.changed && order) {
              try {
                await notifyOrderPaid(order);
              } catch (notifyErr) {
                console.error("[payment callback] paid-order notification failed", notifyErr);
              }
            }
          } catch (err) {
            console.error("[payment callback] could not mark order paid", err);
            error =
              "Your payment was received, but we couldn't update the order. Please contact us with your reference so we can finish it manually.";
          }
        }
      }
    }
  }

  if (paid && order) {
    const total = formatGHS(order.amount / 100);
    const fulfilment = fulfilmentLabels[order.fulfilment] ?? order.fulfilment;
    const payMethod = channelLabels[String(transaction?.channel ?? "").toLowerCase()] ?? "";
    const firstName = order.name.split(" ")[0] || order.name;
    const hasSolar = order.items.some((item) => item.category === "solar");
    const helpNumber = hasSolar ? site.solarEv.whatsapp : site.whatsapp;
    const helpMessage = `Hello ${site.shortName}, I've paid for order ${order.reference}. I'd like to confirm the delivery/pickup arrangement.`;

    return (
      <>
        <ClearCartOnSuccess />
        <div className="mx-auto max-w-3xl px-4 py-14 sm:py-20">
          <div className="rounded-3xl border border-emerald-400/25 bg-emerald-500/10 p-7 text-center sm:p-10">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/30">
              <CheckIcon className="h-8 w-8" />
            </span>
            <p className="mt-5 text-xs font-semibold uppercase tracking-widest text-emerald-300">
              Payment successful
            </p>
            <h1 className="mt-2 font-display text-3xl font-extrabold text-white sm:text-4xl">
              Payment received
            </h1>
            <p className="mx-auto mt-3 max-w-lg text-mist-300">
              Thank you, {firstName}. Your order is confirmed. We&apos;ll contact you shortly on
              the number you provided to arrange{" "}
              {order.fulfilment === "pickup" ? "pickup" : "delivery"}.
            </p>

            <dl className="mx-auto mt-7 grid max-w-md gap-2.5 rounded-2xl border border-white/10 bg-ink-950/40 p-4 text-left text-sm">
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-mist-400">Reference</dt>
                <dd className="font-mono text-xs font-semibold text-white">{order.reference}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-mist-400">Amount paid</dt>
                <dd className="font-display text-lg font-extrabold text-emerald-300">{total}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-mist-400">Fulfilment</dt>
                <dd className="text-right font-medium text-white">{fulfilment}</dd>
              </div>
              {payMethod && (
                <div className="flex items-baseline justify-between gap-4">
                  <dt className="text-mist-400">Paid with</dt>
                  <dd className="text-right font-medium text-white">{payMethod}</dd>
                </div>
              )}
            </dl>

            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-volt-400 to-volt-600 px-5 py-3 font-bold text-ink-950 transition-transform hover:-translate-y-0.5"
              >
                Continue shopping
              </Link>
              <a
                href={waLink(helpMessage, helpNumber)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-5 py-3 font-bold text-[#052e16] transition-transform hover:-translate-y-0.5"
              >
                <WhatsAppIcon className="h-5 w-5" /> Confirm on WhatsApp
              </a>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-ink-900/60 p-6">
            <h2 className="font-display text-lg font-bold text-white">Order summary</h2>
            <ul className="mt-4 space-y-3 text-sm">
              {order.items.map((item) => (
                <li key={item.slug} className="flex items-baseline justify-between gap-4">
                  <span className="text-mist-300">
                    {item.name}{" "}
                    <span className="text-mist-500">
                      × {item.qty} {item.unit}
                    </span>
                  </span>
                  <span className="shrink-0 font-semibold text-white">
                    {formatGHS(item.lineTotalPesewas / 100)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex items-baseline justify-between border-t border-white/10 pt-4">
              <span className="font-semibold text-white">Total paid</span>
              <span className="font-display text-xl font-extrabold text-white">{total}</span>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-mist-500">
              Keep this reference for your records. We&apos;ve linked this payment to the email
              address on your order for receipts and updates.
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <ErrorPanel
      message={
        error ||
        "We couldn't confirm this payment. If you were charged, please contact us with your reference."
      }
      reference={reference}
    />
  );
}

function ErrorPanel({ message, reference }: { message: string; reference: string }) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:py-20">
      <div className="rounded-3xl border border-amber-400/25 bg-amber-500/10 p-7 text-center sm:p-10">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-amber-500/15 text-amber-300 ring-1 ring-amber-400/30">
          <ShieldIcon className="h-8 w-8" />
        </span>
        <p className="mt-5 text-xs font-semibold uppercase tracking-widest text-amber-300">
          Payment status
        </p>
        <h1 className="mt-2 font-display text-2xl font-extrabold text-white sm:text-3xl">
          We couldn&apos;t confirm this payment
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-mist-300">{message}</p>

        {reference && (
          <p className="mt-5 text-xs text-mist-400">
            Reference: <span className="font-mono font-semibold text-mist-100">{reference}</span>
          </p>
        )}

        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <a
            href={waLink(
              `Hello ${site.shortName}, I need help with a payment. My reference is ${reference || "(none)"}.`,
              site.payments.mobileMoney.whatsapp,
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-5 py-3 font-bold text-[#052e16] transition-transform hover:-translate-y-0.5"
          >
            <WhatsAppIcon className="h-5 w-5" /> Contact us
          </a>
          <Link
            href="/cart"
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-5 py-3 font-semibold text-white transition-colors hover:border-forge-400/60"
          >
            Try payment again
          </Link>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-5 py-3 font-semibold text-white transition-colors hover:border-forge-400/60"
          >
            Back to shop
          </Link>
        </div>
      </div>

      <p className="mx-auto mt-5 max-w-lg text-center text-xs leading-relaxed text-mist-500">
        If your account was debited but you see this page, don&apos;t pay again — send us the
        reference above and we&apos;ll reconcile it with Paystack.
      </p>
    </div>
  );
}
