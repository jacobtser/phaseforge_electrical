/* Shared request-hardening helpers for API routes. */

/** Best-effort client IP. On Vercel the first x-forwarded-for hop is the client. */
export function clientIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

/**
 * Sliding-window limiter kept in memory. Each serverless instance keeps its
 * own window, so this throttles bursts rather than giving a global quota.
 */
export function createRateLimiter(windowMs: number, maxPerWindow: number) {
  const hits = new Map<string, number[]>();
  return function rateLimited(key: string): boolean {
    const now = Date.now();
    const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
    recent.push(now);
    hits.set(key, recent);
    if (hits.size > 5000) hits.clear();
    return recent.length > maxPerWindow;
  };
}

/**
 * Rejects cross-site browser requests to state-changing endpoints (CSRF).
 * Browsers always send Origin on POST/PATCH/DELETE fetches, so a request whose
 * Origin names another host was not made by this site. Requests without an
 * Origin header (server-to-server tools) are allowed through; they carry no
 * ambient admin cookie from a victim's browser.
 */
export function isSameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  if (!host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

/** Serialises JSON for a <script type="application/ld+json"> block safely. */
export function jsonLdString(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
