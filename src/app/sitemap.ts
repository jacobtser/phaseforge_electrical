import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { products } from "@/lib/products";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/services", "/shop", "/about", "/contact", "/book", "/payment"];
  const now = new Date();
  const pages = routes.map((r) => ({
    url: `${site.url}${r}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: r === "" ? 1 : r === "/shop" ? 0.9 : 0.8,
  }));
  const productPages = products.map((p) => ({
    url: `${site.url}/shop/${p.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));
  return [...pages, ...productPages];
}
