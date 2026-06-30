import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Coupons" };

// These mirror the demo coupons honored on the cart page.
const coupons = [
  {
    code: "WELCOME10",
    type: "PERCENTAGE" as const,
    value: 10,
    active: true,
    used: 142,
    limit: 1000,
  },
  {
    code: "SAVE20",
    type: "FIXED" as const,
    value: 2000,
    active: true,
    used: 38,
    limit: 200,
  },
  {
    code: "SUMMER25",
    type: "PERCENTAGE" as const,
    value: 25,
    active: false,
    used: 512,
    limit: 500,
  },
];

export default function AdminCouponsPage() {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b text-left text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-medium">Code</th>
                <th className="px-5 py-3 font-medium">Discount</th>
                <th className="px-5 py-3 font-medium">Usage</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {coupons.map((c) => (
                <tr key={c.code} className="hover:bg-muted/40">
                  <td className="px-5 py-3 font-mono font-medium">{c.code}</td>
                  <td className="px-5 py-3">
                    {c.type === "PERCENTAGE"
                      ? `${c.value}% off`
                      : `$${(c.value / 100).toFixed(0)} off`}
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">
                    {c.used} / {c.limit}
                  </td>
                  <td className="px-5 py-3">
                    <Badge variant={c.active ? "accent" : "secondary"}>
                      {c.active ? "Active" : "Expired"}
                    </Badge>
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
