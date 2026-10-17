import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { deleteSubmission, getStats, listSubmissions, updateStatus } from "@/lib/db";
import { submissionStatuses, type SubmissionStatus } from "@/lib/types";

export const runtime = "nodejs";

async function guard() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export async function GET(req: Request) {
  const denied = await guard();
  if (denied) return denied;

  const url = new URL(req.url);
  const status = url.searchParams.get("status") ?? "all";
  const q = url.searchParams.get("q") ?? "";

  const [rows, stats] = await Promise.all([listSubmissions({ status, q }), getStats()]);
  return NextResponse.json({ ok: true, rows, stats });
}

export async function PATCH(req: Request) {
  const denied = await guard();
  if (denied) return denied;

  const body = (await req.json().catch(() => ({}))) as { id?: string; status?: string };
  if (!body.id || !body.status || !submissionStatuses.includes(body.status as SubmissionStatus)) {
    return NextResponse.json({ ok: false, message: "Invalid payload" }, { status: 400 });
  }
  const updated = await updateStatus(body.id, body.status as SubmissionStatus);
  if (!updated) {
    return NextResponse.json({ ok: false, message: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, row: updated });
}

export async function DELETE(req: Request) {
  const denied = await guard();
  if (denied) return denied;

  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ ok: false, message: "Missing id" }, { status: 400 });
  const done = await deleteSubmission(id);
  return NextResponse.json({ ok: done });
}
