"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ShieldAlert, LogOut, Store } from "lucide-react";
import { AdminNav } from "@/components/admin-nav";
import { getBrowserSupabase } from "@/lib/supabase-browser";

type Access = "loading" | "ok" | "denied" | "unconfigured";

export function AdminFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [access, setAccess] = useState<Access>("loading");

  const isLogin = pathname === "/admin/login";

  useEffect(() => {
    if (isLogin) return;
    const sb = getBrowserSupabase();
    if (!sb) {
      setAccess("unconfigured");
      return;
    }
    let active = true;
    (async () => {
      const {
        data: { session },
      } = await sb.auth.getSession();
      if (!session) {
        router.replace("/admin/login");
        return;
      }
      const { data: prof } = await sb
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .maybeSingle();
      if (!active) return;
      setAccess(prof?.role === "admin" ? "ok" : "denied");
    })();
    return () => {
      active = false;
    };
  }, [isLogin, pathname, router]);

  async function signOut() {
    const sb = getBrowserSupabase();
    await sb?.auth.signOut();
    router.replace("/admin/login");
  }

  // Login page renders on its own, no sidebar/guard.
  if (isLogin) return <>{children}</>;

  if (access === "loading") {
    return (
      <div className="container py-24 text-center text-muted-foreground">
        Checking access…
      </div>
    );
  }

  if (access === "unconfigured") {
    return (
      <div className="container py-24 text-center">
        <h1 className="text-xl font-semibold">Admin not connected yet</h1>
        <p className="mt-2 text-muted-foreground">
          The Supabase keys aren&apos;t available in this environment.
        </p>
      </div>
    );
  }

  if (access === "denied") {
    return (
      <div className="container py-24 text-center">
        <h1 className="text-xl font-semibold">Not authorized</h1>
        <p className="mt-2 text-muted-foreground">
          This account isn&apos;t an admin.
        </p>
        <button
          onClick={signOut}
          className="mt-5 inline-flex h-10 items-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Sign out
        </button>
      </div>
    );
  }

  // Authorized admin → full shell
  return (
    <div className="container py-10">
      <div className="mb-6 flex items-start gap-3 rounded-lg border border-emerald-300/50 bg-emerald-50 p-3 text-sm text-emerald-900 dark:border-emerald-800/50 dark:bg-emerald-950/40 dark:text-emerald-200">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
        <p>You&apos;re signed in as an admin. Changes here update your live store.</p>
      </div>

      <header className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">LUXE</p>
          <h1 className="text-2xl font-bold tracking-tight">Admin dashboard</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="inline-flex h-9 items-center gap-2 rounded-md border px-3 text-sm font-medium hover:bg-muted"
          >
            <Store className="h-4 w-4" /> View store
          </Link>
          <button
            onClick={signOut}
            className="inline-flex h-9 items-center gap-2 rounded-md border px-3 text-sm font-medium hover:bg-muted"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </header>

      <div className="grid gap-8 md:grid-cols-[200px_1fr]">
        <aside className="md:sticky md:top-24 md:self-start">
          <AdminNav />
        </aside>
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
