import { NextResponse } from "next/server";
import { createOrder, markOrderFailed } from "@/lib/db";
import { initializePaystackTransaction, paystackConfigured } from "@/lib/paystack";
import { getProduct } from "@/lib/products";
import type { OrderItem } from "@/lib/types";
import { makeRef } from "@/lib/types";
import {
  checkoutSchema,
  fieldErrors,
  firstError,
} from "@/lib/validation";

export const runtime = "nodejs";

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 10;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > MAX_PER_WINDOW;
}

export async function POST(req: Request) {
  if (!paystackConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        message:
          "Online payment is not configured yet. Please send your order on WhatsApp instead.",
      },
      { status: 503 },
    );
  }

  if (process.env.VERCEL === "1" && !process.env.DATABASE_URL) {
    return NextResponse.json(
      {
        ok: false,
        message:
          "Online payment needs a database. Add DATABASE_URL in Vercel, then try again.",
      },
      { status: 503 },
    );
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  if (rateLimited(ip)) {
    return NextResponse.json(
      { ok: false, message: "Too many attempts. Please wait a minute and try again." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request." }, { status: 400 });
  }

  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        message: firstError(parsed.error.issues),
        errors: fieldErrors(parsed.error.issues),
      },
      { status: 422 },
    );
  }

  const data = parsed.data;

  // Merge duplicate slugs before pricing so the amount cannot be split or manipulated.
  const quantities = new Map<string, number>();
  for (const item of data.items) {
    quantities.set(item.slug, Math.min((quantities.get(item.slug) ?? 0) + item.qty, 999));
  }

  const items: OrderItem[] = [];
  let amount = 0;

  for (const [slug, qty] of quantities) {
    const product = getProduct(slug);
    if (!product) {
      return NextResponse.json(
        { ok: false, message: "One of the items is no longer available. Please refresh your cart." },
        { status: 400 },
      );
    }
    if (product.price === null || product.price <= 0) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "Some items are priced on request. Please send this order on WhatsApp so we can confirm the price first.",
        },
        { status: 400 },
      );
    }

    const unitPricePesewas = Math.round(product.price * 100);
    const lineTotalPesewas = unitPricePesewas * qty;
    items.push({
      slug: product.slug,
      name: product.name,
      brand: product.brand,
      category: product.category,
      unit: product.unit,
      qty,
      unitPricePesewas,
      lineTotalPesewas,
    });
    amount += lineTotalPesewas;
  }

  if (amount <= 0) {
    return NextResponse.json(
      { ok: false, message: "This cart cannot be paid online. Please contact us." },
      { status: 400 },
    );
  }

  let order;
  try {
    order = await createOrder({
      reference: makeRef(),
      amount,
      currency: "GHS",
      email: data.customer.email,
      name: data.customer.name,
      phone: data.customer.phone,
      location: data.customer.location || null,
      fulfilment: data.fulfilment,
      items,
    });
  } catch (err) {
    console.error("[/api/paystack/initialize] could not create order", err);
    return NextResponse.json(
      {
        ok: false,
        message: "We couldn't create your order. Please try again or send it on WhatsApp.",
      },
      { status: 500 },
    );
  }

  try {
    const transaction = await initializePaystackTransaction({
      email: order.email,
      amount: order.amount,
      reference: order.reference,
      callbackUrl: `${new URL(req.url).origin}/payment/callback`,
      metadata: {
        order_reference: order.reference,
        customer_name: order.name,
        customer_phone: order.phone,
        fulfilment: order.fulfilment,
        items: order.items.map((item) => `${item.slug} × ${item.qty}`),
      },
    });

    return NextResponse.json({
      ok: true,
      reference: order.reference,
      authorizationUrl: transaction.authorization_url,
    });
  } catch (err) {
    console.error("[/api/paystack/initialize] Paystack initialization failed", err);
    try {
      await markOrderFailed(order.reference);
    } catch (markErr) {
      console.error("[/api/paystack/initialize] could not mark order failed", markErr);
    }
    return NextResponse.json(
      {
        ok: false,
        message:
          "Paystack could not start the payment. Please try again or send your order on WhatsApp.",
      },
      { status: 502 },
    );
  }
}
