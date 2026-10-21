import { NextResponse } from "next/server";
import { submissionSchema, firstError, fieldErrors } from "@/lib/validation";
import { createSubmission } from "@/lib/db";
import { dispatchNotifications } from "@/lib/notify";

export const runtime = "nodejs";

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 6;
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
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  if (rateLimited(ip)) {
    return NextResponse.json(
      { ok: false, message: "Too many requests. Please wait a minute and try again." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request." }, { status: 400 });
  }

  const parsed = submissionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: firstError(parsed.error.issues), errors: fieldErrors(parsed.error.issues) },
      { status: 422 },
    );
  }

  const d = parsed.data;

  try {
    const record = await createSubmission({
      type: d.type,
      name: d.name,
      email: d.email,
      phone: d.phone,
      serviceCategory: d.serviceCategory,
      service: d.service || null,
      propertyType: d.propertyType || null,
      address: d.address || null,
      city: d.city || null,
      latitude: d.latitude ?? null,
      longitude: d.longitude ?? null,
      preferredDate: d.preferredDate || null,
      preferredTime: d.preferredTime || null,
      urgency: d.urgency,
      budget: d.budget || null,
      details: d.details,
      photos: d.photos ?? null,
      referral: d.referral || null,
      source: req.headers.get("referer") || "website",
    });

    const notifyResult = await dispatchNotifications(record);

    return NextResponse.json({
      ok: true,
      result: {
        ref: record.ref,
        whatsapp: {
          delivered: notifyResult.whatsapp.ok,
          channel: notifyResult.whatsapp.channel,
          waLink: (notifyResult.whatsapp as { waLink?: string }).waLink ?? "",
        },
        sms: {
          delivered: notifyResult.sms.ok,
          channel: notifyResult.sms.channel,
        },
        email: {
          ownerSent: notifyResult.ownerEmail.ok,
          customerSent: notifyResult.customerEmail.ok,
        },
      },
    });
  } catch (err) {
    console.error("[/api/quote] failed", err);
    return NextResponse.json(
      { ok: false, message: "Something went wrong on our side. Please call us instead." },
      { status: 500 },
    );
  }
}
