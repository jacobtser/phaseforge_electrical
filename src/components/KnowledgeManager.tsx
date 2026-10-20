"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { KnowledgeGapRecord, KnowledgeRecord } from "@/lib/types";

type Props = {
  entries: KnowledgeRecord[];
  gaps: KnowledgeGapRecord[];
  persistent: boolean;
  builtInCount: number;
};

type Notice = { kind: "ok" | "error"; text: string } | null;

function SplitForm({
  gap,
  onDone,
}: {
  gap: KnowledgeGapRecord;
  onDone: () => void;
}) {
  const [answer, setAnswer] = useState("");
  const [keywords, setKeywords] = useState("");
  const [busy, setBusy] = useState<"save" | "dismiss" | null>(null);
  const [notice, setNotice] = useState<Notice>(null);

  async function save() {
    if (answer.trim().length < 10) {
      setNotice({ kind: "error", text: "Write at least a short answer." });
      return;
    }
    setBusy("save");
    setNotice(null);
    try {
      const res = await fetch("/api/admin/knowledge", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gapId: gap.id,
          answer: answer.trim(),
          keywords: keywords.trim(),
        }),
      });
      const data = (await res.json().catch(() => null)) as {
        ok?: boolean;
        message?: string;
      } | null;
      if (!res.ok || !data?.ok) {
        setNotice({ kind: "error", text: data?.message ?? "Could not save." });
        return;
      }
      setNotice({ kind: "ok", text: "Saved. The assistant can use this now." });
      setAnswer("");
      setKeywords("");
      onDone();
    } catch {
      setNotice({ kind: "error", text: "Network error. Please try again." });
    } finally {
      setBusy(null);
    }
  }

  async function dismiss() {
    setBusy("dismiss");
    setNotice(null);
    try {
      const res = await fetch("/api/admin/knowledge", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gapId: gap.id, dismiss: true }),
      });
      const data = (await res.json().catch(() => null)) as { ok?: boolean } | null;
      if (!res.ok || !data?.ok) {
        setNotice({ kind: "error", text: "Could not dismiss." });
        return;
      }
      onDone();
    } catch {
      setNotice({ kind: "error", text: "Network error. Please try again." });
    } finally {
      setBusy(null);
    }
  }

  return (
    <details className="group rounded-2xl border border-white/10 bg-ink-900/60 open:border-white/20">
      <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-3 p-4 [&::-webkit-details-marker]:hidden">
        <div className="min-w-0">
          <p className="font-semibold text-white">{gap.question}</p>
          <p className="mt-1 text-xs text-mist-400">
            Asked {gap.count} {gap.count === 1 ? "time" : "times"} · last{" "}
            {new Date(gap.lastSeenAt).toLocaleString("en-GH", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        </div>
        <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-300 ring-1 ring-amber-400/30">
          Needs answer
        </span>
      </summary>

      <div className="border-t border-white/10 p-4">
        <label className="block text-xs font-semibold uppercase tracking-wider text-mist-400">
          Answer for the assistant
        </label>
        <textarea
          value={answer}
          onChange={(event) => setAnswer(event.target.value)}
          rows={4}
          maxLength={4000}
          placeholder="Write the answer in the same friendly tone the assistant should use."
          className="mt-2 w-full rounded-xl border border-white/10 bg-ink-950/70 px-3 py-2.5 text-sm text-white outline-none placeholder:text-mist-500 focus:border-volt-400/60"
        />
        <label className="mt-3 block text-xs font-semibold uppercase tracking-wider text-mist-400">
          Extra search words (optional)
        </label>
        <input
          value={keywords}
          onChange={(event) => setKeywords(event.target.value)}
          maxLength={1200}
          placeholder="e.g. warranty, guarantee, faulty, refund"
          className="mt-2 w-full rounded-xl border border-white/10 bg-ink-950/70 px-3 py-2.5 text-sm text-white outline-none placeholder:text-mist-500 focus:border-volt-400/60"
        />
        {notice && (
          <p
            className={
              notice.kind === "ok"
                ? "mt-3 text-sm text-emerald-300"
                : "mt-3 text-sm text-red-300"
            }
          >
            {notice.text}
          </p>
        )}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => void save()}
            disabled={busy !== null}
            className="rounded-lg bg-gradient-to-br from-volt-400 to-volt-600 px-4 py-2 text-sm font-bold text-ink-950 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy === "save" ? "Saving…" : "Save answer"}
          </button>
          <button
            type="button"
            onClick={() => void dismiss()}
            disabled={busy !== null}
            className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-mist-200 transition-colors hover:border-red-400/40 hover:text-red-200 disabled:opacity-50"
          >
            {busy === "dismiss" ? "Dismissing…" : "Dismiss"}
          </button>
        </div>
      </div>
    </details>
  );
}

function AddEntryForm({ onDone }: { onDone: () => void }) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [keywords, setKeywords] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);

  async function save() {
    if (question.trim().length < 5 || answer.trim().length < 10) {
      setNotice({
        kind: "error",
        text: "Add a question and an answer before saving.",
      });
      return;
    }
    setBusy(true);
    setNotice(null);
    try {
      const res = await fetch("/api/admin/knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: question.trim(),
          answer: answer.trim(),
          keywords: keywords.trim(),
        }),
      });
      const data = (await res.json().catch(() => null)) as {
        ok?: boolean;
        message?: string;
      } | null;
      if (!res.ok || !data?.ok) {
        setNotice({ kind: "error", text: data?.message ?? "Could not save." });
        return;
      }
      setQuestion("");
      setAnswer("");
      setKeywords("");
      setNotice({ kind: "ok", text: "Added to the assistant's knowledge." });
      onDone();
    } catch {
      setNotice({ kind: "error", text: "Network error. Please try again." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-ink-900/60 p-5">
      <h2 className="font-display text-lg font-bold text-white">Add a fact or answer</h2>
      <p className="mt-1 text-sm text-mist-400">
        Use this for a policy, a product explanation, or any question the team keeps
        answering by hand. The assistant searches these answers automatically.
      </p>
      <div className="mt-4 grid gap-3">
        <input
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          maxLength={500}
          placeholder="Question, e.g. Do you offer a workmanship guarantee?"
          className="w-full rounded-xl border border-white/10 bg-ink-950/70 px-3 py-2.5 text-sm text-white outline-none placeholder:text-mist-500 focus:border-volt-400/60"
        />
        <textarea
          value={answer}
          onChange={(event) => setAnswer(event.target.value)}
          rows={4}
          maxLength={4000}
          placeholder="Answer the assistant should give…"
          className="w-full rounded-xl border border-white/10 bg-ink-950/70 px-3 py-2.5 text-sm text-white outline-none placeholder:text-mist-500 focus:border-volt-400/60"
        />
        <input
          value={keywords}
          onChange={(event) => setKeywords(event.target.value)}
          maxLength={1200}
          placeholder="Extra search words (optional), comma separated"
          className="w-full rounded-xl border border-white/10 bg-ink-950/70 px-3 py-2.5 text-sm text-white outline-none placeholder:text-mist-500 focus:border-volt-400/60"
        />
      </div>
      {notice && (
        <p
          className={
            notice.kind === "ok" ? "mt-3 text-sm text-emerald-300" : "mt-3 text-sm text-red-300"
          }
        >
          {notice.text}
        </p>
      )}
      <button
        type="button"
        onClick={() => void save()}
        disabled={busy}
        className="mt-4 rounded-lg bg-gradient-to-br from-volt-400 to-volt-600 px-4 py-2 text-sm font-bold text-ink-950 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {busy ? "Saving…" : "Add to knowledge"}
      </button>
    </div>
  );
}

export function KnowledgeManager({ entries, gaps, persistent, builtInCount }: Props) {
  const router = useRouter();
  const [notice, setNotice] = useState<Notice>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function removeEntry(entry: KnowledgeRecord) {
    if (!window.confirm(`Delete the learned answer for “${entry.question}”?`)) return;
    setDeleting(entry.id);
    setNotice(null);
    try {
      const res = await fetch(
        `/api/admin/knowledge?id=${encodeURIComponent(entry.id)}`,
        { method: "DELETE" },
      );
      const data = (await res.json().catch(() => null)) as { ok?: boolean } | null;
      if (!res.ok || !data?.ok) {
        setNotice({ kind: "error", text: "Could not delete that entry." });
        return;
      }
      router.refresh();
    } catch {
      setNotice({ kind: "error", text: "Network error. Please try again." });
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="mt-8 space-y-8">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-ink-900/60 px-4 py-3">
          <div className="font-display text-2xl font-extrabold text-white">{gaps.length}</div>
          <div className="text-xs uppercase tracking-wide text-mist-400">
            Questions waiting
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-ink-900/60 px-4 py-3">
          <div className="font-display text-2xl font-extrabold text-white">{entries.length}</div>
          <div className="text-xs uppercase tracking-wide text-mist-400">Learned answers</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-ink-900/60 px-4 py-3">
          <div className="font-display text-2xl font-extrabold text-white">{builtInCount}</div>
          <div className="text-xs uppercase tracking-wide text-mist-400">Built-in facts</div>
        </div>
      </div>

      {!persistent && (
        <p className="rounded-xl border border-forge-500/25 bg-forge-500/10 px-4 py-3 text-sm text-forge-200">
          <strong>Heads up:</strong> no <code>DATABASE_URL</code> is set. In production,
          learned answers need Postgres to survive a redeploy. The built-in facts still work.
        </p>
      )}

      {notice && (
        <p
          className={
            notice.kind === "ok" ? "text-sm text-emerald-300" : "text-sm text-red-300"
          }
        >
          {notice.text}
        </p>
      )}

      <section>
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="font-display text-xl font-bold text-white">Learning queue</h2>
            <p className="mt-1 text-sm text-mist-400">
              Questions the assistant could not answer, or that a customer marked “not
              quite”. Answer one and it becomes searchable immediately.
            </p>
          </div>
        </div>

        {gaps.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-white/15 bg-ink-900/40 p-8 text-center text-sm text-mist-400">
            Nothing waiting. The assistant has an answer for every question it has seen
            so far.
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {gaps.map((gap) => (
              <SplitForm key={gap.id} gap={gap} onDone={() => router.refresh()} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="font-display text-xl font-bold text-white">Learned answers</h2>
        <p className="mt-1 text-sm text-mist-400">
          These are added to the assistant&apos;s retrieval pool on every request.
        </p>
        {entries.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-white/15 bg-ink-900/40 p-8 text-center text-sm text-mist-400">
            No learned answers yet. The built-in catalogue and business facts are still
            active.
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {entries.map((entry) => (
              <details
                key={entry.id}
                className="group rounded-2xl border border-white/10 bg-ink-900/60 open:border-white/20"
              >
                <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-3 p-4 [&::-webkit-details-marker]:hidden">
                  <div className="min-w-0">
                    <p className="font-semibold text-white">{entry.question}</p>
                    <p className="mt-1 text-xs text-mist-400">
                      Updated{" "}
                      {new Date(entry.updatedAt).toLocaleString("en-GH", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-300 ring-1 ring-emerald-400/30">
                    Learned
                  </span>
                </summary>
                <div className="border-t border-white/10 p-4">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-mist-200">
                    {entry.answer}
                  </p>
                  {entry.keywords.length > 0 && (
                    <p className="mt-3 text-xs text-mist-500">
                      Search words: {entry.keywords.join(", ")}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => void removeEntry(entry)}
                    disabled={deleting === entry.id}
                    className="mt-4 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-mist-300 transition-colors hover:border-red-400/40 hover:text-red-200 disabled:opacity-50"
                  >
                    {deleting === entry.id ? "Deleting…" : "Delete"}
                  </button>
                </div>
              </details>
            ))}
          </div>
        )}
      </section>

      <AddEntryForm onDone={() => router.refresh()} />
    </div>
  );
}
