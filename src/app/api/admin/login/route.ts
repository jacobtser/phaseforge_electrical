import { NextResponse } from "next/server";
import { createSession, isAuthConfigured, verifyCredentials } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: { username?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request." }, { status: 400 });
  }

  const username = (body.username ?? "").trim();
  const password = body.password ?? "";

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
