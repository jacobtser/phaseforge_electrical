import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { listSubmissions } from "@/lib/db";

export const runtime = "nodejs";

const HEADERS = [
  "ref",
  "type",
  "status",
  "name",
  "phone",
  "email",
  "serviceCategory",
  "service",
  "propertyType",
  "address",
  "city",
  "latitude",
  "longitude",
  "preferredDate",
  "preferredTime",
  "urgency",
  "budget",
  "referral",
  "details",
  "photos",
  "source",
  "createdAt",
];

function csvCell(value: unknown): string {
  let s = value == null ? "" : String(value);
  // Guard against spreadsheet formula injection when the CSV is opened in Excel.
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""').replace(/\r?\n/g, " ")}"`;
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const rows = await listSubmissions({ limit: 1000 });
  const header = HEADERS.join(",");
  const body = rows
    .map((r) => HEADERS.map((h) => csvCell((r as Record<string, unknown>)[h])).join(","))
    .join("\n");

  const csv = `${header}\n${body}`;
  const stamp = new Date().toISOString().slice(0, 10);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="phaseforge-submissions-${stamp}.csv"`,
    },
  });
}
