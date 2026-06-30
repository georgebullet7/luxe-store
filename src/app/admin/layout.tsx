import type { ReactNode } from "react";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { AdminNav } from "@/components/admin-nav";

export const metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="container py-10">
      <div className="mb-6 flex items-start gap-3 rounded-lg border border-amber-300/50 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-800/50 dark:bg-amber-950/40 dark:text-amber-200">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          Admin area. In production this route is protected by role-based auth
          middleware (ADMIN only). See{" "}
          <Link href="/" className="underline">
            README → Authentication
          </Link>
          .
        </p>
      </div>

      <header className="mb-8">
        <p className="text-sm text-muted-foreground">LUXE</p>
        <h1 className="text-2xl font-bold tracking-tight">Admin dashboard</h1>
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
