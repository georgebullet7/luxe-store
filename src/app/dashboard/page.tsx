import Link from "next/link";
import { Package, Heart, Truck, Wallet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { mockOrders, statusStyles } from "@/lib/mock-orders";
import { formatPrice, formatDate, cn } from "@/lib/utils";

export const metadata = { title: "Overview" };

export default function DashboardOverviewPage() {
  const totalSpent = mockOrders.reduce((s, o) => s + o.total, 0);
  const inTransit = mockOrders.filter(
    (o) => o.status === "SHIPPED" || o.status === "PROCESSING"
  ).length;

  const stats = [
    { label: "Total orders", value: String(mockOrders.length), icon: Package },
    { label: "In transit", value: String(inTransit), icon: Truck },
    { label: "Wishlist items", value: "—", icon: Heart, note: "synced on device" },
    { label: "Lifetime spend", value: formatPrice(totalSpent), icon: Wallet },
  ];

  const recent = [...mockOrders]
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))
    .slice(0, 3);

  return (
    <div className="space-y-8">
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="grid h-11 w-11 place-items-center rounded-lg bg-muted">
                <s.icon className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <p className="text-2xl font-semibold leading-none">{s.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent orders</h2>
          <Link
            href="/dashboard/orders"
            className="text-sm font-medium text-accent hover:underline"
          >
            View all
          </Link>
        </div>
        <Card>
          <CardContent className="divide-y p-0">
            {recent.map((o) => (
              <Link
                key={o.id}
                href="/dashboard/orders"
                className="flex items-center justify-between gap-4 p-4 transition-colors hover:bg-muted/50"
              >
                <div className="min-w-0">
                  <p className="font-medium">{o.orderNumber}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(o.date)} · {o.items.length} item
                    {o.items.length > 1 ? "s" : ""}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-xs font-medium",
                      statusStyles[o.status]
                    )}
                  >
                    {o.status}
                  </span>
                  <span className="font-semibold">{formatPrice(o.total)}</span>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
