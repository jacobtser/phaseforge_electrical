import { createHmac, timingSafeEqual } from "node:crypto";

/* -------------------------------------------------------------------------- */
/* Paystack (Ghana) — hosted checkout.                                        */
/* The secret key never leaves the server; the browser is redirected to        */
/* Paystack's authorization URL and comes back through /payment/callback.     */
/* -------------------------------------------------------------------------- */

const PAYSTACK_API = "https://api.paystack.co";

export type PaystackInitializeResult = {
  authorization_url: string;
  access_code: string;
  reference: string;
};

export type PaystackTransaction = {
  id?: number;
  status: string;
  reference: string;
  amount: number;
  currency: string;
  paid_at?: string | null;
  channel?: string | null;
  customer?: { email?: string | null };
};

type PaystackResponse<T> = {
  status?: boolean;
  message?: string;
  data?: T;
};

export function paystackConfigured(): boolean {
  return Boolean(process.env.PAYSTACK_SECRET_KEY?.trim());
}

function secretKey(): string {
  const key = process.env.PAYSTACK_SECRET_KEY?.trim();
  if (!key) throw new Error("PAYSTACK_SECRET_KEY is not configured.");
  return key;
}

export async function initializePaystackTransaction(input: {
  email: string;
  /** Amount in pesewas (GHS × 100). */
  amount: number;
  reference: string;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
}): Promise<PaystackInitializeResult> {
  const res = await fetch(`${PAYSTACK_API}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: input.email,
      amount: input.amount,
      currency: "GHS",
      reference: input.reference,
      callback_url: input.callbackUrl,
      metadata: input.metadata,
    }),
    cache: "no-store",
  });

  const payload = (await res
    .json()
    .catch(() => null)) as PaystackResponse<PaystackInitializeResult> | null;

  if (!res.ok || !payload?.status || !payload.data?.authorization_url) {
    throw new Error(
      payload?.message || `Paystack could not start the payment (${res.status}).`,
    );
  }

  return payload.data;
}

/** Returns null when Paystack cannot verify the reference. */
export async function verifyPaystackTransaction(
  reference: string,
): Promise<PaystackTransaction | null> {
  const res = await fetch(
    `${PAYSTACK_API}/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: { Authorization: `Bearer ${secretKey()}` },
      cache: "no-store",
    },
  );

  const payload = (await res
    .json()
    .catch(() => null)) as PaystackResponse<PaystackTransaction> | null;

  if (!res.ok || !payload?.status || !payload.data) return null;
  return payload.data;
}

/**
 * Paystack signs the raw webhook body with HMAC-SHA512 using the secret key.
 * Compare in constant time to avoid leaking a valid signature.
 */
export function verifyPaystackWebhook(
  rawBody: string,
  signature: string | null,
): boolean {
  if (!process.env.PAYSTACK_SECRET_KEY?.trim() || !signature) return false;
  if (!/^[a-f0-9]{128}$/i.test(signature)) return false;

  const expected = createHmac("sha512", secretKey()).update(rawBody).digest();
  const provided = Buffer.from(signature, "hex");
  if (expected.length !== provided.length) return false;
  return timingSafeEqual(expected, provided);
}
