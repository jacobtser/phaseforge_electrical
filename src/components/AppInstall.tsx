"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { CloseIcon } from "@/components/Icons";

/* -------------------------------------------------------------------------- */
/* Installable app support                                                    */
/*                                                                            */
/*  1. Registers /sw.js (pages always come from the live site).               */
/*  2. Keeps the installed app current: when it is reopened and a new deploy  */
/*     is live, it reloads itself.                                            */
/*  3. Shows an install popup with the right steps for each device:           */
/*       - Chrome / Edge / Samsung / Opera (Android, Windows, macOS, Linux,   */
/*         ChromeOS): one-tap Install via the browser's native prompt         */
/*       - iPhone / iPad (Safari, Chrome, Edge): Share → Add to Home Screen   */
/*       - Safari on Mac: File → Add to Dock                                  */
/*       - Firefox on Android: menu → Install                                 */
/*       - Browsers that can't install: "open in Chrome, Edge or Safari"      */
/* -------------------------------------------------------------------------- */

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

type Platform =
  | "native" // browser gave us a beforeinstallprompt event
  | "ios"
  | "ios-inapp"
  | "mac-safari"
  | "firefox-android"
  | "unsupported";

const DISMISS_KEY = "pf-install-dismissed";
const VISITS_KEY = "pf-visits";
const DISMISS_DAYS = 7;
const SHOW_AFTER_MS = 12_000;
/** Pages where a popup would interrupt something important. */
const QUIET_PATHS = ["/admin", "/cart", "/payment", "/book"];

/** Lets any button on the site open the install popup. */
export function openInstallPopup() {
  window.dispatchEvent(new Event("pf:install"));
}

function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: window-controls-overlay)").matches ||
    window.matchMedia("(display-mode: minimal-ui)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function detectPlatform(hasNative: boolean): Platform {
  if (hasNative) return "native";
  const ua = navigator.userAgent;
  const iOS =
    /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  if (iOS) {
    return /FBAN|FBAV|Instagram|Line\/|Snapchat|TikTok|musical_ly/i.test(ua) ? "ios-inapp" : "ios";
  }
  const isFirefox = /Firefox|FxiOS/.test(ua);
  if (isFirefox && /Android/.test(ua)) return "firefox-android";
  const isSafari = /Safari/.test(ua) && !/Chrome|Chromium|CriOS|Edg|OPR|Firefox/.test(ua);
  if (isSafari && /Macintosh/.test(ua)) return "mac-safari";
  return "unsupported";
}

function recentlyDismissed(): boolean {
  try {
    const at = Number(localStorage.getItem(DISMISS_KEY) || 0);
    return Date.now() - at < DISMISS_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

/* --------------------------- Keeping the app fresh ------------------------- */

function useServiceWorkerAndUpdates() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    // Service workers need HTTPS (localhost is allowed for testing).
    if (location.protocol !== "https:" && location.hostname !== "localhost") return;

    let registration: ServiceWorkerRegistration | undefined;
    let baseline: string | null = null;
    let hiddenAt = 0;
    let cancelled = false;

    navigator.serviceWorker
      .register("/sw.js", { scope: "/", updateViaCache: "none" })
      .then((reg) => {
        registration = reg;
      })
      .catch((err) => console.warn("[app] service worker registration failed", err));

    const fetchVersion = async (): Promise<string | null> => {
      try {
        const res = await fetch("/api/version", { cache: "no-store" });
        if (!res.ok) return null;
        const data = (await res.json()) as { version?: string };
        return data.version ?? null;
      } catch {
        return null; // offline
      }
    };

    fetchVersion().then((v) => {
      if (!cancelled) baseline = v;
    });

    const checkForUpdate = async () => {
      registration?.update().catch(() => {});
      const latest = await fetchVersion();
      if (!latest || !baseline || latest === baseline) return;
      baseline = latest;
      // A new version is live. Reload when the user is coming back to the app
      // (not while they are typing), so they see it straight away.
      const typing =
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement;
      if (!typing) location.reload();
    };

    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        hiddenAt = Date.now();
      } else if (hiddenAt && Date.now() - hiddenAt > 15_000) {
        void checkForUpdate();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") void checkForUpdate();
    }, 30 * 60 * 1000);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisibility);
      window.clearInterval(timer);
    };
  }, []);
}

/* ------------------------------- Install popup ----------------------------- */

/* Install state lives outside React: the browser fires these events whenever it
   likes, and several components (popup, footer button) read the same state. */

type WindowWithPrompt = Window & { __pfInstallPrompt?: BeforeInstallPromptEvent | null };

let installedThisSession = false;
const storeListeners = new Set<() => void>();

function promptEvent(): BeforeInstallPromptEvent | null {
  return (window as WindowWithPrompt).__pfInstallPrompt ?? null;
}

function notify() {
  storeListeners.forEach((fn) => fn());
}

function subscribeInstallState(onChange: () => void) {
  storeListeners.add(onChange);
  const onPrompt = (e: Event) => {
    e.preventDefault(); // we show our own popup instead of the mini-infobar
    (window as WindowWithPrompt).__pfInstallPrompt = e as BeforeInstallPromptEvent;
    notify();
  };
  const onInstalled = () => {
    installedThisSession = true;
    (window as WindowWithPrompt).__pfInstallPrompt = null;
    notify();
  };
  const modes = ["standalone", "window-controls-overlay", "minimal-ui"].map((m) =>
    window.matchMedia(`(display-mode: ${m})`),
  );
  window.addEventListener("beforeinstallprompt", onPrompt);
  window.addEventListener("appinstalled", onInstalled);
  modes.forEach((mq) => mq.addEventListener("change", onChange));
  return () => {
    storeListeners.delete(onChange);
    window.removeEventListener("beforeinstallprompt", onPrompt);
    window.removeEventListener("appinstalled", onInstalled);
    modes.forEach((mq) => mq.removeEventListener("change", onChange));
  };
}

/** "installed", or how this browser can install the app. null while server-rendering. */
function installSnapshot(): Platform | "installed" {
  if (installedThisSession || isStandalone()) return "installed";
  return detectPlatform(promptEvent() !== null);
}

function useInstallState(): Platform | "installed" | null {
  return useSyncExternalStore(subscribeInstallState, installSnapshot, () => null);
}

export function AppInstall() {
  useServiceWorkerAndUpdates();

  const pathname = usePathname();
  const state = useInstallState();
  const [open, setOpen] = useState(false);

  const installed = state === "installed";
  const platform: Platform | null = state === "installed" ? null : state;
  const quiet = QUIET_PATHS.some((p) => pathname?.startsWith(p));

  // Footer "Install the app" button.
  useEffect(() => {
    const onRequest = () => setOpen(true);
    window.addEventListener("pf:install", onRequest);
    return () => window.removeEventListener("pf:install", onRequest);
  }, []);

  // Auto-show once per week, after the visitor has had a look around.
  useEffect(() => {
    if (installed || quiet || !platform || platform === "unsupported" || platform === "ios-inapp") {
      return;
    }
    if (recentlyDismissed()) return;

    let visits = 1;
    try {
      visits = Number(sessionStorage.getItem(VISITS_KEY) || 0) + 1;
      sessionStorage.setItem(VISITS_KEY, String(visits));
    } catch {
      /* private mode */
    }
    const delay = visits >= 2 ? 2_500 : SHOW_AFTER_MS;
    const t = window.setTimeout(() => setOpen(true), delay);
    return () => window.clearTimeout(t);
  }, [installed, quiet, platform, pathname]);

  const dismiss = useCallback(() => {
    setOpen(false);
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      /* ignore */
    }
  }, []);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && dismiss();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, dismiss]);

  const install = async () => {
    const prompt = promptEvent();
    if (!prompt) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    (window as WindowWithPrompt).__pfInstallPrompt = null; // a prompt can only be used once
    if (outcome === "accepted") {
      installedThisSession = true;
      notify();
      setOpen(false);
    } else {
      dismiss();
    }
  };

  if (installed || !open || !platform) return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="pf-install-title"
      className="fixed inset-x-3 bottom-3 z-[70] sm:inset-x-auto sm:bottom-6 sm:left-6 sm:w-[23rem]"
    >
      <div className="relative overflow-hidden rounded-2xl border border-volt-400/25 bg-ink-900/95 p-5 shadow-2xl shadow-black/60 backdrop-blur">
        <button
          type="button"
          onClick={dismiss}
          aria-label="Not now"
          className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-lg text-mist-400 transition-colors hover:bg-white/5 hover:text-white"
        >
          <CloseIcon className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-3 pr-8">
          {/* eslint-disable-next-line @next/next/no-img-element -- tiny static app icon */}
          <img src="/icons/icon-192.png" alt="" width={48} height={48} className="h-12 w-12 rounded-xl" />
          <div>
            <h2 id="pf-install-title" className="text-base font-bold text-white">
              Get the PhaseForge app
            </h2>
            <p className="text-xs text-mist-400">Free · no app store · always up to date</p>
          </div>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-mist-300">
          Shop materials, book a visit and reach us on WhatsApp in one tap, straight from your home
          screen or desktop.
        </p>

        <InstallSteps platform={platform} onInstall={install} onClose={dismiss} />
      </div>
    </div>
  );
}

function ShareGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className="inline h-4 w-4 -translate-y-px">
      <path d="M12 3v12M8 7l4-4 4 4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 11H5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-1" strokeLinecap="round" />
    </svg>
  );
}

function Steps({ children }: { children: React.ReactNode }) {
  return (
    <ol className="mt-4 list-decimal space-y-1.5 rounded-xl bg-white/5 p-3 pl-8 text-sm text-mist-200">
      {children}
    </ol>
  );
}

function InstallSteps({
  platform,
  onInstall,
  onClose,
}: {
  platform: Platform;
  onInstall: () => void;
  onClose: () => void;
}) {
  if (platform === "native") {
    return (
      <div className="mt-4 flex gap-2">
        <button type="button" onClick={onInstall} className="btn btn-sm btn-primary flex-1">
          Install app
        </button>
        <button type="button" onClick={onClose} className="btn btn-sm btn-secondary">
          Not now
        </button>
      </div>
    );
  }

  if (platform === "ios") {
    return (
      <Steps>
        <li>
          Tap the <strong>Share</strong> button <ShareGlyph /> (bottom of the screen on iPhone, top
          on iPad).
        </li>
        <li>
          Scroll and tap <strong>Add to Home Screen</strong>.
        </li>
        <li>
          Tap <strong>Add</strong>. The PhaseForge icon appears on your home screen.
        </li>
      </Steps>
    );
  }

  if (platform === "ios-inapp") {
    return (
      <Steps>
        <li>
          Tap <strong>⋯</strong> and choose <strong>Open in Safari</strong>.
        </li>
        <li>
          In Safari, tap <strong>Share</strong> <ShareGlyph /> → <strong>Add to Home Screen</strong>.
        </li>
      </Steps>
    );
  }

  if (platform === "mac-safari") {
    return (
      <Steps>
        <li>
          In the menu bar, click <strong>File</strong> → <strong>Add to Dock</strong>.
        </li>
        <li>
          Click <strong>Add</strong>. PhaseForge opens like any other Mac app.
        </li>
      </Steps>
    );
  }

  if (platform === "firefox-android") {
    return (
      <Steps>
        <li>
          Tap the <strong>⋮</strong> menu.
        </li>
        <li>
          Tap <strong>Install</strong> (or <strong>Add to Home screen</strong>).
        </li>
      </Steps>
    );
  }

  return (
    <p className="mt-4 rounded-xl bg-white/5 p-3 text-sm text-mist-200">
      This browser can&apos;t install apps. Open this page in <strong>Chrome</strong>,{" "}
      <strong>Edge</strong> or <strong>Safari</strong> and choose <strong>Install</strong> /{" "}
      <strong>Add to Home Screen</strong>.
    </p>
  );
}

/** Footer link that opens the install popup; hidden inside the installed app. */
export function InstallAppButton({ className }: { className?: string }) {
  const state = useInstallState();
  if (state === null || state === "installed") return null;
  return (
    <button type="button" onClick={openInstallPopup} className={className}>
      Install the app
    </button>
  );
}
