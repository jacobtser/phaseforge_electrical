import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { getStats, isPersistent, listSubmissions } from "@/lib/db";
import { Logo } from "@/components/Logo";
import { LogoutButton } from "@/components/LogoutButton";
import { SubmissionsTable } from "@/components/SubmissionsTable";
import { submissionStatuses } from "@/lib/types";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

const statusLabels: Record<string, string> = {
  all: "All",
  new: "New",
  contacted: "Contacted",
  scheduled: "Scheduled",
  in_progress: "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const session = await requireAdmin();
  const sp = await searchParams;
  const status = sp.status && statusLabels[sp.status] ? sp.status : "all";
  const q = (sp.q ?? "").trim();

  const [rows, stats, persistent] = await Promise.all([
    listSubmissions({ status, q }),
    getStats(),
    isPersistent(),
  ]);

  const tabs = ["all", ...submissionStatuses];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Logo />
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-mist-400 sm:inline">
            Signed in as <span className="text-mist-200">{session.user}</span>
          </span>
          <a
            href="/api/admin/export"
            className="rounded-lg border border-white/10 px-3.5 py-2 text-sm font-medium text-mist-100 transition-colors hover:border-volt-400/50"
          >
            Export CSV
          </a>
          <LogoutButton />
        </div>
      </div>

      {!persistent && (
        <p className="mt-6 rounded-xl border border-forge-500/25 bg-forge-500/10 px-4 py-3 text-sm text-forge-200">
          <strong>Heads up:</strong> no <code>DATABASE_URL</code> is set, so submissions are stored in
          a local file and won&apos;t persist on a serverless host. Add a free Neon/Vercel Postgres
          database before going live.
        </p>
      )}

      <h1 className="mt-8 font-display text-2xl font-extrabold text-white sm:text-3xl">
        Service requests
      </h1>

      <div className="mt-5 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {["all", "new", "contacted", "scheduled", "completed", "cancelled"].map((s) => (
          <div key={s} className="rounded-xl border border-white/10 bg-ink-900/60 px-4 py-3">
            <div className="font-display text-2xl font-extrabold text-white">{stats[s] ?? 0}</div>
            <div className="text-xs uppercase tracking-wide text-mist-400">{statusLabels[s]}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        {tabs.map((t) => {
          const active = t === status;
          const href = `/admin?status=${t}${q ? `&q=${encodeURIComponent(q)}` : ""}`;
          return (
            <Link
              key={t}
              href={href}
              className={
                active
                  ? "rounded-lg bg-volt-500/15 px-3 py-1.5 text-sm font-semibold text-volt-300 ring-1 ring-volt-400/30"
                  : "rounded-lg px-3 py-1.5 text-sm text-mist-300 hover:bg-white/5 hover:text-white"
              }
            >
              {statusLabels[t]}
            </Link>
          );
        })}
        <form action="/admin" className="ml-auto flex items-center gap-2">
          <input type="hidden" name="status" value={status} />
          <input
            name="q"
            defaultValue={q}
            placeholder="Search name, phone, ref…"
            className="w-56 rounded-lg border border-white/10 bg-ink-900/70 px-3 py-1.5 text-sm text-white placeholder:text-mist-500 focus:border-volt-400/70 focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-lg border border-white/10 px-3 py-1.5 text-sm font-medium text-mist-100 hover:border-volt-400/50"
          >
            Search
          </button>
        </form>
      </div>

      <div className="mt-5">
        <SubmissionsTable rows={rows} />
      </div>
    </div>
  );
}
