import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

/*
 * Content-Security-Policy. Next.js injects inline bootstrap scripts, so
 * script-src needs 'unsafe-inline' unless every page renders dynamically with
 * nonces. The policy still blocks third-party scripts, plugins, <base>
 * hijacking, foreign form targets and framing by other sites.
 * Paystack checkout is a top-level redirect, so it needs no entry here.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  `connect-src 'self'${isDev ? " ws: wss:" : ""}`,
  "frame-src https://www.google.com https://maps.google.com",
  "frame-ancestors 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  // Pin the workspace root to this project. Without this, Turbopack walks up
  // and finds an unrelated package-lock.json in the parent folder, printing:
  // "Next.js ignored package-lock.json … because it is outside the current Git repository".
  turbopack: {
    root: process.cwd(),
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: contentSecurityPolicy },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            // Geolocation is used by the booking form ("use my location").
            value: "camera=(), microphone=(), payment=(), usb=(), geolocation=(self)",
          },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
        ],
      },
      {
        // The app's service worker must never be cached, so updates roll out
        // the next time the app is opened.
        source: "/sw.js",
        headers: [
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
      {
        // Admin pages and APIs carry customer data: never cache them anywhere.
        source: "/(admin|api/admin)(.*)",
        headers: [
          { key: "Cache-Control", value: "no-store, max-age=0" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
    ];
  },
};

export default nextConfig;
