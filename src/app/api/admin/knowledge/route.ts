import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import {
  answerKnowledgeGap,
  createKnowledgeEntry,
  deleteKnowledgeEntry,
  dismissKnowledgeGap,
  updateKnowledgeEntry,
} from "@/lib/db";
import { firstError } from "@/lib/validation";

export const runtime = "nodejs";

async function guard() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }
  return null;
}

const keywordValue = z.union([z.string().max(1200), z.array(z.string().max(80)).max(24)]).optional();

const createSchema = z.object({
  question: z.string().trim().min(5, "Question must be at least 5 characters.").max(500),
  answer: z.string().trim().min(10, "Answer must be at least 10 characters.").max(4000),
  keywords: keywordValue,
});

const updateSchema = z.object({
  id: z.string().trim().min(1).max(100),
  question: z.string().trim().min(5).max(500).optional(),
  answer: z.string().trim().min(10).max(4000).optional(),
  keywords: keywordValue,
});

const gapSchema = z.object({
  gapId: z.string().trim().min(1).max(100),
  answer: z.string().trim().min(10, "Answer must be at least 10 characters.").max(4000).optional(),
  keywords: keywordValue,
  dismiss: z.boolean().optional(),
});

function parseKeywords(value: string | string[] | undefined): string[] | undefined {
  if (value === undefined) return undefined;
  const list = Array.isArray(value) ? value : value.split(",");
  return list.map((keyword) => keyword.trim()).filter(Boolean).slice(0, 24);
}

export async function POST(req: Request) {
  const denied = await guard();
  if (denied) return denied;

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: firstError(parsed.error.issues) },
      { status: 422 },
    );
  }

  const entry = await createKnowledgeEntry({
    question: parsed.data.question,
    answer: parsed.data.answer,
    keywords: parseKeywords(parsed.data.keywords),
  });
  return NextResponse.json({ ok: true, entry });
}

export async function PATCH(req: Request) {
  const denied = await guard();
  if (denied) return denied;

  const body = await req.json().catch(() => null);
  if (body && typeof body === "object" && "gapId" in body) {
    const parsed = gapSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, message: firstError(parsed.error.issues) },
        { status: 422 },
      );
    }

    if (parsed.data.dismiss) {
      const done = await dismissKnowledgeGap(parsed.data.gapId);
      return NextResponse.json({ ok: done });
    }

    if (!parsed.data.answer) {
      return NextResponse.json(
        { ok: false, message: "An answer is required." },
        { status: 422 },
      );
    }

    const entry = await answerKnowledgeGap(
      parsed.data.gapId,
      parsed.data.answer,
      parseKeywords(parsed.data.keywords),
    );
    if (!entry) {
      return NextResponse.json({ ok: false, message: "Question not found." }, { status: 404 });
    }
    return NextResponse.json({ ok: true, entry });
  }

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: firstError(parsed.error.issues) },
      { status: 422 },
    );
  }

  const entry = await updateKnowledgeEntry(parsed.data.id, {
    question: parsed.data.question,
    answer: parsed.data.answer,
    keywords: parseKeywords(parsed.data.keywords),
  });
  if (!entry) {
    return NextResponse.json({ ok: false, message: "Entry not found." }, { status: 404 });
  }
  return NextResponse.json({ ok: true, entry });
}

export async function DELETE(req: Request) {
  const denied = await guard();
  if (denied) return denied;

  const id = new URL(req.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ ok: false, message: "Missing id." }, { status: 400 });
  }
  const done = await deleteKnowledgeEntry(id);
  return NextResponse.json({ ok: done });
}
