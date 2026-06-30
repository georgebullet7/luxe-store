"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, Trash2, ShoppingBag, Tag } from "lucide-react";
import { toast } from "sonner";
import { useCartStore } from "@/store/cart-store";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

// Demo coupons — server-validated in production via /api/coupon
const COUPONS: Record<string, { type: "PERCENTAGE" | "FIXED"; value: number }> = {
  WELCOME10: { type: "PERCENTAGE", value: 10 },
  SAVE20: { type: "FIXED", value: 2000 },
};

export default function CartPage() {
  const { items, updateQuantity, removeItem, couponCode, applyCoupon } = useCartStore();
  const subtotal = useCartStore((s) => s.subtotal());
  const [code, setCode] = React.useState("");

  const discount = React.useMemo(() => {
    if (!couponCode) return 0;
    const c = COUPONS[couponCode];
    if (!c) return 0;
    return c.type === "PERCENTAGE" ? Math.round((subtotal * c.value) / 100) : Math.min(c.value, subtotal);
  }, [couponCode, subtotal]);

  const shipping = subtotal > 0 && subtotal < 10000 ? 800 : 0;
  const tax = Math.round((subtotal - discount) * 0.08);
  const total = Math.max(0, subtotal - discount) + shipping + tax;

  function handleCoupon() {
    const upper = code.trim().toUpperCase();
    if (COUPONS[upper]) {
      applyCoupon(upper);
      toast.success(`Coupon ${upper} applied`);
    } else {
      toast.error("Invalid coupon code");
    }
  }

  if (items.length === 0) {
    return (
      <div className="container flex flex-col items-center justify-center py-28 text-center">
        <ShoppingBag className="h-14 w-14 text-muted-foreground" />
        <h1 className="mt-6 text-2xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-muted-foreground">Looks like you haven&apos;t added anything yet.</p>
        <Button className="mt-8" size="lg" asChild><Link href="/shop">Start shopping</Link></Button>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <h1 className="text-2xl font-bold tracking-tight">Shopping cart</h1>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px]">
        <ul className="space-y-4">
          <AnimatePresence initial={false}>
            {items.map((item) => (
              <motion.li
                key={`${item.productId}-${item.variantId}`}
                layout
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex gap-4 rounded-xl border p-4"
              >
                <Link href={`/product/${item.slug}`} className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-muted">
                  <Image src={item.image} alt={item.name} fill sizes="96px" className="object-cover" />
                </Link>
                <div className="flex flex-1 flex-col">
                  <div className="flex justify-between gap-2">
                    <div>
                      <Link href={`/product/${item.slug}`} className="font-medium hover:underline">{item.name}</Link>
                      {item.variantName && <p className="text-sm text-muted-foreground">{item.variantName}</p>}
                    </div>
                    <button onClick={() => removeItem(item.productId, item.variantId)} className="text-muted-foreground hover:text-destructive" aria-label="Remove item">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-auto flex items-center justify-between pt-3">
                    <div className="flex items-center rounded-lg border">
                      <button className="grid h-8 w-8 place-items-center hover:bg-secondary" onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)} aria-label="Decrease">
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <button className="grid h-8 w-8 place-items-center hover:bg-secondary" onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)} aria-label="Increase">
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <p className="font-semibold">{formatPrice(item.unitPrice * item.quantity)}</p>
                  </div>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>

        <Card className="h-fit lg:sticky lg:top-20">
          <CardContent className="space-y-4 p-6">
            <h2 className="font-semibold">Order summary</h2>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Coupon code" className="pl-9" aria-label="Coupon code" />
              </div>
              <Button variant="outline" onClick={handleCoupon}>Apply</Button>
            </div>
            <p className="text-xs text-muted-foreground">Try <code className="font-mono">WELCOME10</code> or <code className="font-mono">SAVE20</code></p>

            <dl className="space-y-2 border-t pt-4 text-sm">
              <Row label="Subtotal" value={formatPrice(subtotal)} />
              {discount > 0 && <Row label={`Discount (${couponCode})`} value={`−${formatPrice(discount)}`} accent />}
              <Row label="Shipping" value={shipping === 0 ? "Free" : formatPrice(shipping)} />
              <Row label="Estimated tax" value={formatPrice(tax)} />
            </dl>
            <div className="flex items-center justify-between border-t pt-4 text-base font-semibold">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>

            <Button size="lg" className="w-full" asChild><Link href="/checkout">Proceed to checkout</Link></Button>
            <Button variant="ghost" className="w-full" asChild><Link href="/shop">Continue shopping</Link></Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={accent ? "text-accent" : ""}>{value}</dd>
    </div>
  );
}
