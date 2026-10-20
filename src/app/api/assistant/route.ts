import { NextResponse } from "next/server";
import { askAssistant, localFallbackReply } from "@/lib/assistant";
import { assistantRequestSchema, firstError } from "@/lib/validation";

export const runtime = "nodejs";
export const maxDuration = 45;

const WINDOW_MS = 10 * 60_000;
const MAX_PER_WINDOW = 30;
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
      {
        ok: false,
        message:
          "You've sent a lot of messages. Please wait a few minutes, or continue on WhatsApp.",
      },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request." }, { status: 400 });
  }

  const parsed = assistantRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: firstError(parsed.error.issues) },
      { status: 422 },
    );
  }

  const result = await askAssistant(parsed.data.messages, parsed.data.page);

  if (!result.ok) {
    const fallback = localFallbackReply(parsed.data.messages);
    if (fallback) {
      return NextResponse.json({ ok: true, reply: fallback });
    }
    return NextResponse.json(
      { ok: false, message: result.message },
      { status: result.status },
    );
  }

  return NextResponse.json({ ok: true, reply: result.reply });
}
