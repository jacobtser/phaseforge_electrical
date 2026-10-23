"use client";

import clsx from "clsx";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRightIcon,
  CloseIcon,
  SparkIcon,
  WhatsAppIcon,
} from "@/components/Icons";
import { site, waLink } from "@/lib/site";

type Message = { role: "user" | "assistant"; content: string };

const INITIAL_MESSAGE: Message = {
  role: "assistant",
  content: `Hi, I'm the ${site.shortName} AI assistant. Ask me about products, prices, delivery, payments or booking an electrician. Our team reviews anything I can't answer. For an urgent fault, call ${site.phones[0].label}.`,
};

const SUGGESTIONS = [
  "How much are MCBs?",
  "Who owns PhaseForge?",
  "What solar backup do I need?",
  "Do you deliver to Tema?",
  "I need an electrician",
];

const MAX_HISTORY = 12;

function cleanReply(value: string): string {
  return value
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      (_match: string, label: string, href: string) =>
        label.trim() === href.trim() ? href.trim() : `${label.trim()} (${href.trim()})`,
    )
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^\s*[*-]\s+/gm, "• ")
    .trim();
}

export function SupportChat() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState<
    Record<number, "sending" | "sent" | "error">
  >({});
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, loading, open, error]);

  if (pathname.startsWith("/admin")) return null;

  async function sendMessage(textOverride?: string) {
    const text = (textOverride ?? input).trim();
    if (!text || loading) return;

    const userMessage: Message = { role: "user", content: text };
    const nextMessages = [...messages, userMessage].slice(-MAX_HISTORY);

    setMessages(nextMessages);
    setInput("");
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages, page: pathname }),
      });

      const data = (await res.json().catch(() => null)) as {
        ok?: boolean;
        reply?: string;
        message?: string;
      } | null;

      if (!res.ok || !data?.ok || typeof data.reply !== "string") {
        setError(
          data?.message ??
            "I couldn't get an answer just now. Please try again or message us on WhatsApp.",
        );
        return;
      }

      setMessages((current) => [
        ...current,
        { role: "assistant", content: cleanReply(data.reply as string) },
      ]);
    } catch {
      setError("Network error. Please try again or message us on WhatsApp.");
    } finally {
      setLoading(false);
    }
  }

  async function sendFeedback(index: number, answer: string, helpful: boolean) {
    if (feedback[index] === "sending" || feedback[index] === "sent") return;

    let question = "";
    for (let i = index - 1; i >= 0; i--) {
      if (messages[i]?.role === "user") {
        question = messages[i].content;
        break;
      }
    }
    if (!question) return;

    setFeedback((current) => ({ ...current, [index]: "sending" }));
    try {
      const res = await fetch("/api/assistant/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, answer, helpful, page: pathname }),
      });
      setFeedback((current) => ({
        ...current,
        [index]: res.ok ? "sent" : "error",
      }));
    } catch {
      setFeedback((current) => ({ ...current, [index]: "error" }));
    }
  }

  const helpHref = waLink(
    `Hello ${site.shortName}, I was chatting with your AI assistant and need help from a person.`,
  );

  return (
    <>
      {open && (
        <div
          id="pf-assistant-panel"
          role="dialog"
          aria-label="PhaseForge AI assistant"
          className="fixed bottom-24 right-4 z-[70] flex h-[min(72dvh,560px)] w-[calc(100vw-2rem)] max-w-[390px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-ink-900 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.95)] sm:right-5"
        >
          <header className="flex items-start justify-between gap-3 border-b border-white/10 bg-ink-950/85 p-4">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-volt-500/15 text-volt-300 ring-1 ring-volt-400/25">
                <SparkIcon className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-bold text-white">{site.shortName} Assistant</p>
                <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Online · AI support
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close AI assistant"
              className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-mist-400 transition-colors hover:bg-white/5 hover:text-white"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          </header>

          <div
            ref={scrollRef}
            aria-live="polite"
            aria-busy={loading}
            className="flex-1 space-y-3 overflow-y-auto p-4"
          >
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={clsx(
                  "flex flex-col",
                  message.role === "user" ? "items-end" : "items-start",
                )}
              >
                <div
                  className={clsx(
                    "max-w-[86%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed",
                    message.role === "user"
                      ? "rounded-br-md bg-gradient-to-br from-volt-400 to-volt-600 font-medium text-ink-950"
                      : "rounded-bl-md border border-white/10 bg-white/5 text-mist-100",
                  )}
                >
                  {message.content}
                </div>

                {message.role === "assistant" && index > 0 && (
                  <div className="mt-1 flex min-h-[18px] flex-wrap items-center gap-2 pl-1 text-[10px] text-mist-500">
                    {feedback[index] === "sent" ? (
                      <span>Thanks — noted.</span>
                    ) : feedback[index] === "sending" ? (
                      <span>Saving…</span>
                    ) : (
                      <>
                        <span>Helpful?</span>
                        <button
                          type="button"
                          onClick={() => void sendFeedback(index, message.content, true)}
                          className="font-semibold text-mist-300 transition-colors hover:text-volt-300"
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          onClick={() => void sendFeedback(index, message.content, false)}
                          className="font-semibold text-mist-300 transition-colors hover:text-volt-300"
                        >
                          Not quite
                        </button>
                      </>
                    )}
                    {feedback[index] === "error" && (
                      <span className="text-red-300">Couldn&apos;t save that.</span>
                    )}
                  </div>
                )}
              </div>
            ))}

            {messages.length === 1 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => void sendMessage(suggestion)}
                    className="rounded-full border border-white/10 bg-ink-950/60 px-3 py-1.5 text-left text-[11px] font-medium text-mist-200 transition-colors hover:border-volt-400/50 hover:text-white"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-white/10 bg-white/5 px-4 py-3">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-mist-300 [animation-delay:-200ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-mist-300 [animation-delay:-100ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-mist-300" />
                  <span className="sr-only">Assistant is typing</span>
                </div>
              </div>
            )}

            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-400/25 bg-red-500/10 p-3 text-xs leading-relaxed text-red-200"
              >
                <p>{error}</p>
                <a
                  href={helpHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1.5 font-bold text-red-100 underline underline-offset-2"
                >
                  <WhatsAppIcon className="h-3.5 w-3.5" /> Continue on WhatsApp
                </a>
              </div>
            )}
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              void sendMessage();
            }}
            className="border-t border-white/10 bg-ink-950/85 p-3"
          >
            <div className="flex items-end gap-2 rounded-xl border border-white/10 bg-ink-900 px-3 py-2 transition-colors focus-within:border-volt-400/60">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void sendMessage();
                  }
                }}
                rows={1}
                maxLength={1200}
                placeholder="Ask about a product, delivery, payment…"
                aria-label="Message the PhaseForge assistant"
                className="max-h-24 min-h-[20px] flex-1 resize-none bg-transparent text-sm text-white outline-none placeholder:text-mist-500"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                aria-label="Send message"
                className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-volt-500 text-ink-950 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ArrowRightIcon className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-2 text-center text-[10px] leading-relaxed text-mist-500">
              AI assistant · May make mistakes. Confirm stock, prices and urgent jobs with our
              team.{" "}
              <a
                href={helpHref}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-mist-300 hover:text-volt-300"
              >
                WhatsApp us
              </a>
            </p>
          </form>
        </div>
      )}

      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open PhaseForge AI assistant"
          aria-controls="pf-assistant-panel"
          aria-expanded={open}
          className="fixed bottom-24 right-4 z-50 flex items-center gap-2 rounded-full border border-volt-400/30 bg-ink-900/95 px-4 py-3 text-sm font-bold text-white shadow-[0_10px_35px_-8px_rgba(241,190,41,0.65)] backdrop-blur transition-transform hover:-translate-y-0.5 sm:right-5"
        >
          <SparkIcon className="h-5 w-5 text-volt-300" /> Ask AI
        </button>
      )}
    </>
  );
}
