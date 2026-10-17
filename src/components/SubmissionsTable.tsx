"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import type { SubmissionRecord, SubmissionStatus } from "@/lib/types";
import { submissionStatuses } from "@/lib/types";
import { MailIcon, PhoneIcon, TrashIcon, WhatsAppIcon } from "./Icons";

const statusStyle: Record<SubmissionStatus, string> = {
  new: "bg-volt-500/15 text-volt-300 ring-volt-400/30",
  contacted: "bg-indigo-500/15 text-indigo-300 ring-indigo-400/30",
  scheduled: "bg-amber-500/15 text-amber-300 ring-amber-400/30",
  in_progress: "bg-sky-500/15 text-sky-300 ring-sky-400/30",
  completed: "bg-emerald-500/15 text-emerald-300 ring-emerald-400/30",
  cancelled: "bg-red-500/15 text-red-300 ring-red-400/30",
};

const typeLabel: Record<string, string> = {
  appointment: "Appointment",
  order: "Order",
  quote: "Quote",
  contact: "Message",
};

export function SubmissionsTable({ rows: initial }: { rows: SubmissionRecord[] }) {
  const router = useRouter();
  const [rows, setRows] = useState(initial);
  const [openId, setOpenId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function setStatus(id: string, status: SubmissionStatus) {
    setBusyId(id);
    setRows((r) => r.map((row) => (row.id === id ? { ...row, status } : row)));
    const res = await fetch("/api/admin/submissions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    setBusyId(null);
    if (!res.ok) {
      router.refresh();
      return;
    }
    router.refresh();
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this request permanently?")) return;
    setBusyId(id);
    const res = await fetch(`/api/admin/submissions?id=${id}`, { method: "DELETE" });
    setBusyId(null);
    if (res.ok) {
      setRows((r) => r.filter((row) => row.id !== id));
      router.refresh();
    }
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/15 bg-ink-900/40 px-6 py-16 text-center">
        <p className="text-mist-300">No requests found.</p>
        <p className="mt-1 text-sm text-mist-500">
          New submissions will appear here automatically.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-ink-900/40">
      <div className="hidden grid-cols-[1.4fr_1fr_1.4fr_1fr_1.6fr] gap-3 border-b border-white/10 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-mist-400 lg:grid">
        <span>Client</span>
        <span>Ref</span>
        <span>Service</span>
        <span>Status</span>
        <span className="text-right">Actions</span>
      </div>

      <ul className="divide-y divide-white/5">
        {rows.map((r) => {
          const open = openId === r.id;
          return (
            <li key={r.id}>
              <div className="grid grid-cols-1 gap-3 px-4 py-4 lg:grid-cols-[1.4fr_1fr_1.4fr_1fr_1.6fr] lg:items-center">
                <div className="min-w-0">
                  <button
                    type="button"
                    onClick={() => setOpenId(open ? null : r.id)}
                    className="truncate text-left font-semibold text-white hover:text-volt-300"
                  >
                    {r.name}
                  </button>
                  <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-mist-400">
                    <span>{r.phone}</span>
                    <span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] uppercase tracking-wide">
                      {typeLabel[r.type] ?? r.type}
                    </span>
                    {r.urgency === "emergency" && (
                      <span className="rounded bg-red-500/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-red-300">
                        Emergency
                      </span>
                    )}
                  </div>
                </div>

                <div className="font-mono text-sm text-mist-200">{r.ref}</div>

                <div className="min-w-0 text-sm text-mist-300">
                  <div className="truncate">
                    {[r.serviceCategory, r.service].filter(Boolean).join(" / ") || "General"}
                  </div>
                  <div className="truncate text-xs text-mist-500">
                    {[r.city, r.preferredDate].filter(Boolean).join(" · ")}
                  </div>
                </div>

                <div>
                  <select
                    value={r.status}
                    disabled={busyId === r.id}
                    onChange={(e) => setStatus(r.id, e.target.value as SubmissionStatus)}
                    className={clsx(
                      "rounded-lg px-2.5 py-1.5 text-xs font-semibold ring-1 focus:outline-none disabled:opacity-60",
                      statusStyle[r.status],
                    )}
                  >
                    {submissionStatuses.map((s) => (
                      <option key={s} value={s} className="bg-ink-900 text-white">
                        {s.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2 lg:justify-end">
                  <a
                    href={`tel:${r.phone}`}
                    className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 text-mist-300 hover:border-volt-400/50 hover:text-volt-300"
                    aria-label={`Call ${r.name}`}
                  >
                    <PhoneIcon className="h-4 w-4" />
                  </a>
                  <a
                    href={`mailto:${r.email}`}
                    className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 text-mist-300 hover:border-volt-400/50 hover:text-volt-300"
                    aria-label={`Email ${r.name}`}
                  >
                    <MailIcon className="h-4 w-4" />
                  </a>
                  <a
                    href={`https://wa.me/${r.phone.replace(/[^\d]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 text-mist-300 hover:border-[#25D366]/60 hover:text-[#25D366]"
                    aria-label={`WhatsApp ${r.name}`}
                  >
                    <WhatsAppIcon className="h-4 w-4" />
                  </a>
                  <button
                    type="button"
                    onClick={() => remove(r.id)}
                    disabled={busyId === r.id}
                    className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 text-mist-300 hover:border-red-400/50 hover:text-red-300 disabled:opacity-60"
                    aria-label={`Delete ${r.ref}`}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {open && (
                <div className="border-t border-white/5 bg-ink-950/50 px-4 py-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <dl className="space-y-2 text-sm">
                      <Row label="Email" value={r.email} />
                      <Row label="Property" value={r.propertyType} />
                      <Row label="Address" value={[r.address, r.city].filter(Boolean).join(", ")} />
                      <Row label="Location" value={r.latitude && r.longitude ? `${r.latitude.toFixed(5)}, ${r.longitude.toFixed(5)}` : null} />
                      <Row
                        label="Preferred"
                        value={[r.preferredDate, r.preferredTime].filter(Boolean).join(" ")}
                      />
                      <Row label="Budget" value={r.budget} />
                      <Row label="Referral" value={r.referral} />
                      <Row label="Received" value={new Date(r.createdAt).toLocaleString()} />
                    </dl>
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wide text-mist-400">
                        Details
                      </div>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-mist-200">
                        {r.details}
                      </p>
                      {r.photos && r.photos.length > 0 && (
                        <div className="mt-3">
                          <div className="text-xs font-semibold uppercase tracking-wide text-mist-400 mb-2">Photos</div>
                          <div className="flex flex-wrap gap-2">
                            {r.photos.map((url) => (
                              <a key={url} href={url} target="_blank" rel="noopener" className="text-xs text-volt-300 truncate max-w-xs">{url}</a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex gap-3">
      <dt className="w-24 shrink-0 text-mist-500">{label}</dt>
      <dd className="text-mist-200">{value}</dd>
    </div>
  );
}
