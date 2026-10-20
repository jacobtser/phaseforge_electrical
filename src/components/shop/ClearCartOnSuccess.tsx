"use client";

import { useEffect } from "react";
import { useCart } from "@/lib/cart";

/** Clears the local cart once a verified payment success page is shown. */
export function ClearCartOnSuccess() {
  const { ready, clear } = useCart();

  useEffect(() => {
    if (ready) clear();
  }, [ready, clear]);

  return null;
}
