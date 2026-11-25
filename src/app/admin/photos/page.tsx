import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { LogoutButton } from "@/components/LogoutButton";
import { ProductPhotoManager, type PhotoRow } from "@/components/ProductPhotoManager";
import { requireAdmin } from "@/lib/auth";
import { isPersistent, listProductImages } from "@/lib/db";
import { categories, products } from "@/lib/products";
import { cloudinaryConfig } from "@/lib/uploads";
import { imageGenerationConfigured } from "@/lib/product-image-ai";

export const metadata: Metadata = {
  title: "Product photos",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminPhotosPage() {
  const session = await requireAdmin();
  const [images, persistent] = await Promise.all([listProductImages(), isPersistent()]);
  const bySlug = new Map(images.map((img) => [img.slug, img]));
  const aiEnabled = imageGenerationConfigured();

  const rows: PhotoRow[] = products.map((p) => {
    const img = bySlug.get(p.slug);
    return {
      slug: p.slug,
      name: p.name,
      brand: p.brand,
      category: p.category,
      art: p.art,
      url: img?.url ?? p.image ?? null,
      source: img?.source ?? null,
    };
  });

  const warnings: string[] = [];
  if (!persistent) {
    warnings.push(
      "DATABASE_URL is not set, so photo assignments are saved to a local file. On Vercel they will be lost on the next deploy.",
    );
  }
  if (!cloudinaryConfig() && process.env.VERCEL) {
    warnings.push(
      "Cloudinary is not configured. On Vercel, photos saved to local disk disappear. Set CLOUDINARY_CLOUD_NAME and CLOUDINARY_UPLOAD_PRESET before adding photos.",
    );
  }
  if (!aiEnabled) {
    warnings.push("GEMINI_API_KEY is not set, so AI photo generation is turned off. Uploads still work.");
  }

  const nav = "rounded-lg border border-white/10 px-3.5 py-2 text-sm font-medium text-mist-100 transition-colors hover:border-volt-400/50";

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Logo />
        <div className="flex flex-wrap items-center gap-3">
          <span className="hidden text-sm text-mist-400 sm:inline">
            Signed in as <span className="text-mist-200">{session.user}</span>
          </span>
          <Link href="/admin" className={nav}>Service requests</Link>
          <Link href="/admin/orders" className={nav}>Shop orders</Link>
          <Link href="/admin/knowledge" className={nav}>Assistant knowledge</Link>
          <LogoutButton />
        </div>
      </div>

      <div className="mt-8">
        <h1 className="font-display text-2xl font-extrabold text-white sm:text-3xl">Product photos</h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-mist-400">
          Upload a real photo of each product, or press <strong className="text-mist-200">Generate (AI)</strong>{" "}
          to have Gemini create a photorealistic studio shot from the product&apos;s name and specs.
          Check every AI photo against the real item before relying on it, and replace it with a
          real photo where the exact look matters. Changes appear in the shop within a minute.
        </p>
      </div>

      <ProductPhotoManager
        rows={rows}
        categories={categories.map((c) => ({ id: c.id, label: c.label }))}
        aiEnabled={aiEnabled}
        warnings={warnings}
      />
    </div>
  );
}
