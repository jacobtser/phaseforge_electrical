"use client";

import { useMemo, useRef, useState } from "react";
import { ProductArt } from "@/components/shop/ProductArt";
import type { ProductArt as ArtKind } from "@/lib/products";

export type PhotoRow = {
  slug: string;
  name: string;
  brand: string;
  category: string;
  art: ArtKind;
  url: string | null;
  source: "upload" | "ai" | null;
};

type Props = {
  rows: PhotoRow[];
  categories: { id: string; label: string }[];
  aiEnabled: boolean;
  warnings: string[];
};

type Filter = "all" | "missing" | "has";
type Busy = "upload" | "ai" | "remove" | null;

const PAGE = 48;

async function readJson(res: Response) {
  return (await res.json().catch(() => null)) as {
    ok?: boolean;
    message?: string;
    image?: { url: string; source: "upload" | "ai" };
  } | null;
}

export function ProductPhotoManager({ rows: initial, categories, aiEnabled, warnings }: Props) {
  const [rows, setRows] = useState(initial);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [filter, setFilter] = useState<Filter>("all");
  const [limit, setLimit] = useState(PAGE);
  const [bulk, setBulk] = useState<{ done: number; total: number; failed: number } | null>(null);
  const stopBulk = useRef(false);

  const withPhoto = rows.filter((r) => r.url).length;

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (category !== "all" && r.category !== category) return false;
      if (filter === "missing" && r.url) return false;
      if (filter === "has" && !r.url) return false;
      if (q && !`${r.name} ${r.brand} ${r.slug}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [rows, query, category, filter]);

  function update(slug: string, patch: Partial<PhotoRow>) {
    setRows((prev) => prev.map((r) => (r.slug === slug ? { ...r, ...patch } : r)));
  }

  async function generate(slug: string, extra?: string): Promise<string | null> {
    const res = await fetch("/api/admin/product-images", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, generate: true, extra }),
    });
    const data = await readJson(res);
    if (!res.ok || !data?.ok || !data.image) return data?.message ?? "Generation failed.";
    update(slug, { url: data.image.url, source: "ai" });
    return null;
  }

  async function runBulk() {
    const targets = visible.filter((r) => !r.url);
    if (targets.length === 0) return;
    if (
      !window.confirm(
        `Generate AI photos for ${targets.length} product(s) without a photo? Each one uses Gemini API credit and takes 10–40 seconds.`,
      )
    ) {
      return;
    }
    stopBulk.current = false;
    let failed = 0;
    setBulk({ done: 0, total: targets.length, failed: 0 });
    for (let i = 0; i < targets.length; i++) {
      if (stopBulk.current) break;
      const error = await generate(targets[i].slug).catch(() => "Network error.");
      if (error) failed++;
      setBulk({ done: i + 1, total: targets.length, failed });
    }
    setBulk((b) => (b ? { ...b, total: b.done } : b));
  }

  return (
    <div className="mt-8 space-y-6">
      {warnings.length > 0 && (
        <div className="space-y-2 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-100">
          {warnings.map((w) => (
            <p key={w}>{w}</p>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-ink-900/60 p-4">
        <p className="mr-auto text-sm text-mist-300">
          <span className="font-semibold text-white">{withPhoto}</span> of {rows.length} products
          have a photo.
        </p>
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setLimit(PAGE);
          }}
          placeholder="Search products"
          className="w-full rounded-lg border border-white/10 bg-ink-950 px-3 py-2 text-sm text-white placeholder:text-mist-500 sm:w-56"
        />
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setLimit(PAGE);
          }}
          className="rounded-lg border border-white/10 bg-ink-950 px-3 py-2 text-sm text-white"
        >
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
        <select
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value as Filter);
            setLimit(PAGE);
          }}
          className="rounded-lg border border-white/10 bg-ink-950 px-3 py-2 text-sm text-white"
        >
          <option value="all">With and without photos</option>
          <option value="missing">Missing a photo</option>
          <option value="has">Has a photo</option>
        </select>
        {aiEnabled &&
          (bulk && bulk.done < bulk.total ? (
            <button
              type="button"
              onClick={() => (stopBulk.current = true)}
              className="btn btn-sm btn-secondary"
            >
              Stop ({bulk.done}/{bulk.total})
            </button>
          ) : (
            <button type="button" onClick={runBulk} className="btn btn-sm btn-primary">
              Generate missing in this view
            </button>
          ))}
      </div>

      {bulk && (
        <p className="text-sm text-mist-300">
          AI photos: {bulk.done} of {bulk.total} done
          {bulk.failed > 0 ? `, ${bulk.failed} failed` : ""}.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.slice(0, limit).map((row) => (
          <PhotoCard
            key={row.slug}
            row={row}
            aiEnabled={aiEnabled}
            onGenerate={generate}
            onChange={(patch) => update(row.slug, patch)}
          />
        ))}
      </div>

      {visible.length === 0 && (
        <p className="text-sm text-mist-400">No products match these filters.</p>
      )}

      {visible.length > limit && (
        <div className="text-center">
          <button
            type="button"
            onClick={() => setLimit((l) => l + PAGE)}
            className="btn btn-sm btn-secondary"
          >
            Show more ({visible.length - limit} left)
          </button>
        </div>
      )}
    </div>
  );
}

function PhotoCard({
  row,
  aiEnabled,
  onGenerate,
  onChange,
}: {
  row: PhotoRow;
  aiEnabled: boolean;
  onGenerate: (slug: string, extra?: string) => Promise<string | null>;
  onChange: (patch: Partial<PhotoRow>) => void;
}) {
  const [busy, setBusy] = useState<Busy>(null);
  const [error, setError] = useState<string | null>(null);
  const [extra, setExtra] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    setBusy("upload");
    setError(null);
    try {
      const body = new FormData();
      body.append("slug", row.slug);
      body.append("file", file);
      const res = await fetch("/api/admin/product-images", { method: "POST", body });
      const data = await readJson(res);
      if (!res.ok || !data?.ok || !data.image) {
        setError(data?.message ?? "Upload failed.");
        return;
      }
      onChange({ url: data.image.url, source: "upload" });
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function generate() {
    setBusy("ai");
    setError(null);
    try {
      const message = await onGenerate(row.slug, extra.trim() || undefined);
      if (message) setError(message);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(null);
    }
  }

  async function remove() {
    if (!window.confirm(`Remove the photo from "${row.name}"?`)) return;
    setBusy("remove");
    setError(null);
    try {
      const res = await fetch(`/api/admin/product-images?slug=${encodeURIComponent(row.slug)}`, {
        method: "DELETE",
      });
      const data = await readJson(res);
      if (!res.ok || !data?.ok) {
        setError(data?.message ?? "Could not remove the photo.");
        return;
      }
      onChange({ url: null, source: null });
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-ink-900/60">
      <div className="relative aspect-[4/3] bg-ink-950">
        {row.url ? (
          // eslint-disable-next-line @next/next/no-img-element -- admin preview of uploaded photo
          <img src={row.url} alt={row.name} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full p-6 opacity-60">
            <ProductArt art={row.art} />
          </div>
        )}
        {row.source && (
          <span className="absolute left-2 top-2 rounded-md bg-ink-950/85 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-volt-300">
            {row.source === "ai" ? "AI photo" : "Uploaded"}
          </span>
        )}
        {busy === "ai" && (
          <div className="absolute inset-0 grid place-items-center bg-ink-950/70 text-sm text-mist-100">
            Generating photo…
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h2 className="text-sm font-bold leading-snug text-white">{row.name}</h2>
          <p className="text-xs text-mist-400">{row.brand}</p>
        </div>

        {aiEnabled && (
          <input
            type="text"
            value={extra}
            onChange={(e) => setExtra(e.target.value)}
            maxLength={300}
            placeholder="Optional AI direction, e.g. white casing, coil view"
            className="rounded-lg border border-white/10 bg-ink-950 px-3 py-2 text-xs text-white placeholder:text-mist-500"
          />
        )}

        <div className="mt-auto flex flex-wrap gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void upload(file);
            }}
          />
          <button
            type="button"
            disabled={busy !== null}
            onClick={() => fileRef.current?.click()}
            className="btn btn-sm btn-secondary flex-1 disabled:opacity-50"
          >
            {busy === "upload" ? "Uploading…" : "Upload photo"}
          </button>
          {aiEnabled && (
            <button
              type="button"
              disabled={busy !== null}
              onClick={generate}
              className="btn btn-sm btn-primary flex-1 disabled:opacity-50"
            >
              {row.url ? "Regenerate (AI)" : "Generate (AI)"}
            </button>
          )}
          {row.url && (
            <button
              type="button"
              disabled={busy !== null}
              onClick={remove}
              className="rounded-lg px-2 text-xs text-mist-400 hover:text-red-300 disabled:opacity-50"
            >
              {busy === "remove" ? "Removing…" : "Remove"}
            </button>
          )}
        </div>

        {error && <p className="text-xs text-red-300">{error}</p>}
      </div>
    </article>
  );
}
