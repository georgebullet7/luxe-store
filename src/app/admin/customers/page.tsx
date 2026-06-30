import { Card, CardContent } from "@/components/ui/card";
import { mockOrders } from "@/lib/mock-orders";
import { formatPrice } from "@/lib/utils";

export const metadata = { title: "Customers" };

export default function AdminCustomersPage() {
  // Aggregate customers from orders.
  const byEmail = new Map<
    string,
    { name: string; email: string; orders: number; spent: number }
  >();
  for (const o of mockOrders) {
    const c = byEmail.get(o.customerEmail) ?? {
      name: o.customerName,
      email: o.customerEmail,
      orders: 0,
      spent: 0,
    };
    c.orders += 1;
    c.spent += o.total;
    byEmail.set(o.customerEmail, c);
  }
  const customers = [...byEmail.values()].sort((a, b) => b.spent - a.spent);

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b text-left text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Orders</th>
                <th className="px-5 py-3 text-right font-medium">
                  Lifetime value
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {customers.map((c) => (
                <tr key={c.email} className="hover:bg-muted/40">
                  <td className="px-5 py-3 font-medium">{c.name}</td>
                  <td className="px-5 py-3 text-muted-foreground">{c.email}</td>
                  <td className="px-5 py-3">{c.orders}</td>
                  <td className="px-5 py-3 text-right font-semibold">
                    {formatPrice(c.spent)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
