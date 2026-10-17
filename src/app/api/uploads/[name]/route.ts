import { promises as fs } from "node:fs";
import { NextResponse } from "next/server";
import { mimeForUpload, resolveUploadPath } from "@/lib/uploads";

export const runtime = "nodejs";

/** Serves photos stored on local disk by the /api/upload fallback backend. */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name } = await params;
  const filePath = resolveUploadPath(name);
  if (!filePath) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const data = await fs.readFile(filePath);
    return new NextResponse(new Uint8Array(data), {
      headers: {
        "Content-Type": mimeForUpload(name),
        "Content-Length": String(data.length),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
