import { NextResponse } from "next/server";
import { isUploadSuccess, savePhoto, type UploadOutcome } from "@/lib/uploads";
import { MAX_PHOTOS } from "@/lib/upload-limits";

export const runtime = "nodejs";
export const maxDuration = 30;

/* Light in-memory throttle so a single client can't hammer the uploader. */
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 20;
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
      { ok: false, message: "Too many uploads at once. Please wait a moment and try again." },
      { status: 429 },
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid upload." }, { status: 400 });
  }

  const files = form.getAll("file").filter((v): v is File => v instanceof File);
  if (files.length === 0) {
    return NextResponse.json({ ok: false, message: "No photos were received." }, { status: 400 });
  }

  const outcomes: UploadOutcome[] = await Promise.all(
    files.slice(0, MAX_PHOTOS).map((file) => savePhoto(file)),
  );

  const uploaded = outcomes.filter(isUploadSuccess);
  const failed = outcomes.filter((o): o is Extract<UploadOutcome, { ok: false }> => !o.ok);

  if (uploaded.length === 0) {
    return NextResponse.json(
      { ok: false, message: failed[0]?.message ?? "The upload failed. Please try again.", failures: failed },
      { status: 422 },
    );
  }

  return NextResponse.json({
    ok: true,
    files: uploaded.map((o) => ({ url: o.url, name: o.name })),
    failures: failed,
  });
}
