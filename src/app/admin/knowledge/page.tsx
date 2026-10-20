import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { LogoutButton } from "@/components/LogoutButton";
import { KnowledgeManager } from "@/components/KnowledgeManager";
import { requireAdmin } from "@/lib/auth";
import { isPersistent, listKnowledgeEntries, listKnowledgeGaps } from "@/lib/db";
import { builtInKnowledge } from "@/lib/knowledge";

export const metadata: Metadata = {
  title: "Assistant knowledge",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminKnowledgePage() {
  const session = await requireAdmin();
  const [entries, gaps, persistent] = await Promise.all([
    listKnowledgeEntries(),
    listKnowledgeGaps("open"),
    isPersistent(),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Logo />
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-mist-400 sm:inline">
            Signed in as <span className="text-mist-200">{session.user}</span>
          </span>
          <Link
            href="/admin"
            className="rounded-lg border border-white/10 px-3.5 py-2 text-sm font-medium text-mist-100 transition-colors hover:border-volt-400/50"
          >
            Service requests
          </Link>
          <Link
            href="/admin/orders"
            className="rounded-lg border border-white/10 px-3.5 py-2 text-sm font-medium text-mist-100 transition-colors hover:border-volt-400/50"
          >
            Shop orders
          </Link>
          <LogoutButton />
        </div>
      </div>

      <div className="mt-8">
        <h1 className="font-display text-2xl font-extrabold text-white sm:text-3xl">
          Assistant knowledge
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-mist-400">
          The assistant answers from the catalogue, the built-in business facts and the
          answers below. When it is unsure, the customer&apos;s question lands in the
          learning queue. Answer it once and every future customer benefits.
        </p>
      </div>

      <KnowledgeManager
        entries={entries}
        gaps={gaps}
        persistent={persistent}
        builtInCount={builtInKnowledge.length}
      />
    </div>
  );
}
