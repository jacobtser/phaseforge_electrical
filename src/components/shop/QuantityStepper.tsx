"use client";

import { MinusIcon, PlusIcon } from "@/components/Icons";

export function QuantityStepper({
  qty,
  onChange,
  max = 999,
  id,
}: {
  qty: number;
  onChange: (n: number) => void;
  max?: number;
  id?: string;
}) {
  return (
    <div
      className="inline-flex items-center rounded-xl border border-white/10 bg-ink-950/60"
      role="group"
      aria-label="Quantity"
    >
      <button
        type="button"
        onClick={() => onChange(Math.max(1, qty - 1))}
        disabled={qty <= 1}
        aria-label="Decrease quantity"
        className="grid h-11 w-11 place-items-center rounded-l-xl text-mist-200 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-35"
      >
        <MinusIcon className="h-4 w-4" />
      </button>
      <input
        id={id}
        type="number"
        min={1}
        max={max}
        value={qty}
        onChange={(e) => {
          const n = Number.parseInt(e.target.value, 10);
          onChange(Number.isFinite(n) ? Math.min(Math.max(n, 1), max) : 1);
        }}
        aria-label="Quantity"
        className="h-11 w-14 border-x border-white/10 bg-transparent text-center text-sm font-bold text-white [appearance:textfield] focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <button
        type="button"
        onClick={() => onChange(Math.min(max, qty + 1))}
        disabled={qty >= max}
        aria-label="Increase quantity"
        className="grid h-11 w-11 place-items-center rounded-r-xl text-mist-200 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-35"
      >
        <PlusIcon className="h-4 w-4" />
      </button>
    </div>
  );
}
