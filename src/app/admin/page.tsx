import { DollarSign, ShoppingBag, Users, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { SalesChart } from "@/components/sales-chart";
import { mockOrders, salesSeries, statusStyles } from "@/lib/mock-orders";
import { formatPrice, formatDate, cn } from "@/lib/utils";

export const metadata = { title: "Analytics" };

export default function AdminOverviewPage() {
  const revenue = salesSeries.reduce((s, d) => s + d.revenue, 0);
  const uniqueCustomers = new Set(mockOrders.map((o) => o.customerEmail)).size;
  const aov = Math.round(
    mockOrders.reduce((s, o) => s + o.total, 0) / mockOrders.length
  );

  const stats = [
    { label: "Revenue (30d)", value: formatPrice(revenue), icon: DollarSign, delta: "+18.2%" },
    { label: "Orders", value: String(mockOrders.length), icon: ShoppingBag, delta: "+4.1%" },
    { label: "Customers", value: String(uniqueCustomers), icon: Users, delta: "+2" },
    { label: "Avg. order value", value: formatPrice(aov), icon: TrendingUp, delta: "+6.7%" },
  ];

  const recent = [...mockOrders].sort(
    (a, b) => +new Date(b.date) - +new Date(a.date)
  );

  return (
    <div className="space-y-8">
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-muted">
                  <s.icon className="h-5 w-5" />
                </div>
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  {s.delta}
                </span>
              </div>
              <p className="mt-3 text-2xl font-semibold leading-none">
                {s.value}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <Card>
        <CardContent className="p-5">
          <h2 className="mb-4 text-lg font-semibold">Revenue</h2>
          <SalesChart data={salesSeries} />
        </CardContent>
      </Card>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Latest orders</h2>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b text-left text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3 font-medium">Order</th>
                    <th className="px-5 py-3 font-medium">Customer</th>
                    <th className="px-5 py-3 font-medium">Date</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 text-right font-medium">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {recent.map((o) => (
                    <tr key={o.id} className="hover:bg-muted/40">
                      <td className="px-5 py-3 font-medium">{o.orderNumber}</td>
                      <td className="px-5 py-3">
                        <div>{o.customerName}</div>
                        <div className="text-xs text-muted-foreground">
                          {o.customerEmail}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {formatDate(o.date)}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={cn(
                            "rounded-full px-2.5 py-0.5 text-xs font-medium",
                            statusStyles[o.status]
                          )}
                        >
                          {o.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right font-semibold">
                        {formatPrice(o.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
