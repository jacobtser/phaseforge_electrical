import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { LogoutButton } from "@/components/LogoutButton";
import { requireAdmin } from "@/lib/auth";
import { listOrders } from "@/lib/db";
import { formatGHS } from "@/lib/products";

export const metadata: Metadata = {
  title: "Shop orders",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const statusStyles: Record<string, string> = {
  paid: "bg-emerald-500/15 text-emerald-300 ring-emerald-400/30",
  pending: "bg-amber-500/15 text-amber-300 ring-amber-400/30",
  failed: "bg-red-500/15 text-red-300 ring-red-400/30",
};

const fulfilmentLabels: Record<string, string> = {
  "delivery-accra": "Delivery — Greater Accra",
  "delivery-nationwide": "Delivery — Nationwide",
  pickup: "Pickup from workshop",
};

export default async function AdminOrdersPage() {
  const session = await requireAdmin();
  const orders = await listOrders({ limit: 200 });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Logo />
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-mist-400 sm:inline">
            Signed in as <span className="text-mist-200">{session.user}</span>
          </span>
          <Link
            href="/admin"
            className="rounded-lg border border-white/10 px-3.5 py-2 text-sm font-medium text-mist-100 transition-colors hover:border-volt-400/50"
          >
            Service requests
          </Link>
          <LogoutButton />
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-white sm:text-3xl">
            Shop orders
          </h1>
          <p className="mt-1 text-sm text-mist-400">
            Online payments confirmed by Paystack. Showing the latest {orders.length} order
            {orders.length === 1 ? "" : "s"}.
          </p>
        </div>
        <Link
          href="/admin"
          className="text-sm font-semibold text-volt-300 hover:underline"
        >
          ← Back to service requests
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-white/15 bg-ink-900/40 p-10 text-center">
          <h2 className="font-display text-lg font-bold text-white">No online orders yet</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-mist-400">
            When a customer pays through Paystack, their order will appear here with the items,
            contact details and payment reference.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {orders.map((order) => {
            const statusClass =
              statusStyles[order.status] ?? "bg-white/10 text-mist-200 ring-white/15";
            return (
              <details
                key={order.id}
                className="group rounded-2xl border border-white/10 bg-ink-900/60 open:border-white/20"
              >
                <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-4 p-4 [&::-webkit-details-marker]:hidden">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-mist-200">
                        {order.reference}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1 ${statusClass}`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <p className="mt-1 truncate font-semibold text-white">
                      {order.name}{" "}
                      <span className="font-normal text-mist-400">· {order.phone}</span>
                    </p>
                    <p className="truncate text-xs text-mist-400">{order.email}</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <div className="font-display text-lg font-extrabold text-white">
                      {formatGHS(order.amount / 100)}
                    </div>
                    <div className="text-xs text-mist-400">
                      {new Date(order.createdAt).toLocaleString("en-GH", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </div>
                    <span className="mt-1 inline-block text-[11px] font-semibold text-volt-300 group-open:hidden">
                      Show details
                    </span>
                    <span className="mt-1 hidden text-[11px] font-semibold text-volt-300 group-open:inline-block">
                      Hide details
                    </span>
                  </div>
                </summary>

                <div className="grid gap-5 border-t border-white/10 p-4 sm:grid-cols-2">
                  <div>
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-mist-400">
                      Fulfilment
                    </h2>
                    <dl className="mt-2 space-y-1.5 text-sm">
                      <div className="flex justify-between gap-4">
                        <dt className="text-mist-400">Method</dt>
                        <dd className="text-right text-mist-100">
                          {fulfilmentLabels[order.fulfilment] ?? order.fulfilment}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-mist-400">Location</dt>
                        <dd className="text-right text-mist-100">{order.location || "—"}</dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-mist-400">Paid</dt>
                        <dd className="text-right text-mist-100">
                          {order.paidAt
                            ? new Date(order.paidAt).toLocaleString("en-GH", {
                                dateStyle: "medium",
                                timeStyle: "short",
                              })
                            : "—"}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-mist-400">Paystack ref</dt>
                        <dd className="truncate text-right font-mono text-xs text-mist-100">
                          {order.paystackReference || order.reference}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div>
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-mist-400">
                      Items
                    </h2>
                    <ul className="mt-2 space-y-1.5 text-sm">
                      {order.items.map((item) => (
                        <li key={item.slug} className="flex justify-between gap-4">
                          <span className="text-mist-200">
                            {item.name}{" "}
                            <span className="text-mist-500">
                              × {item.qty} {item.unit}
                            </span>
                          </span>
                          <span className="shrink-0 font-medium text-white">
                            {formatGHS(item.lineTotalPesewas / 100)}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-3 flex justify-between border-t border-white/10 pt-3 text-sm">
                      <span className="font-semibold text-white">Total</span>
                      <span className="font-display font-extrabold text-white">
                        {formatGHS(order.amount / 100)}
                      </span>
                    </div>
                  </div>
                </div>
              </details>
            );
          })}
        </div>
      )}
    </div>
  );
}
