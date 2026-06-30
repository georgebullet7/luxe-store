import type { ReactNode } from "react";
import { DashboardNav } from "@/components/dashboard-nav";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="container py-10">
      <header className="mb-8">
        <p className="text-sm text-muted-foreground">My account</p>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
      </header>
      <div className="grid gap-8 md:grid-cols-[220px_1fr]">
        <aside className="md:sticky md:top-24 md:self-start">
          <DashboardNav />
        </aside>
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
