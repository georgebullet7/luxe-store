"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/lib/types";
import { cn, formatPrice, discountPercent } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RatingStars } from "@/components/rating-stars";
import { useCartStore } from "@/store/cart-store";
import { useWishlistStore } from "@/store/wishlist-store";

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const addItem = useCartStore((s) => s.addItem);
  const toggleWish = useWishlistStore((s) => s.toggle);
  const wished = useWishlistStore((s) => s.ids.includes(product.id));

  const off = discountPercent(product.price, product.compareAtPrice);
  const inStock = product.variants.some((v) => v.stock > 0);

  function quickAdd(e: React.MouseEvent) {
    e.preventDefault();
    const variant = product.variants.find((v) => v.stock > 0) ?? product.variants[0];
    addItem({
      productId: product.id,
      variantId: variant?.id,
      slug: product.slug,
      name: product.name,
      variantName: variant?.name,
      image: product.images[0],
      unitPrice: product.price + (variant?.priceDelta ?? 0),
      quantity: 1,
    });
    toast.success(`${product.name} added to cart`);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3) }}
      className="group relative"
    >
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute left-3 top-3 flex flex-col gap-1.5">
            {off > 0 && <Badge variant="accent">-{off}%</Badge>}
            {!inStock && <Badge variant="secondary">Sold out</Badge>}
          </div>
          <button
            type="button"
            aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
            onClick={(e) => {
              e.preventDefault();
              toggleWish(product.id);
            }}
            className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-background/80 backdrop-blur transition-colors hover:bg-background"
          >
            <Heart className={cn("h-4 w-4", wished && "fill-accent text-accent")} />
          </button>

          {inStock && (
            <div className="absolute inset-x-3 bottom-3 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
              <Button onClick={quickAdd} size="sm" className="w-full">
                <ShoppingBag className="h-4 w-4" /> Quick add
              </Button>
            </div>
          )}
        </div>

        <div className="mt-3 space-y-1">
          {product.brandName && (
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {product.brandName}
            </p>
          )}
          <h3 className="line-clamp-1 text-sm font-medium">{product.name}</h3>
          <div className="flex items-center gap-2">
            <RatingStars rating={product.rating} />
            <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
          </div>
          <div className="flex items-center gap-2 pt-0.5">
            <span className="font-semibold">{formatPrice(product.price)}</span>
            {product.compareAtPrice && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
