import Image from "next/image";
import { Truck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { mockOrders, statusStyles } from "@/lib/mock-orders";
import { formatPrice, formatDate, cn } from "@/lib/utils";

export const metadata = { title: "Orders" };

export default function OrdersPage() {
  const orders = [...mockOrders].sort(
    (a, b) => +new Date(b.date) - +new Date(a.date)
  );

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Order history</h2>
      {orders.map((o) => (
        <Card key={o.id}>
          <CardContent className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
              <div>
                <p className="font-semibold">{o.orderNumber}</p>
                <p className="text-xs text-muted-foreground">
                  Placed {formatDate(o.date)}
                </p>
              </div>
              <span
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-xs font-medium",
                  statusStyles[o.status]
                )}
              >
                {o.status}
              </span>
            </div>

            <ul className="divide-y">
              {o.items.map((it, i) => (
                <li key={i} className="flex items-center gap-4 py-4">
                  <div className="relative h-16 w-16 overflow-hidden rounded-md bg-muted">
                    <Image
                      src={it.image}
                      alt={it.name}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{it.name}</p>
                    {it.variantName && (
                      <p className="text-xs text-muted-foreground">
                        {it.variantName}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Qty {it.quantity}
                    </p>
                  </div>
                  <p className="font-medium">
                    {formatPrice(it.unitPrice * it.quantity)}
                  </p>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
              {o.trackingNumber ? (
                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Truck className="h-4 w-4" />
                  Tracking: <span className="font-mono">{o.trackingNumber}</span>
                </p>
              ) : (
                <span className="text-xs text-muted-foreground">
                  Tracking available once shipped
                </span>
              )}
              <p className="text-sm">
                Total{" "}
                <span className="font-semibold">{formatPrice(o.total)}</span>
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
