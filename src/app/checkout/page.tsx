"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, CreditCard, MapPin, ClipboardCheck, Lock } from "lucide-react";
import { toast } from "sonner";
import { addressSchema, type AddressInput } from "@/lib/validations";
import { useCartStore } from "@/store/cart-store";
import { formatPrice, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

const steps = [
  { id: 1, label: "Shipping", icon: MapPin },
  { id: 2, label: "Payment", icon: CreditCard },
  { id: 3, label: "Review", icon: ClipboardCheck },
];

export default function CheckoutPage() {
  const [step, setStep] = React.useState(1);
  const [submitting, setSubmitting] = React.useState(false);
  const { items, clear } = useCartStore();
  const subtotal = useCartStore((s) => s.subtotal());
  const [shipping, setShipping] = React.useState<AddressInput | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<AddressInput>({
    resolver: zodResolver(addressSchema),
    defaultValues: { country: "Lebanon" },
  });

  const tax = Math.round(subtotal * 0.08);
  const shippingFee = subtotal > 0 && subtotal < 10000 ? 800 : 0;
  const total = subtotal + tax + shippingFee;

  if (items.length === 0) {
    return (
      <div className="container py-28 text-center">
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
        <Button className="mt-6" asChild><Link href="/shop">Shop now</Link></Button>
      </div>
    );
  }

  function onShippingSubmit(data: AddressInput) {
    setShipping(data);
    setStep(2);
  }

  async function placeOrder() {
    setSubmitting(true);
    try {
      // In production: POST /api/checkout -> create Stripe Checkout Session,
      // then redirect to the returned session.url. Demo simulates success:
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, shipping }),
      }).catch(() => null);

      await new Promise((r) => setTimeout(r, 900));
      if (res && res.ok) {
        const data = await res.json().catch(() => null);
        if (data?.url) { window.location.href = data.url; return; }
      }
      clear();
      toast.success("Order placed! Confirmation sent to your email.");
      window.location.href = "/checkout/success";
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container py-10">
      <h1 className="text-2xl font-bold tracking-tight">Checkout</h1>

      {/* Stepper */}
      <ol className="mt-6 flex items-center gap-4">
        {steps.map((s, i) => (
          <React.Fragment key={s.id}>
            <li className="flex items-center gap-2">
              <span className={cn("grid h-9 w-9 place-items-center rounded-full border text-sm font-medium", step >= s.id ? "border-primary bg-primary text-primary-foreground" : "text-muted-foreground")}>
                {step > s.id ? <Check className="h-4 w-4" /> : s.id}
              </span>
              <span className={cn("text-sm font-medium", step >= s.id ? "" : "text-muted-foreground")}>{s.label}</span>
            </li>
            {i < steps.length - 1 && <span className="h-px flex-1 bg-border" />}
          </React.Fragment>
        ))}
      </ol>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px]">
        <div>
          {step === 1 && (
            <form onSubmit={handleSubmit(onShippingSubmit)} className="space-y-4">
              <h2 className="font-semibold">Shipping address</h2>
              <Field label="Full name" error={errors.fullName?.message}><Input {...register("fullName")} /></Field>
              <Field label="Phone" error={errors.phone?.message}><Input {...register("phone")} /></Field>
              <Field label="Address line 1" error={errors.line1?.message}><Input {...register("line1")} /></Field>
              <Field label="Address line 2 (optional)"><Input {...register("line2")} /></Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="City" error={errors.city?.message}><Input {...register("city")} /></Field>
                <Field label="Postal code" error={errors.postalCode?.message}><Input {...register("postalCode")} /></Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="State / Region"><Input {...register("state")} /></Field>
                <Field label="Country" error={errors.country?.message}><Input {...register("country")} /></Field>
              </div>
              <Button type="submit" size="lg" className="w-full">Continue to payment</Button>
            </form>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="font-semibold">Payment</h2>
              <Card>
                <CardContent className="space-y-4 p-6">
                  <div className="flex items-center gap-2 rounded-lg border bg-secondary/40 p-3 text-sm">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                    Payments are processed securely by Stripe. Card details never touch our servers.
                  </div>
                  <Field label="Card number"><Input placeholder="4242 4242 4242 4242" /></Field>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Expiry"><Input placeholder="MM / YY" /></Field>
                    <Field label="CVC"><Input placeholder="123" /></Field>
                  </div>
                  <p className="text-xs text-muted-foreground">Demo only — wire to Stripe Elements / Checkout in production.</p>
                </CardContent>
              </Card>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>Back</Button>
                <Button className="flex-1" onClick={() => setStep(3)}>Review order</Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="font-semibold">Review &amp; confirm</h2>
              {shipping && (
                <Card><CardContent className="p-6 text-sm">
                  <p className="font-medium">{shipping.fullName}</p>
                  <p className="text-muted-foreground">{shipping.line1}{shipping.line2 ? `, ${shipping.line2}` : ""}</p>
                  <p className="text-muted-foreground">{shipping.city}, {shipping.postalCode}, {shipping.country}</p>
                  <p className="text-muted-foreground">{shipping.phone}</p>
                </CardContent></Card>
              )}
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setStep(2)}>Back</Button>
                <Button variant="accent" className="flex-1" onClick={placeOrder} disabled={submitting}>
                  {submitting ? "Processing..." : `Pay ${formatPrice(total)}`}
                </Button>
              </div>
            </div>
          )}
        </div>

        <Card className="h-fit lg:sticky lg:top-20">
          <CardContent className="space-y-4 p-6">
            <h2 className="font-semibold">Your order</h2>
            <ul className="space-y-3">
              {items.map((item) => (
                <li key={`${item.productId}-${item.variantId}`} className="flex gap-3">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                    <Image src={item.image} alt={item.name} fill sizes="56px" className="object-cover" />
                  </div>
                  <div className="flex-1 text-sm">
                    <p className="line-clamp-1 font-medium">{item.name}</p>
                    <p className="text-muted-foreground">Qty {item.quantity}</p>
                  </div>
                  <p className="text-sm font-medium">{formatPrice(item.unitPrice * item.quantity)}</p>
                </li>
              ))}
            </ul>
            <dl className="space-y-2 border-t pt-4 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd>{formatPrice(subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Shipping</dt><dd>{shippingFee === 0 ? "Free" : formatPrice(shippingFee)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Tax</dt><dd>{formatPrice(tax)}</dd></div>
            </dl>
            <div className="flex justify-between border-t pt-4 font-semibold"><span>Total</span><span>{formatPrice(total)}</span></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-destructive">{error}</span>}
    </label>
  );
}
