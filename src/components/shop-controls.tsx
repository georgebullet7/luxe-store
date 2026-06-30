"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, SlidersHorizontal } from "lucide-react";
import type { Category, SortOption } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const sorts: { value: SortOption; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Top rated" },
];

export function ShopControls({ categories, brands }: { categories: Category[]; brands: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [query, setQuery] = React.useState(params.get("query") ?? "");

  const setParam = React.useCallback(
    (key: string, value?: string | null) => {
      const next = new URLSearchParams(params.toString());
      if (!value) next.delete(key);
      else next.set(key, value);
      next.delete("page"); // reset pagination on filter change
      router.push(`${pathname}?${next.toString()}`);
    },
    [params, pathname, router]
  );

  const activeCat = params.get("category");
  const activeBrand = params.get("brand");
  const activeSort = (params.get("sort") as SortOption) ?? "featured";

  return (
    <div className="space-y-8">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setParam("query", query || null);
        }}
        className="relative"
      >
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products..."
          className="pl-9"
          aria-label="Search products"
        />
      </form>

      <div>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <SlidersHorizontal className="h-4 w-4" /> Sort
        </h3>
        <div className="flex flex-wrap gap-2">
          {sorts.map((s) => (
            <button
              key={s.value}
              onClick={() => setParam("sort", s.value === "featured" ? null : s.value)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs transition-colors",
                activeSort === s.value ? "border-primary bg-primary text-primary-foreground" : "hover:bg-secondary"
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold">Category</h3>
        <ul className="space-y-1">
          <FilterLink active={!activeCat} onClick={() => setParam("category", null)}>All</FilterLink>
          {categories.map((c) => (
            <FilterLink key={c.id} active={activeCat === c.slug} onClick={() => setParam("category", c.slug)}>
              {c.name}
            </FilterLink>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold">Brand</h3>
        <ul className="space-y-1">
          <FilterLink active={!activeBrand} onClick={() => setParam("brand", null)}>All brands</FilterLink>
          {brands.map((b) => (
            <FilterLink key={b} active={activeBrand === b} onClick={() => setParam("brand", b)}>
              {b}
            </FilterLink>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold">Min rating</h3>
        <div className="flex gap-2">
          {[4, 4.5].map((r) => (
            <button
              key={r}
              onClick={() => setParam("minRating", params.get("minRating") === String(r) ? null : String(r))}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs transition-colors",
                params.get("minRating") === String(r) ? "border-primary bg-primary text-primary-foreground" : "hover:bg-secondary"
              )}
            >
              {r}★ & up
            </button>
          ))}
        </div>
      </div>

      <Button variant="outline" className="w-full" onClick={() => router.push(pathname)}>
        Clear all filters
      </Button>
    </div>
  );
}

function FilterLink({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <li>
      <button
        onClick={onClick}
        className={cn(
          "w-full rounded-md px-3 py-1.5 text-left text-sm transition-colors",
          active ? "bg-secondary font-medium" : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
        )}
      >
        {children}
      </button>
    </li>
  );
}
