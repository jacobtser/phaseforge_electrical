import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

/**
 * Web app manifest: makes the site installable as an app on Android, iOS/iPadOS,
 * Windows, macOS, Linux and ChromeOS. The installed app always loads the live
 * site, so every deploy reaches users the next time they open it.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: site.name,
    short_name: site.shortName,
    description: site.description,
    start_url: "/?source=app",
    scope: "/",
    display: "standalone",
    display_override: ["window-controls-overlay", "standalone", "minimal-ui"],
    orientation: "any",
    background_color: "#040a14",
    theme_color: "#040a14",
    lang: "en-GH",
    dir: "ltr",
    categories: ["business", "shopping", "utilities"],
    prefer_related_applications: false,
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    screenshots: [
      {
        src: "/screenshots/wide.png",
        sizes: "1280x800",
        type: "image/png",
        form_factor: "wide",
        label: "PhaseForge on a laptop",
      },
      {
        src: "/screenshots/narrow.png",
        sizes: "390x844",
        type: "image/png",
        form_factor: "narrow",
        label: "PhaseForge on a phone",
      },
    ],
    shortcuts: [
      {
        name: "Shop materials",
        short_name: "Shop",
        url: "/shop?source=app",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
      {
        name: "Book a visit",
        short_name: "Book",
        url: "/book?source=app",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
      {
        name: "My cart",
        short_name: "Cart",
        url: "/cart?source=app",
        icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }],
      },
    ],
  };
}
