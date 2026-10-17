import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AdminLoginForm } from "@/components/AdminLoginForm";
import { Logo } from "@/components/Logo";

export const metadata: Metadata = {
  title: "Team Login",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  const session = await getSession();
  if (session) redirect("/admin");

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-16">
      <div className="w-full rounded-2xl border border-white/10 bg-ink-900/60 p-8">
        <Logo />
        <h1 className="mt-6 font-display text-2xl font-extrabold text-white">Team dashboard</h1>
        <p className="mt-2 text-sm text-mist-400">
          Sign in to view and manage service requests.
        </p>
        <div className="mt-6">
          <AdminLoginForm />
        </div>
      </div>
    </div>
  );
}
