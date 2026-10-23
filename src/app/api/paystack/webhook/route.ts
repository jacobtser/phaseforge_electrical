import { after, NextResponse } from "next/server";
import { getOrderByReference, markOrderFailed, markOrderPaid } from "@/lib/db";
import { notifyOrderPaid } from "@/lib/notify";
import {
  paystackConfigured,
  verifyPaystackWebhook,
} from "@/lib/paystack";

export const runtime = "nodejs";

type PaystackWebhookEvent = {
  event?: string;
  data?: {
    reference?: string;
    status?: string;
    amount?: number;
    currency?: string;
  };
};

export async function POST(req: Request) {
  if (!paystackConfigured()) {
    return NextResponse.json({ ok: false, message: "Paystack is not configured." }, { status: 503 });
  }

  const rawBody = await req.text();
  const signature = req.headers.get("x-paystack-signature");

  if (!verifyPaystackWebhook(rawBody, signature)) {
    return NextResponse.json({ ok: false, message: "Invalid signature." }, { status: 401 });
  }

  let event: PaystackWebhookEvent;
  try {
    event = JSON.parse(rawBody) as PaystackWebhookEvent;
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid payload." }, { status: 400 });
  }

  const tx = event.data;
  if (!tx?.reference) {
    return NextResponse.json({ received: true });
  }

  const reference = String(tx.reference);

  // A declined card or cancelled Mobile Money prompt should not leave the
  // order sitting as "pending" forever. Never downgrade an order already paid.
  if (event.event === "charge.failed") {
    try {
      await markOrderFailed(reference);
    } catch (err) {
      console.error("[paystack webhook] could not mark order failed", err);
    }
    return NextResponse.json({ received: true });
  }

  if (event.event !== "charge.success") {
    return NextResponse.json({ received: true });
  }

  if (tx.status && tx.status !== "success") {
    return NextResponse.json({ received: true });
  }

  try {
    const order = await getOrderByReference(reference);
    if (!order) {
      console.warn(`[paystack webhook] no order found for ${reference}`);
      return NextResponse.json({ received: true });
    }

    if (Number(tx.amount) !== order.amount || String(tx.currency).toUpperCase() !== order.currency) {
      console.warn(`[paystack webhook] amount/currency mismatch for ${reference}`);
      return NextResponse.json({ received: true });
    }

    const result = await markOrderPaid(reference, reference);
    if (result.changed && result.order) {
      const paidOrder = result.order;
      after(async () => {
        try {
          await notifyOrderPaid(paidOrder);
        } catch (err) {
          console.error("[paystack webhook] paid-order notification failed", err);
        }
      });
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[paystack webhook] processing failed", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
