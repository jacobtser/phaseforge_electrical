import { NextResponse } from "next/server";
import { listProductImages } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Public map of product slug → photo URL, used by every product card. */
export async function GET() {
  try {
    const rows = await listProductImages();
    const images: Record<string, string> = {};
    for (const row of rows) images[row.slug] = row.url;
    return NextResponse.json(
      { images },
      { headers: { "Cache-Control": "public, max-age=30, s-maxage=60, stale-while-revalidate=300" } },
    );
  } catch (err) {
    console.error("[product-images] list failed", err);
    return NextResponse.json({ images: {} }, { headers: { "Cache-Control": "no-store" } });
  }
}
