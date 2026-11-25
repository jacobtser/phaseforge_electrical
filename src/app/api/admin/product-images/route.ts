import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { isSameOrigin } from "@/lib/security";
import { deleteProductImage, setProductImage } from "@/lib/db";
import { getProduct } from "@/lib/products";
import { savePhoto } from "@/lib/uploads";
import { generateProductImage } from "@/lib/product-image-ai";

export const runtime = "nodejs";
// AI image generation can take up to a minute.
export const maxDuration = 120;

async function guard(req: Request) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ ok: false, message: "Forbidden" }, { status: 403 });
  }
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }
  return null;
}

function bad(message: string, status = 422) {
  return NextResponse.json({ ok: false, message }, { status });
}

/**
 * Attach a photo to a product.
 *  - multipart/form-data with `slug` + `file`  → owner upload
 *  - JSON `{ slug, generate: true, extra? }`   → photorealistic AI shot
 */
export async function POST(req: Request) {
  const denied = await guard(req);
  if (denied) return denied;

  const type = req.headers.get("content-type") ?? "";

  if (type.includes("multipart/form-data")) {
    const form = await req.formData().catch(() => null);
    const slug = String(form?.get("slug") ?? "");
    const file = form?.get("file");
    if (!getProduct(slug)) return bad("Product not found.", 404);
    if (!(file instanceof File)) return bad("Choose a photo to upload.");
    const saved = await savePhoto(file);
    if (!saved.ok) return bad(saved.message);
    const record = await setProductImage(slug, saved.url, "upload");
    return NextResponse.json({ ok: true, image: record });
  }

  const body = (await req.json().catch(() => null)) as
    | { slug?: unknown; generate?: unknown; extra?: unknown }
    | null;
  const slug = typeof body?.slug === "string" ? body.slug : "";
  const product = getProduct(slug);
  if (!product) return bad("Product not found.", 404);
  if (body?.generate !== true) return bad("Nothing to do.");
  const extra = typeof body.extra === "string" ? body.extra.trim().slice(0, 300) : undefined;

  const result = await generateProductImage(product, extra);
  if (!result.ok) return bad(result.message, 502);

  const ext = result.image.mimeType.includes("jpeg") ? "jpg" : result.image.mimeType.split("/")[1] || "png";
  const file = new File([new Uint8Array(result.image.bytes)], `${slug}.${ext}`, {
    type: result.image.mimeType,
  });
  const saved = await savePhoto(file);
  if (!saved.ok) return bad(saved.message, 500);
  const record = await setProductImage(slug, saved.url, "ai");
  return NextResponse.json({ ok: true, image: record, model: result.image.model });
}

/** Remove a product's photo so the shop falls back to the illustration. */
export async function DELETE(req: Request) {
  const denied = await guard(req);
  if (denied) return denied;
  const slug = new URL(req.url).searchParams.get("slug") ?? "";
  if (!getProduct(slug)) return bad("Product not found.", 404);
  const done = await deleteProductImage(slug);
  return NextResponse.json({ ok: done });
}
