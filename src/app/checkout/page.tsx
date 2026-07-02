"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Banknote, Wallet, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useCartStore } from "@/store/cart-store";
import { getBrowserSupabase } from "@/lib/supabase-browser";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPrice, cn } from "@/lib/utils";
import { isValidLebanesePhone, normalizeLebanesePhone } from "@/lib/phone";

type PaySettings = {
  cod_enabled: boolean;
  prepaid_enabled: boolean;
  whish_number: string | null;
  omt_details: string | null;
  payment_instructions: string | null;
  delivery_fee: number;
  free_delivery_over: number | null;
};

const FALLBACK: PaySettings = {
  cod_enabled: true,
  prepaid_enabled: true,
  whish_number: null,
  omt_details: null,
  payment_instructions: null,
  delivery_fee: 0,
  free_delivery_over: null,
};

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.subtotal());
  const clear = useCartStore((s) => s.clear);

  const [cfg, setCfg] = useState<PaySettings>(FALLBACK);
  const [method, setMethod] = useState<"cod" | "prepaid">("cod");
  const [placing, setPlacing] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    city: "",
    address: "",
    notes: "",
  });

  useEffect(() => {
    (async () => {
      const sb = getBrowserSupabase();
      if (!sb) return;
      const { data } = await sb
        .from("site_settings")
        .select(
          "cod_enabled,prepaid_enabled,whish_number,omt_details,payment_instructions,delivery_fee,free_delivery_over"
        )
        .eq("id", "main")
        .maybeSingle();
      if (data) {
        setCfg({ ...FALLBACK, ...data });
        if (data.cod_enabled === false && data.prepaid_enabled) setMethod("prepaid");
      }
    })();
  }, []);

  const shipping =
    cfg.free_delivery_over != null && subtotal >= cfg.free_delivery_over
      ? 0
      : cfg.delivery_fee || 0;
  const total = subtotal + shipping;

  function set(k: keyof typeof form, v: string) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  async function placeOrder() {
    if (items.length === 0) return toast.error("Your cart is empty");
    if (!form.name.trim()) return toast.error("Please enter your name");
    if (!form.phone.trim()) return toast.error("Please enter your phone number");
    if (!isValidLebanesePhone(form.phone))
      return toast.error("Please enter a valid Lebanese mobile (e.g. 70 123 456)");
    if (!form.city.trim()) return toast.error("Please enter your city/area");
    if (!form.address.trim()) return toast.error("Please enter your address");

    const sb = getBrowserSupabase();
    if (!sb) return toast.error("Store isn't connected");

    setPlacing(true);
    try {
      const p_items = items.map((i) => ({
        product_id: i.productId,
        variant_id: i.variantId ?? null,
        quantity: i.quantity,
      }));
      const { data, error } = await sb.rpc("place_order", {
        p_items,
        p_customer: { ...form, phone: normalizeLebanesePhone(form.phone) },
        p_payment_method: method,
      });
      if (error) throw error;
      const orderNumber = (data as any)?.order_number ?? "";
      clear();
      router.push(
        `/checkout/success?order=${encodeURIComponent(orderNumber)}&pay=${method}`
      );
    } catch (e: any) {
      toast.error(e.message || "Could not place your order");
    } finally {
      setPlacing(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="container py-20 text-center">
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-muted-foreground">Add something to check out.</p>
        <Button className="mt-6" onClick={() => router.push("/shop")}>
          Browse products
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <h1 className="mb-8 text-2xl font-bold tracking-tight">Checkout</h1>
      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* Left: details + payment */}
        <div className="space-y-6">
          <Card>
            <CardContent className="space-y-4 p-5">
              <h2 className="text-lg font-semibold">Delivery details</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Full name">
                  <Input value={form.name} onChange={(e) => set("name", e.target.value)} />
                </Field>
                <Field label="Phone number">
                  <Input
                    inputMode="tel"
                    placeholder="e.g. 70 123 456"
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    className={cn(
                      form.phone.trim() &&
                        (isValidLebanesePhone(form.phone)
                          ? "border-emerald-500 focus-visible:ring-emerald-500"
                          : "border-destructive focus-visible:ring-destructive")
                    )}
                  />
                  {form.phone.trim() && !isValidLebanesePhone(form.phone) && (
                    <p className="text-xs text-destructive">
                      Enter a valid Lebanese mobile (03, 70, 71, 76, 78, 79, or 81 + 6 digits)
                    </p>
                  )}
                </Field>
                <Field label="City / area">
                  <Input value={form.city} onChange={(e) => set("city", e.target.value)} />
                </Field>
                <Field label="Address (building, street, floor)">
                  <Input value={form.address} onChange={(e) => set("address", e.target.value)} />
                </Field>
              </div>
              <Field label="Notes for delivery (optional)">
                <textarea
                  rows={2}
                  value={form.notes}
                  onChange={(e) => set("notes", e.target.value)}
                  className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </Field>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-3 p-5">
              <h2 className="text-lg font-semibold">Payment method</h2>

              {cfg.cod_enabled && (
                <PayOption
                  active={method === "cod"}
                  onClick={() => setMethod("cod")}
                  icon={<Banknote className="h-5 w-5" />}
                  title="Cash on delivery"
                  subtitle="Pay in cash when your order arrives."
                />
              )}

              {cfg.prepaid_enabled && (
                <PayOption
                  active={method === "prepaid"}
                  onClick={() => setMethod("prepaid")}
                  icon={<Wallet className="h-5 w-5" />}
                  title="Pay now by Whish / OMT"
                  subtitle="Send payment now; we deliver once confirmed."
                />
              )}

              {method === "prepaid" && (
                <div className="rounded-lg border bg-muted/40 p-4 text-sm">
                  <p className="font-medium">How to pay</p>
                  <ul className="mt-2 space-y-1 text-muted-foreground">
                    {cfg.whish_number && (
                      <li>
                        Whish to: <span className="font-medium text-foreground">{cfg.whish_number}</span>
                      </li>
                    )}
                    {cfg.omt_details && (
                      <li>
                        OMT: <span className="font-medium text-foreground">{cfg.omt_details}</span>
                      </li>
                    )}
                    <li>
                      Amount: <span className="font-medium text-foreground">{formatPrice(total)}</span>
                    </li>
                  </ul>
                  {cfg.payment_instructions && (
                    <p className="mt-2 text-muted-foreground">{cfg.payment_instructions}</p>
                  )}
                  <p className="mt-2 text-xs text-muted-foreground">
                    Place your order below, then send the payment. We&apos;ll confirm and deliver.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: summary */}
        <div>
          <Card className="lg:sticky lg:top-24">
            <CardContent className="p-5">
              <h2 className="mb-4 text-lg font-semibold">Your order</h2>
              <ul className="space-y-3">
                {items.map((i) => (
                  <li key={`${i.productId}-${i.variantId ?? ""}`} className="flex gap-3">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-muted">
                      {i.image && (
                        <Image src={i.image} alt={i.name} fill sizes="56px" className="object-cover" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{i.name}</p>
                      {i.variantName && (
                        <p className="text-xs text-muted-foreground">{i.variantName}</p>
                      )}
                      <p className="text-xs text-muted-foreground">Qty {i.quantity}</p>
                    </div>
                    <p className="text-sm font-medium">{formatPrice(i.unitPrice * i.quantity)}</p>
                  </li>
                ))}
              </ul>

              <div className="mt-4 space-y-1.5 border-t pt-4 text-sm">
                <Row label="Subtotal" value={formatPrice(subtotal)} />
                <Row
                  label="Delivery"
                  value={shipping === 0 ? "Free" : formatPrice(shipping)}
                />
                <div className="flex justify-between border-t pt-2 text-base font-semibold">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              <Button className="mt-5 w-full" size="lg" onClick={placeOrder} disabled={placing}>
                {placing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Placing order…
                  </>
                ) : (
                  "Place order"
                )}
              </Button>
              <p className="mt-2 text-center text-xs text-muted-foreground">
                {method === "cod"
                  ? "You'll pay cash when it arrives."
                  : "You'll send payment after placing the order."}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">{label}</label>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-muted-foreground">
      <span>{label}</span>
      <span className="text-foreground">{value}</span>
    </div>
  );
}

function PayOption({
  active,
  onClick,
  icon,
  title,
  subtitle,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors",
        active ? "border-primary bg-primary/5" : "hover:bg-muted/50"
      )}
    >
      <div
        className={cn(
          "grid h-10 w-10 place-items-center rounded-md",
          active ? "bg-primary text-primary-foreground" : "bg-muted"
        )}
      >
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
      <span
        className={cn(
          "grid h-5 w-5 place-items-center rounded-full border",
          active ? "border-primary" : "border-muted-foreground/40"
        )}
      >
        {active && <span className="h-2.5 w-2.5 rounded-full bg-primary" />}
      </span>
    </button>
  );
}
