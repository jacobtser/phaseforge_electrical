import type { Metadata } from "next";
import Link from "next/link";
import { BoltIcon } from "@/components/Icons";
import { site, waLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "You're offline",
  robots: { index: false, follow: false },
};

/** Shown by the app's service worker when there is no connection. */
export default function OfflinePage() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-4 py-20 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-volt-500/10 text-volt-300 ring-1 ring-volt-400/20">
        <BoltIcon className="h-7 w-7" />
      </span>
      <h1 className="mt-6 font-display text-3xl font-extrabold text-white">No connection</h1>
      <p className="mt-3 text-mist-300">
        Your phone or computer is offline. Pages you opened recently still work. Reconnect to see
        the latest prices and stock.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn btn-md btn-primary">
          Try again
        </Link>
        <a href={`tel:${site.phones[0].tel}`} className="btn btn-md btn-secondary">
          Call {site.phones[0].label}
        </a>
      </div>
      <a
        href={waLink("Hello PhaseForge, I need help.")}
        className="mt-6 text-sm text-mist-400 underline-offset-4 hover:underline"
      >
        WhatsApp us when you&apos;re back online
      </a>
    </div>
  );
}
