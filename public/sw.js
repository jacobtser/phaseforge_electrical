/*
 * PhaseForge service worker.
 *
 * Goal: the installed app always shows the LIVE site. Pages are fetched from
 * the network first on every visit, so a new deploy is visible the next time
 * the app opens. Cached copies are only used when the device is offline.
 *
 *  - Pages (navigations): network first → last saved copy → /offline
 *  - /_next/static/*: cache first (file names are content-hashed, never stale)
 *  - Icons, fonts: stale-while-revalidate
 *  - /api/*, /admin/*: never touched (always live, never cached)
 *
 * Bump VERSION when this file's caching logic changes.
 */
const VERSION = "v1";
const PAGES = `pf-pages-${VERSION}`;
const STATIC = `pf-static-${VERSION}`;
const ASSETS = `pf-assets-${VERSION}`;
const OFFLINE_URL = "/offline";
const MAX_PAGES = 40;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(PAGES)
      .then((cache) => cache.addAll([OFFLINE_URL, "/icons/icon-192.png"]))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keep = new Set([PAGES, STATIC, ASSETS]);
      for (const key of await caches.keys()) {
        if (key.startsWith("pf-") && !keep.has(key)) await caches.delete(key);
      }
      if (self.registration.navigationPreload) {
        await self.registration.navigationPreload.enable();
      }
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});

async function trimPages() {
  const cache = await caches.open(PAGES);
  const keys = await cache.keys();
  const extra = keys.filter((req) => new URL(req.url).pathname !== OFFLINE_URL);
  for (let i = 0; i < extra.length - MAX_PAGES; i++) await cache.delete(extra[i]);
}

async function handleNavigation(event) {
  const { request } = event;
  try {
    const preloaded = await event.preloadResponse;
    const response = preloaded || (await fetch(request));
    if (response.ok && response.type === "basic") {
      const copy = response.clone();
      event.waitUntil(
        caches.open(PAGES).then((cache) => cache.put(request, copy)).then(trimPages),
      );
    }
    return response;
  } catch {
    const cache = await caches.open(PAGES);
    return (
      (await cache.match(request, { ignoreSearch: true })) ||
      (await cache.match(OFFLINE_URL)) ||
      new Response("You are offline.", { status: 503, headers: { "Content-Type": "text/plain" } })
    );
  }
}

async function cacheFirst(request, name) {
  const cache = await caches.open(name);
  const hit = await cache.match(request);
  if (hit) return hit;
  const response = await fetch(request);
  if (response.ok) cache.put(request, response.clone());
  return response;
}

async function staleWhileRevalidate(event, name) {
  const cache = await caches.open(name);
  const hit = await cache.match(event.request);
  const network = fetch(event.request)
    .then((response) => {
      if (response.ok) cache.put(event.request, response.clone());
      return response;
    })
    .catch(() => hit);
  if (hit) {
    event.waitUntil(network);
    return hit;
  }
  return network;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/admin")) return;

  if (request.mode === "navigate") {
    event.respondWith(handleNavigation(event));
    return;
  }

  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(request, STATIC));
    return;
  }

  if (
    url.pathname.startsWith("/icons/") ||
    url.pathname === "/logo.jpg" ||
    /\.(?:woff2?|ttf)$/.test(url.pathname)
  ) {
    event.respondWith(staleWhileRevalidate(event, ASSETS));
  }
  // Everything else (RSC payloads, images, uploads) goes straight to the network.
});
