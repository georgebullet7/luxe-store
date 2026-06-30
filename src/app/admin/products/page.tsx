"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import { products as seedProducts } from "@/lib/mock-data";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/utils";

export default function AdminProductsPage() {
  const [rows, setRows] = useState(seedProducts);
  const [q, setQ] = useState("");

  const filtered = rows.filter((p) =>
    p.name.toLowerCase().includes(q.toLowerCase())
  );

  function remove(id: string) {
    setRows((r) => r.filter((p) => p.id !== id));
    toast.success("Product deleted (demo only)");
  }

  function stockOf(p: (typeof seedProducts)[number]) {
    return p.variants.reduce((s, v) => s + v.stock, 0);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products…"
            className="pl-9"
          />
        </div>
        <Button onClick={() => toast("Product editor is stubbed in the demo.")}>
          <Plus className="mr-1 h-4 w-4" /> New product
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b text-left text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 font-medium">Product</th>
                  <th className="px-5 py-3 font-medium">Category</th>
                  <th className="px-5 py-3 font-medium">Price</th>
                  <th className="px-5 py-3 font-medium">Stock</th>
                  <th className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((p) => {
                  const stock = stockOf(p);
                  return (
                    <tr key={p.id} className="hover:bg-muted/40">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative h-10 w-10 overflow-hidden rounded-md bg-muted">
                            <Image
                              src={p.images[0]}
                              alt={p.name}
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          </div>
                          <span className="font-medium">{p.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {p.categoryName}
                      </td>
                      <td className="px-5 py-3">{formatPrice(p.price)}</td>
                      <td className="px-5 py-3">
                        <span
                          className={
                            stock === 0
                              ? "text-destructive"
                              : stock < 20
                                ? "text-amber-600 dark:text-amber-400"
                                : "text-foreground"
                          }
                        >
                          {stock} in stock
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => toast("Edit is stubbed in the demo.")}
                            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"
                            aria-label={`Edit ${p.name}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => remove(p.id)}
                            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"
                            aria-label={`Delete ${p.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
