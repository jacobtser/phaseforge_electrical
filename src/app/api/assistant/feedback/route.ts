import { NextResponse } from "next/server";
import { recordKnowledgeGap } from "@/lib/db";
import { assistantFeedbackSchema, firstError } from "@/lib/validation";

export const runtime = "nodejs";

const WINDOW_MS = 10 * 60_000;
const MAX_PER_WINDOW = 60;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((time) => now - time < WINDOW_MS);
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
    return NextResponse.json({ ok: false }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const parsed = assistantFeedbackSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: firstError(parsed.error.issues) },
      { status: 422 },
    );
  }

  // A thumbs-down means the question belongs in the team's learning queue.
  // Only the question text is stored; no IP address, name or contact details.
  if (!parsed.data.helpful) {
    await recordKnowledgeGap(parsed.data.question).catch((error) => {
      console.error("[assistant] could not record feedback gap", error);
    });
  }

  return NextResponse.json({ ok: true });
}
