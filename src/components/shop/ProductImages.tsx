"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import clsx from "clsx";
import { ProductArt } from "./ProductArt";
import type { Product } from "@/lib/products";

/* Photo map (slug → URL) managed from /admin/photos, loaded once per visit. */

type ImageMap = Record<string, string> | null; // null = still loading

const ProductImagesContext = createContext<ImageMap>({});

export function ProductImagesProvider({ children }: { children: ReactNode }) {
  const [images, setImages] = useState<ImageMap>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/product-images")
      .then((res) => (res.ok ? res.json() : { images: {} }))
      .then((data: { images?: Record<string, string> }) => {
        if (!cancelled) setImages(data.images ?? {});
      })
      .catch(() => {
        if (!cancelled) setImages({});
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return <ProductImagesContext.Provider value={images}>{children}</ProductImagesContext.Provider>;
}

/**
 * Shows the product's photo when one is attached, otherwise the drawn
 * illustration. While the photo map loads it shows a neutral placeholder so
 * the drawing never flashes before the real photo.
 */
export function ProductImage({
  product,
  alt = "",
  className,
  artClassName,
  eager,
  zoom,
}: {
  product: Pick<Product, "slug" | "art" | "image">;
  alt?: string;
  className?: string;
  artClassName?: string;
  eager?: boolean;
  zoom?: boolean;
}) {
  const images = useContext(ProductImagesContext);
  const [failed, setFailed] = useState(false);
  const src = images?.[product.slug] ?? product.image ?? null;
  const hover = zoom ? "transition-transform duration-500 group-hover:scale-105" : "";

  if (images === null && !product.image) {
    return <div className={clsx("h-full w-full animate-pulse bg-ink-900", className)} />;
  }

  if (src && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- photos come from Cloudinary or /api/uploads
      <img
        src={src}
        alt={alt}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        onError={() => setFailed(true)}
        className={clsx("h-full w-full object-cover", hover, className)}
      />
    );
  }

  return (
    <div className={clsx("h-full w-full", hover, artClassName)}>
      <ProductArt art={product.art} />
    </div>
  );
}
