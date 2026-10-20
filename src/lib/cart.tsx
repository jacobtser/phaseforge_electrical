"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { getProduct, type Product } from "./products";

export type CartItem = { slug: string; qty: number };

type CartValue = {
  items: CartItem[];
  ready: boolean;
  count: number;
  /** GHS total; excludes quote-only items */
  subtotal: number;
  add: (slug: string, qty?: number) => void;
  setQty: (slug: string, qty: number) => void;
  remove: (slug: string) => void;
  clear: () => void;
};

const STORAGE_KEY = "pf-cart-v1";
const EMPTY_CART: CartItem[] = [];
const CartContext = createContext<CartValue | null>(null);

/* -------------------------------------------------------------------------- */
/* Tiny external store backed by localStorage.                                 */
/* Using useSyncExternalStore keeps the server render (empty cart) and the     */
/* hydrated client render in sync without setState-inside-effect cascades.     */
/* -------------------------------------------------------------------------- */

const listeners = new Set<() => void>();
let cachedCart: CartItem[] | null = null;

function normalizeItems(value: unknown): CartItem[] {
  if (!Array.isArray(value)) return EMPTY_CART;
  return value
    .filter(
      (it): it is CartItem =>
        !!it &&
        typeof it === "object" &&
        typeof (it as CartItem).slug === "string" &&
        typeof (it as CartItem).qty === "number" &&
        (it as CartItem).qty > 0 &&
        !!getProduct((it as CartItem).slug),
    )
    .map((it) => ({ slug: it.slug, qty: Math.min(Math.floor(it.qty), 999) }));
}

function readStore(): CartItem[] {
  if (typeof window === "undefined") return EMPTY_CART;
  if (cachedCart) return cachedCart;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    cachedCart = raw ? normalizeItems(JSON.parse(raw)) : EMPTY_CART;
  } catch {
    cachedCart = EMPTY_CART;
  }
  return cachedCart;
}

function emitChange() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (typeof window === "undefined") return () => listeners.delete(listener);

  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY && event.key !== null) return;
    try {
      cachedCart = event.newValue ? normalizeItems(JSON.parse(event.newValue)) : EMPTY_CART;
    } catch {
      cachedCart = EMPTY_CART;
    }
    listener();
  };

  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function writeStore(items: CartItem[]) {
  cachedCart = items;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* storage full or blocked — cart still works in memory */
  }
  emitChange();
}

/** False during SSR + the first hydration pass, true once the browser owns it. */
function subscribeReady(listener: () => void) {
  return subscribe(listener);
}

export function CartProvider({ children }: { children: ReactNode }) {
  const items = useSyncExternalStore(subscribe, readStore, () => EMPTY_CART);
  const ready = useSyncExternalStore(
    subscribeReady,
    () => true,
    () => false,
  );

  const add = useCallback((slug: string, qty = 1) => {
    if (!getProduct(slug)) return;
    const amount = Math.min(Math.max(1, Math.floor(qty)), 999);
    const prev = readStore();
    const found = prev.find((it) => it.slug === slug);
    if (found) {
      writeStore(
        prev.map((it) =>
          it.slug === slug ? { ...it, qty: Math.min(it.qty + amount, 999) } : it,
        ),
      );
      return;
    }
    writeStore([...prev, { slug, qty: amount }]);
  }, []);

  const setQty = useCallback((slug: string, qty: number) => {
    const prev = readStore();
    if (qty <= 0) {
      writeStore(prev.filter((it) => it.slug !== slug));
      return;
    }
    const amount = Math.min(Math.max(1, Math.floor(qty)), 999);
    writeStore(prev.map((it) => (it.slug === slug ? { ...it, qty: amount } : it)));
  }, []);

  const remove = useCallback((slug: string) => {
    writeStore(readStore().filter((it) => it.slug !== slug));
  }, []);

  const clear = useCallback(() => {
    writeStore([]);
  }, []);

  const value = useMemo<CartValue>(() => {
    const resolved = items.flatMap((it) => {
      const product = getProduct(it.slug);
      return product ? [{ ...it, product }] : [];
    });
    const count = resolved.reduce((n, it) => n + it.qty, 0);
    const subtotal = resolved.reduce(
      (sum, it) => sum + (it.product.price ?? 0) * it.qty,
      0,
    );
    return { items, ready, count, subtotal, add, setQty, remove, clear };
  }, [items, ready, add, setQty, remove, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}

/** Resolved cart lines (item + product), quote-only items included. */
export function useCartLines(): { item: CartItem; product: Product }[] {
  const { items } = useCart();
  return items.flatMap((it) => {
    const product = getProduct(it.slug);
    return product ? [{ item: it, product }] : [];
  });
}
