"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Phone, MapPin, Truck, Bike, RefreshCw } from "lucide-react";
import { getBrowserSupabase } from "@/lib/supabase-browser";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatPrice, formatDate, cn } from "@/lib/utils";

type Item = {
  id: string;
  name: string;
  variant_name: string | null;
  quantity: number;
  unit_price: number;
};
type Order = {
  id: string;
  order_number: string;
  created_at: string;
  status: string;
  paid: boolean;
  payment_method: string | null;
  fulfillment: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  city: string | null;
  notes: string | null;
  total: number;
  shipping_address: any;
  items: Item[];
};

const STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

const statusStyle: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  shipped: "bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300",
  delivered: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  cancelled: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [lane, setLane] = useState<"all" | "self" | "courier">("all");

  const load = useCallback(async () => {
    const sb = getBrowserSupabase();
    if (!sb) return;
    setLoading(true);
    const { data } = await sb
      .from("orders")
      .select("*, items:order_items(id,name,variant_name,quantity,unit_price)")
      .order("created_at", { ascending: false });
    setOrders((data as Order[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const shown = orders.filter((o) =>
    lane === "all" ? true : o.fulfillment === lane
  );

  async function update(id: string, patch: Partial<Order>) {
    const sb = getBrowserSupabase();
    const { error } = await sb!.from("orders").update(patch).eq("id", id);
    if (error) return toast.error(error.message);
    setOrders((os) => os.map((o) => (o.id === id ? { ...o, ...patch } : o)));
    toast.success("Order updated");
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1">
          <Tab active={lane === "all"} onClick={() => setLane("all")}>
            All
          </Tab>
          <Tab active={lane === "self"} onClick={() => setLane("self")}>
            <Bike className="mr-1 inline h-3.5 w-3.5" /> My delivery
          </Tab>
          <Tab active={lane === "courier"} onClick={() => setLane("courier")}>
            <Truck className="mr-1 inline h-3.5 w-3.5" /> Courier (COD)
          </Tab>
        </div>
        <Button variant="outline" size="sm" onClick={load}>
          <RefreshCw className="mr-1 h-4 w-4" /> Refresh
        </Button>
      </div>

      {loading ? (
        <div className="py-16 text-center text-muted-foreground">Loading…</div>
      ) : shown.length === 0 ? (
        <div className="rounded-xl border border-dashed py-16 text-center text-muted-foreground">
          No orders here yet.
        </div>
      ) : (
        <div className="space-y-4">
          {shown.map((o) => (
            <Card key={o.id}>
              <CardContent className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{o.order_number}</span>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-xs font-medium",
                          statusStyle[o.status] ?? "bg-muted"
                        )}
                      >
                        {o.status}
                      </span>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                        {o.payment_method === "prepaid" ? "Prepaid" : "COD"}
                      </span>
                      {o.payment_method === "prepaid" && (
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-xs font-medium",
                            o.paid
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                              : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                          )}
                        >
                          {o.paid ? "Paid" : "Awaiting payment"}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatDate(o.created_at)} ·{" "}
                      {o.fulfillment === "self" ? "Deliver yourself" : "Send to courier"}
                    </p>
                  </div>
                  <p className="text-lg font-semibold">{formatPrice(o.total)}</p>
                </div>

                <div className="grid gap-4 py-3 sm:grid-cols-2">
                  <div className="text-sm">
                    <p className="font-medium">{o.customer_name}</p>
                    {o.customer_phone && (
                      <a
                        href={`tel:${o.customer_phone}`}
                        className="mt-1 flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
                      >
                        <Phone className="h-3.5 w-3.5" /> {o.customer_phone}
                      </a>
                    )}
                    <p className="mt-1 flex items-start gap-1.5 text-muted-foreground">
                      <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      <span>
                        {o.city}
                        {o.shipping_address?.address ? `, ${o.shipping_address.address}` : ""}
                      </span>
                    </p>
                    {o.notes && (
                      <p className="mt-1 text-xs italic text-muted-foreground">“{o.notes}”</p>
                    )}
                  </div>

                  <ul className="space-y-1 text-sm">
                    {o.items?.map((it) => (
                      <li key={it.id} className="flex justify-between gap-2">
                        <span className="text-muted-foreground">
                          {it.quantity}× {it.name}
                          {it.variant_name ? ` (${it.variant_name})` : ""}
                        </span>
                        <span>{formatPrice(it.unit_price * it.quantity)}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-wrap items-center gap-2 border-t pt-3">
                  {o.payment_method === "prepaid" && !o.paid && (
                    <Button
                      size="sm"
                      onClick={() => update(o.id, { paid: true, status: "confirmed" })}
                    >
                      Mark paid
                    </Button>
                  )}
                  <label className="text-sm text-muted-foreground">Status:</label>
                  <select
                    value={o.status}
                    onChange={(e) => update(o.id, { status: e.target.value })}
                    className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function Tab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full px-3 py-1 text-sm font-medium transition-colors",
        active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
      )}
    >
      {children}
    </button>
  );
}
