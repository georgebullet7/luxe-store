"use client";
import * as React from "react";
import type { Product, Review } from "@/lib/types";
import { cn } from "@/lib/utils";
import { RatingStars } from "@/components/rating-stars";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const tabs = ["Description", "Specifications", "Reviews"] as const;
type Tab = (typeof tabs)[number];

export function ProductTabs({ product, reviews }: { product: Product; reviews: Review[] }) {
  const [tab, setTab] = React.useState<Tab>("Description");

  return (
    <div>
      <div role="tablist" className="flex gap-6 border-b">
        {tabs.map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={cn(
              "relative -mb-px border-b-2 pb-3 text-sm font-medium transition-colors",
              tab === t ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {t}
            {t === "Reviews" && <span className="ml-1.5 text-xs">({product.reviewCount})</span>}
          </button>
        ))}
      </div>

      <div className="py-6">
        {tab === "Description" && (
          <div className="prose-sm max-w-none leading-relaxed text-muted-foreground">
            <p>{product.description}</p>
          </div>
        )}

        {tab === "Specifications" && (
          <dl className="grid gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-2">
            {Object.entries(product.specifications ?? {}).map(([k, v]) => (
              <div key={k} className="flex justify-between bg-card px-4 py-3 text-sm">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="font-medium">{v}</dd>
              </div>
            ))}
          </dl>
        )}

        {tab === "Reviews" && (
          <div className="space-y-6">
            {reviews.length === 0 && <p className="text-sm text-muted-foreground">No reviews yet. Be the first!</p>}
            {reviews.map((r) => (
              <div key={r.id} className="border-b pb-6 last:border-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{r.author}</span>
                    {r.isVerified && <Badge variant="secondary" className="text-[10px]">Verified</Badge>}
                  </div>
                  <span className="text-xs text-muted-foreground">{formatDate(r.createdAt)}</span>
                </div>
                <RatingStars rating={r.rating} className="mt-1" />
                {r.title && <p className="mt-2 text-sm font-medium">{r.title}</p>}
                <p className="mt-1 text-sm text-muted-foreground">{r.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
