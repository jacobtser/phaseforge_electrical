import { NextResponse } from "next/server";
import { createSession, isAuthConfigured, verifyCredentials } from "@/lib/auth";
import { clientIp, createRateLimiter, isSameOrigin } from "@/lib/security";

export const runtime = "nodejs";

/* Brute-force guard: 10 login attempts per 15 minutes per IP. */
const rateLimited = createRateLimiter(15 * 60_000, 10);

export async function POST(req: Request) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ ok: false, message: "Forbidden." }, { status: 403 });
  }

  if (rateLimited(clientIp(req))) {
    return NextResponse.json(
      { ok: false, message: "Too many login attempts. Please wait 15 minutes and try again." },
      { status: 429 },
    );
  }

  let body: { username?: unknown; password?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request." }, { status: 400 });
  }

  const username = typeof body.username === "string" ? body.username.trim().slice(0, 100) : "";
  const password = typeof body.password === "string" ? body.password.slice(0, 200) : "";

  if (!process.env.ADMIN_PASSWORD || !isAuthConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        message:
          "Admin login is not configured yet. Set ADMIN_PASSWORD and AUTH_SECRET in your environment.",
      },
      { status: 503 },
    );
  }

  if (!username || !password || !verifyCredentials(username, password)) {
    return NextResponse.json({ ok: false, message: "Incorrect username or password." }, { status: 401 });
  }

  await createSession(username);
  return NextResponse.json({ ok: true });
}
