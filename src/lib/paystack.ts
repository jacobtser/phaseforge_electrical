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

export type PaystackMode = "live" | "test" | "none";

function rawSecretKey(): string {
  return process.env.PAYSTACK_SECRET_KEY?.trim() ?? "";
}

export function paystackMode(): PaystackMode {
  const key = rawSecretKey();
  if (!key) return "none";
  if (key.startsWith("sk_live_")) return "live";
  if (key.startsWith("sk_test_")) return "test";
  return "none";
}

/**
 * Test keys must never quietly process "payments" on the live site. They are
 * only enabled in production when PAYSTACK_ALLOW_TEST_MODE=true is set
 * explicitly (useful while the Paystack account is still being activated).
 */
export function paystackConfigured(): boolean {
  const mode = paystackMode();
  if (mode === "none") return false;
  if (mode === "test" && process.env.NODE_ENV === "production") {
    const allowed =
      process.env.PAYSTACK_ALLOW_TEST_MODE?.trim().toLowerCase() === "true";
    if (!allowed) {
      console.warn(
        "[paystack] A test secret key is configured in production. Online payments are disabled. " +
          "Use the live key, or set PAYSTACK_ALLOW_TEST_MODE=true to test on purpose.",
      );
    }
    return allowed;
  }
  return true;
}

function secretKey(): string {
  const key = rawSecretKey();
  if (!key) throw new Error("PAYSTACK_SECRET_KEY is not configured.");
  return key;
}

/**
 * Prefer the canonical public URL so Paystack always returns customers to the
 * real domain, even when the request reached a preview or internal hostname.
 * Local development still comes back to localhost.
 */
export function paystackCallbackUrl(requestUrl: string): string {
  let origin = "";
  try {
    origin = new URL(requestUrl).origin;
  } catch {
    origin = "";
  }

  const isLocal = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin);
  const isPreview = process.env.VERCEL_ENV === "preview";
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "");
  const base = isLocal || isPreview || !configured ? origin : configured;

  if (!base) throw new Error("Could not determine the payment callback URL.");
  return `${base}/payment/callback`;
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
