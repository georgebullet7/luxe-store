import type { Metadata } from "next";
import Link from "next/link";
import { PackageOpen } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { ShopControls } from "@/components/shop-controls";
import { Button } from "@/components/ui/button";
import { searchProducts, getCategories, getBrands } from "@/lib/data";
import type { SortOption } from "@/lib/types";

export const metadata: Metadata = {
  title: "Shop",
  description: "Browse our full collection of premium products.",
};

interface Props {
  searchParams: {
    query?: string;
    category?: string;
    brand?: string;
    sort?: string;
    minRating?: string;
    page?: string;
  };
}

export default async function ShopPage({ searchParams }: Props) {
  const [categories, brands] = await Promise.all([getCategories(), getBrands()]);

  const { items, total, page, totalPages } = await searchProducts({
    query: searchParams.query,
    category: searchParams.category,
    brands: searchParams.brand ? [searchParams.brand] : undefined,
    minRating: searchParams.minRating ? Number(searchParams.minRating) : undefined,
    sort: (searchParams.sort as SortOption) ?? "featured",
    page: searchParams.page ? Number(searchParams.page) : 1,
  });

  const buildPageHref = (p: number) => {
    const next = new URLSearchParams(searchParams as Record<string, string>);
    next.set("page", String(p));
    return `/shop?${next.toString()}`;
  };

  return (
    <div className="container py-10">
      {/* Breadcrumbs */}
      <nav className="mb-6 text-sm text-muted-foreground" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">Shop</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[260px_1fr]">
        <aside className="lg:sticky lg:top-20 lg:h-fit">
          <ShopControls categories={categories} brands={brands} />
        </aside>

        <div>
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tight">
              {searchParams.category
                ? categories.find((c) => c.slug === searchParams.category)?.name ?? "Shop"
                : "All products"}
            </h1>
            <p className="text-sm text-muted-foreground">{total} results</p>
          </div>

          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-24 text-center">
              <PackageOpen className="h-12 w-12 text-muted-foreground" />
              <h2 className="mt-4 text-lg font-semibold">No products found</h2>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Try adjusting your filters or search for something else.
              </p>
              <Button className="mt-6" asChild><Link href="/shop">Reset</Link></Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} asChild={page > 1}>
                {page > 1 ? <Link href={buildPageHref(page - 1)}>Previous</Link> : <span>Previous</span>}
              </Button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <Button
                  key={i}
                  variant={page === i + 1 ? "default" : "outline"}
                  size="icon"
                  className="h-9 w-9"
                  asChild
                >
                  <Link href={buildPageHref(i + 1)}>{i + 1}</Link>
                </Button>
              ))}
              <Button variant="outline" size="sm" disabled={page >= totalPages} asChild={page < totalPages}>
                {page < totalPages ? <Link href={buildPageHref(page + 1)}>Next</Link> : <span>Next</span>}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
