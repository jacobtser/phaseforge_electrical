import { NextResponse } from "next/server";
import { destroySession } from "@/lib/auth";
import { isSameOrigin } from "@/lib/security";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ ok: false, message: "Forbidden." }, { status: 403 });
  }
  await destroySession();
  return NextResponse.json({ ok: true });
}
