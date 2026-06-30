import { Card, CardContent } from "@/components/ui/card";
import { products } from "@/lib/mock-data";

export const metadata = { title: "Inventory" };

export default function AdminInventoryPage() {
  const rows = products.flatMap((p) =>
    p.variants.map((v) => ({
      product: p.name,
      variant: v.name,
      sku: v.sku,
      stock: v.stock,
    }))
  );

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b text-left text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-medium">Product</th>
                <th className="px-5 py-3 font-medium">Variant</th>
                <th className="px-5 py-3 font-medium">SKU</th>
                <th className="px-5 py-3 font-medium">Stock</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((r) => {
                const status =
                  r.stock === 0
                    ? { label: "Out of stock", cls: "text-destructive" }
                    : r.stock < 20
                      ? {
                          label: "Low stock",
                          cls: "text-amber-600 dark:text-amber-400",
                        }
                      : {
                          label: "In stock",
                          cls: "text-emerald-600 dark:text-emerald-400",
                        };
                return (
                  <tr key={r.sku} className="hover:bg-muted/40">
                    <td className="px-5 py-3 font-medium">{r.product}</td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {r.variant}
                    </td>
                    <td className="px-5 py-3 font-mono text-xs">{r.sku}</td>
                    <td className="px-5 py-3">{r.stock}</td>
                    <td className={`px-5 py-3 font-medium ${status.cls}`}>
                      {status.label}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
