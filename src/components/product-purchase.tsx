"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Heart, Minus, Plus, ShoppingBag, Check, Truck, RefreshCw, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/lib/types";
import { cn, formatPrice, discountPercent } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RatingStars } from "@/components/rating-stars";
import { useCartStore } from "@/store/cart-store";
import { useWishlistStore } from "@/store/wishlist-store";
import { useRecentlyViewed } from "@/store/recently-viewed-store";

export function ProductPurchase({ product }: { product: Product }) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const toggleWish = useWishlistStore((s) => s.toggle);
  const wished = useWishlistStore((s) => s.ids.includes(product.id));
  const addRecent = useRecentlyViewed((s) => s.add);

  const [variantId, setVariantId] = React.useState(
    product.variants.find((v) => v.stock > 0)?.id ?? product.variants[0]?.id
  );
  const [qty, setQty] = React.useState(1);

  React.useEffect(() => addRecent(product.slug), [product.slug, addRecent]);

  const variant = product.variants.find((v) => v.id === variantId);
  const unitPrice = product.price + (variant?.priceDelta ?? 0);
  const inStock = (variant?.stock ?? 0) > 0;
  const off = discountPercent(product.price, product.compareAtPrice);

  const hasColors = product.variants.some((v) => v.color);
  const hasSizes = product.variants.some((v) => v.size);

  function buildLine() {
    return {
      productId: product.id,
      variantId: variant?.id,
      slug: product.slug,
      name: product.name,
      variantName: variant?.name,
      image: product.images[0],
      unitPrice,
      quantity: qty,
    };
  }

  function addToCart() {
    if (!inStock) return;
    addItem(buildLine());
    toast.success(`Added ${qty} × ${product.name}`);
  }

  function buyNow() {
    if (!inStock) return;
    addItem(buildLine());
    router.push("/checkout");
  }

  return (
    <div className="space-y-6">
      <div>
        {product.brandName && (
          <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">{product.brandName}</p>
        )}
        <h1 className="mt-1 text-3xl font-bold tracking-tight">{product.name}</h1>
        <div className="mt-2 flex items-center gap-3">
          <RatingStars rating={product.rating} size={16} />
          <span className="text-sm text-muted-foreground">{product.rating} · {product.reviewCount} reviews</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-3xl font-bold">{formatPrice(unitPrice)}</span>
        {product.compareAtPrice && (
          <>
            <span className="text-lg text-muted-foreground line-through">{formatPrice(product.compareAtPrice)}</span>
            <Badge variant="accent">Save {off}%</Badge>
          </>
        )}
      </div>

      <p className="text-muted-foreground">{product.description}</p>

      {hasColors && (
        <div>
          <p className="mb-2 text-sm font-medium">Color: <span className="text-muted-foreground">{variant?.color}</span></p>
          <div className="flex flex-wrap gap-2">
            {product.variants.filter((v) => v.color).map((v) => (
              <button
                key={v.id}
                onClick={() => setVariantId(v.id)}
                disabled={v.stock === 0}
                className={cn(
                  "rounded-lg border px-4 py-2 text-sm transition-colors disabled:opacity-40",
                  variantId === v.id ? "border-primary bg-primary text-primary-foreground" : "hover:bg-secondary"
                )}
              >
                {v.color}
              </button>
            ))}
          </div>
        </div>
      )}

      {hasSizes && (
        <div>
          <p className="mb-2 text-sm font-medium">Size</p>
          <div className="flex flex-wrap gap-2">
            {product.variants.filter((v) => v.size).map((v) => (
              <button
                key={v.id}
                onClick={() => setVariantId(v.id)}
                disabled={v.stock === 0}
                className={cn(
                  "min-w-12 rounded-lg border px-4 py-2 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40 disabled:line-through",
                  variantId === v.id ? "border-primary bg-primary text-primary-foreground" : "hover:bg-secondary"
                )}
              >
                {v.size}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-4">
        <div className="flex items-center rounded-lg border">
          <Button variant="ghost" size="icon" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-10 text-center text-sm font-medium">{qty}</span>
          <Button variant="ghost" size="icon" onClick={() => setQty((q) => q + 1)} aria-label="Increase quantity">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <p className={cn("flex items-center gap-1.5 text-sm", inStock ? "text-emerald-600" : "text-destructive")}>
          {inStock ? <><Check className="h-4 w-4" /> In stock ({variant?.stock})</> : "Out of stock"}
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button size="lg" className="flex-1" onClick={addToCart} disabled={!inStock}>
          <ShoppingBag className="h-5 w-5" /> Add to cart
        </Button>
        <Button size="lg" variant="accent" className="flex-1" onClick={buyNow} disabled={!inStock}>
          Buy now
        </Button>
        <Button
          size="lg"
          variant="outline"
          onClick={() => toggleWish(product.id)}
          aria-label="Toggle wishlist"
        >
          <Heart className={cn("h-5 w-5", wished && "fill-accent text-accent")} />
        </Button>
      </div>

      <div className="grid gap-3 rounded-xl border p-4 text-sm sm:grid-cols-3">
        <Perk icon={Truck} text="Free 2-day shipping" />
        <Perk icon={RefreshCw} text="30-day returns" />
        <Perk icon={ShieldCheck} text="2-year warranty" />
      </div>
    </div>
  );
}

function Perk({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <Icon className="h-4 w-4 shrink-0" />
      <span>{text}</span>
    </div>
  );
}
