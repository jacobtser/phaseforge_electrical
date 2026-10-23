import Link from "next/link";
import clsx from "clsx";
import { site, waLink } from "@/lib/site";
import { ArrowRightIcon, CheckIcon, PhoneIcon, WhatsAppIcon } from "./Icons";

export function PaymentDetails({
  compact = false,
  className,
  showDetailsLink = true,
  onlinePayments = false,
}: {
  compact?: boolean;
  className?: string;
  showDetailsLink?: boolean;
  onlinePayments?: boolean;
}) {
  const momo = site.payments.mobileMoney;
  const paymentMethods = onlinePayments
    ? site.payments.methods
    : site.payments.methods.filter((method) => !/paystack/i.test(method));
  const waHref = waLink(
    "Hello PhaseForge, I've made a payment. My order/reference is: ",
    momo.whatsapp,
  );

  return (
    <section
      className={clsx(
        "rounded-2xl border border-forge-400/25 bg-forge-500/10",
        compact ? "p-5" : "p-6",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-lg font-extrabold text-white">Payment</h2>
        <span className="rounded-full bg-forge-500/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-forge-200 ring-1 ring-forge-400/30">
          Mobile Money
        </span>
      </div>

      <p className="mt-2 text-sm leading-relaxed text-mist-300">
        {onlinePayments
          ? "At cart checkout you can pay securely by card or Mobile Money through Paystack. For WhatsApp or manual orders, pay the confirmed amount to:"
          : "We confirm stock and the final amount first. Then pay the confirmed amount to:"}
      </p>

      <a
        href={`tel:${momo.tel}`}
        className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-ink-950/50 px-4 py-3 transition-colors hover:border-forge-400/50"
      >
        <span>
          <span className="block text-[10px] font-semibold uppercase tracking-wider text-mist-400">
            Mobile Money number
          </span>
          <span className="mt-0.5 block font-mono text-lg font-bold text-white">{momo.label}</span>
        </span>
        <PhoneIcon className="h-5 w-5 shrink-0 text-forge-400" />
      </a>

      {!compact && (
        <ol className="mt-4 space-y-2 text-sm text-mist-300">
          {[
            "We confirm stock and send your order total.",
            "Send the exact amount to the Mobile Money number above.",
            "Use your order reference as the payment reference, then send the receipt on WhatsApp.",
          ].map((step, i) => (
            <li key={step} className="flex gap-2.5">
              <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-forge-500/15 text-[10px] font-bold text-forge-300">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-3.5 py-2 text-xs font-bold text-[#052e16] transition-transform hover:-translate-y-0.5"
        >
          <WhatsAppIcon className="h-4 w-4" /> Send payment confirmation
        </a>
        {showDetailsLink && (
          <Link
            href="/payment"
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-3.5 py-2 text-xs font-semibold text-mist-100 transition-colors hover:border-forge-400/60 hover:text-white"
          >
            Payment details <ArrowRightIcon className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>

      {!compact && (
        <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-white/10 pt-3 text-xs text-mist-400">
          {paymentMethods.map((method) => (
            <li key={method} className="inline-flex items-center gap-1.5">
              <CheckIcon className="h-3.5 w-3.5 text-forge-400" /> {method}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
