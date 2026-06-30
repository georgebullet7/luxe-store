import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SiteSettings } from "@/lib/site";

export function PromoBanner({ s }: { s: SiteSettings }) {
  if (!s.promo_enabled) return null;
  return (
    <div className="relative overflow-hidden rounded-xl bg-primary px-8 py-14 text-primary-foreground sm:px-14">
      <div className="relative z-10 max-w-lg">
        <p className="text-sm font-medium uppercase tracking-wide text-accent">
          {s.promo_eyebrow}
        </p>
        <h3 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          {s.promo_title}
        </h3>
        <p className="mt-3 text-primary-foreground/70">{s.promo_subtitle}</p>
        <Button variant="accent" size="lg" className="mt-6" asChild>
          <Link href={s.promo_cta_href}>
            {s.promo_cta_label} <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
      <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-accent/20 blur-3xl" />
    </div>
  );
}
