"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogoutIcon } from "./Icons";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={logout}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3.5 py-2 text-sm font-medium text-mist-100 transition-colors hover:border-red-400/50 hover:text-red-300 disabled:opacity-60"
    >
      <LogoutIcon className="h-4 w-4" />
      {loading ? "Signing out…" : "Sign out"}
    </button>
  );
}
