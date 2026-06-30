"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  mockOrders,
  statusStyles,
  type OrderStatus,
} from "@/lib/mock-orders";
import { formatPrice, formatDate, cn } from "@/lib/utils";

const FILTERS: ("ALL" | OrderStatus)[] = [
  "ALL",
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
];

export default function AdminOrdersPage() {
  const [filter, setFilter] = useState<"ALL" | OrderStatus>("ALL");
  const orders = mockOrders
    .filter((o) => filter === "ALL" || o.status === filter)
    .sort((a, b) => +new Date(b.date) - +new Date(a.date));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-full px-3 py-1 text-sm font-medium transition-colors",
              filter === f
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            )}
          >
            {f === "ALL" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b text-left text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 font-medium">Order</th>
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium">Items</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-muted/40">
                    <td className="px-5 py-3 font-medium">{o.orderNumber}</td>
                    <td className="px-5 py-3">{o.customerName}</td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {o.items.reduce((s, i) => s + i.quantity, 0)}
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
                {orders.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-10 text-center text-muted-foreground"
                    >
                      No orders with this status.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
