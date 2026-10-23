"use client";

import { useMemo, useState } from "react";
import { SearchIcon, CloseIcon } from "@/components/Icons";
import { ProductCard } from "./ProductCard";
import { site } from "@/lib/site";
import {
  brands,
  categories,
  collections,
  products,
  type CollectionId,
} from "@/lib/products";

export function ShopCatalog({
  initialCollection,
  initialCategory,
  initialBrand,
  initialQuery,
}: {
  initialCollection?: string;
  initialCategory?: string;
  initialBrand?: string;
  initialQuery?: string;
}) {
  const [q, setQ] = useState(initialQuery ?? "");
  const [category, setCategory] = useState<string>(() =>
    categories.some((c) => c.id === initialCategory) ? initialCategory ?? "" : "",
  );
  const [brand, setBrand] = useState<string>(() =>
    brands.includes(initialBrand ?? "") ? initialBrand ?? "" : "",
  );
  const [collection, setCollection] = useState<string>(() =>
    collections.some((c) => c.id === initialCollection) ? initialCollection ?? "" : "",
  );

  const filtered = useMemo(
    () =>
      products.filter((p) => {
        if (category && p.category !== category) return false;
        if (brand && p.brand !== brand) return false;
        if (collection && !p.collections.includes(collection as CollectionId)) return false;
        if (q.trim()) {
          const hay = `${p.name} ${p.brand} ${p.keySpec} ${p.sku}`.toLowerCase();
          if (!hay.includes(q.trim().toLowerCase())) return false;
        }
        return true;
      }),
    [q, category, brand, collection],
  );

  const active =
    (q.trim() ? 1 : 0) + (category ? 1 : 0) + (brand ? 1 : 0) + (collection ? 1 : 0);
  const solarFocused = category === "solar" || collection === "solar";
  const whatsappNumber = solarFocused ? site.solarEv.whatsapp : site.whatsapp;

  return (
    <div>
      {/* Search + filters */}
      <div className="card card-p5">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-mist-400" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search MCBs, cable, LED panels, batteries…"
            aria-label="Search products"
            className="w-full rounded-xl border border-white/10 bg-ink-950/70 py-3 pl-11 pr-4 text-sm text-white placeholder:text-mist-500 focus:border-volt-400/60 focus:outline-none"
          />
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <FilterSelect
            label="Category"
            value={category}
            onChange={setCategory}
            options={categories.map((c) => ({ value: c.id, label: c.label }))}
          />
          <FilterSelect
            label="Brand"
            value={brand}
            onChange={setBrand}
            options={brands.map((b) => ({ value: b, label: b }))}
          />
          <FilterSelect
            label="Collection"
            value={collection}
            onChange={setCollection}
            options={collections.map((c) => ({ value: c.id, label: c.title }))}
          />
        </div>

        {active > 0 && (
          <button
            type="button"
            onClick={() => {
              setQ("");
              setCategory("");
              setBrand("");
              setCollection("");
            }}
            className="link-accent mt-3 text-sm"
          >
            <CloseIcon className="h-3.5 w-3.5" /> Clear filters
          </button>
        )}
      </div>

      <p className="mt-6 text-sm text-mist-400" role="status">
        {filtered.length} {filtered.length === 1 ? "product" : "products"}
        {active > 0 && " matching your filters"}
      </p>

      {filtered.length > 0 ? (
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((p, i) => (
            <ProductCard key={p.slug} product={p} priority={i < 4} />
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-2xl border border-dashed border-white/15 p-10 text-center">
          <p className="font-bold text-white">No products match those filters</p>
          <p className="mt-2 text-sm text-mist-400">
            Try clearing filters, or{" "}
            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="link-accent"
            >
              ask us on WhatsApp
            </a>{" "}
            — we can source it.
            {solarFocused && (
              <span className="mt-1 block text-xs text-forge-300">
                Solar enquiries go directly to our solar &amp; EV specialist.
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-mist-400">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-white/10 bg-ink-950/70 px-3.5 py-3 text-sm text-white focus:border-volt-400/60 focus:outline-none"
      >
        <option value="">{label === "Category" ? "All categories" : `All ${label.toLowerCase()}s`}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
