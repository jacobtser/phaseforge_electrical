import Link from "next/link";
import { ArrowRightIcon, BoltIcon } from "@/components/Icons";
import { site } from "@/lib/site";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-4 py-20 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-volt-500/10 text-volt-300 ring-1 ring-volt-400/20">
        <BoltIcon className="h-7 w-7" />
      </span>
      <h1 className="mt-6 font-display text-4xl font-extrabold text-white">Circuit not found</h1>
      <p className="mt-3 text-mist-300">
        That page has tripped. Let&apos;s get you back to something that works.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-volt-400 to-volt-600 px-6 py-3 font-bold text-ink-950 transition-transform hover:-translate-y-0.5"
        >
          Back home <ArrowRightIcon className="h-4 w-4" />
        </Link>
        <Link
          href="/book"
          className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-6 py-3 font-semibold text-white transition-colors hover:border-volt-400/60"
        >
          Book a visit
        </Link>
      </div>
      <p className="mt-8 text-sm text-mist-500">
        Or call {site.phones[0].label}
      </p>
    </div>
  );
}
