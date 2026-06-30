"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { products } from "@/lib/mock-data";
import { useWishlistStore } from "@/store/wishlist-store";
import { ProductCard } from "@/components/product-card";

export default function WishlistPage() {
  const ids = useWishlistStore((s) => s.ids);
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch: the persisted store is only available client-side.
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const items = products.filter((p) => ids.includes(p.id));

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed py-16 text-center">
        <Heart className="mx-auto h-10 w-10 text-muted-foreground" />
        <h2 className="mt-4 text-lg font-semibold">Your wishlist is empty</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Tap the heart on any product to save it here.
        </p>
        <Link
          href="/shop"
          className="mt-5 inline-flex h-10 items-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold">
        Saved items ({items.length})
      </h2>
      <div className="grid grid-cols-2 gap-5 lg:grid-cols-3">
        {items.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
