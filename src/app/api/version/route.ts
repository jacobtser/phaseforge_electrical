import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Identifies the deploy that is currently live. The installed app polls this
 * when it is reopened and reloads itself when the value changes.
 */
export function GET() {
  const version =
    process.env.VERCEL_DEPLOYMENT_ID ||
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.NEXT_BUILD_ID ||
    "local";
  return NextResponse.json({ version }, { headers: { "Cache-Control": "no-store, max-age=0" } });
}
