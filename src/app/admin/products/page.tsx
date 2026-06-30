"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { Plus, Pencil, Trash2, Search, X, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getBrowserSupabase } from "@/lib/supabase-browser";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPrice, slugify } from "@/lib/utils";

type Variant = {
  id?: string;
  name: string;
  sku: string;
  size: string;
  color: string;
  stock: number;
};

type Cat = { id: string; name: string };
type Brand = { id: string; name: string };

type Row = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compare_at_price: number | null;
  images: string[];
  specifications: any;
  is_featured: boolean;
  is_active: boolean;
  category_id: string | null;
  brand_id: string | null;
  category?: { name: string } | null;
  variants?: Variant[];
};

const SELECT =
  "*, category:categories(name), variants:product_variants(id,name,sku,size,color,stock)";

export default function AdminProductsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [cats, setCats] = useState<Cat[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Row | null>(null);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    const sb = getBrowserSupabase();
    if (!sb) return;
    setLoading(true);
    const [{ data: prods }, { data: c }, { data: b }] = await Promise.all([
      sb.from("products").select(SELECT).order("created_at", { ascending: false }),
      sb.from("categories").select("id,name").order("name"),
      sb.from("brands").select("id,name").order("name"),
    ]);
    setRows((prods as Row[]) ?? []);
    setCats((c as Cat[]) ?? []);
    setBrands((b as Brand[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = rows.filter((p) =>
    p.name.toLowerCase().includes(q.toLowerCase())
  );

  async function remove(p: Row) {
    if (!confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    const sb = getBrowserSupabase();
    const { error } = await sb!.from("products").delete().eq("id", p.id);
    if (error) return toast.error("Couldn't delete: " + error.message);
    toast.success("Product deleted");
    load();
  }

  function stockOf(p: Row) {
    return (p.variants ?? []).reduce((s, v) => s + (v.stock ?? 0), 0);
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
        <Button onClick={() => setCreating(true)}>
          <Plus className="mr-1 h-4 w-4" /> New product
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-10 text-center text-muted-foreground">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center text-muted-foreground">
              No products yet. Click “New product” to add one.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b text-left text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3 font-medium">Product</th>
                    <th className="px-5 py-3 font-medium">Category</th>
                    <th className="px-5 py-3 font-medium">Price</th>
                    <th className="px-5 py-3 font-medium">Stock</th>
                    <th className="px-5 py-3 font-medium">Status</th>
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
                              {p.images?.[0] && (
                                <Image
                                  src={p.images[0]}
                                  alt={p.name}
                                  fill
                                  sizes="40px"
                                  className="object-cover"
                                />
                              )}
                            </div>
                            <span className="font-medium">{p.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-muted-foreground">
                          {p.category?.name ?? "—"}
                        </td>
                        <td className="px-5 py-3">{formatPrice(p.price)}</td>
                        <td className="px-5 py-3">
                          <span
                            className={
                              stock === 0
                                ? "text-destructive"
                                : stock < 20
                                  ? "text-amber-600 dark:text-amber-400"
                                  : ""
                            }
                          >
                            {stock}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className={
                              "rounded-full px-2.5 py-0.5 text-xs font-medium " +
                              (p.is_active
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                : "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300")
                            }
                          >
                            {p.is_active ? "Active" : "Hidden"}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex justify-end gap-1">
                            <button
                              onClick={() => setEditing(p)}
                              className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"
                              aria-label={`Edit ${p.name}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => remove(p)}
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
          )}
        </CardContent>
      </Card>

      {(creating || editing) && (
        <ProductForm
          product={editing}
          cats={cats}
          brands={brands}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSaved={() => {
            setCreating(false);
            setEditing(null);
            load();
          }}
        />
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────
//  Product create / edit form (modal)
// ────────────────────────────────────────────────────────────
function ProductForm({
  product,
  cats,
  brands,
  onClose,
  onSaved,
}: {
  product: Row | null;
  cats: Cat[];
  brands: Brand[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(product?.name ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [price, setPrice] = useState(
    product ? (product.price / 100).toString() : ""
  );
  const [compareAt, setCompareAt] = useState(
    product?.compare_at_price ? (product.compare_at_price / 100).toString() : ""
  );
  const [categoryId, setCategoryId] = useState(product?.category_id ?? "");
  const [brandId, setBrandId] = useState(product?.brand_id ?? "");
  const [isFeatured, setIsFeatured] = useState(product?.is_featured ?? false);
  const [isActive, setIsActive] = useState(product?.is_active ?? true);
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [variants, setVariants] = useState<Variant[]>(
    product?.variants?.length
      ? product.variants.map((v) => ({
          id: v.id,
          name: v.name,
          sku: v.sku,
          size: v.size ?? "",
          color: v.color ?? "",
          stock: v.stock ?? 0,
        }))
      : [{ name: "Default", sku: "", size: "", color: "", stock: 0 }]
  );
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    const sb = getBrowserSupabase();
    if (!sb) return;
    setUploading(true);
    try {
      const slug = slugify(name || "product");
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        const safe = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
        const path = `${slug}/${Date.now()}-${safe}`;
        const { error } = await sb.storage
          .from("product-images")
          .upload(path, file, { upsert: false });
        if (error) {
          toast.error("Upload failed: " + error.message);
          continue;
        }
        const { data } = sb.storage.from("product-images").getPublicUrl(path);
        urls.push(data.publicUrl);
      }
      setImages((prev) => [...prev, ...urls]);
    } finally {
      setUploading(false);
    }
  }

  function setVariant(i: number, patch: Partial<Variant>) {
    setVariants((vs) => vs.map((v, idx) => (idx === i ? { ...v, ...patch } : v)));
  }

  async function save() {
    if (!name.trim()) return toast.error("Name is required");
    if (!categoryId) return toast.error("Please pick a category");
    const priceCents = Math.round(parseFloat(price || "0") * 100);
    if (!priceCents || priceCents < 0) return toast.error("Enter a valid price");

    const sb = getBrowserSupabase();
    if (!sb) return;
    setSaving(true);
    try {
      const slug = slugify(name);
      const payload = {
        name: name.trim(),
        slug,
        description: description.trim(),
        price: priceCents,
        compare_at_price: compareAt
          ? Math.round(parseFloat(compareAt) * 100)
          : null,
        images,
        is_featured: isFeatured,
        is_active: isActive,
        category_id: categoryId,
        brand_id: brandId || null,
        specifications: product?.specifications ?? {},
      };

      let productId = product?.id;

      if (product) {
        const { error } = await sb
          .from("products")
          .update(payload)
          .eq("id", product.id);
        if (error) throw error;
      } else {
        const { data, error } = await sb
          .from("products")
          .insert(payload)
          .select("id")
          .single();
        if (error) throw error;
        productId = data.id;
      }

      // Sync variants: delete existing, re-insert current.
      if (product) {
        await sb.from("product_variants").delete().eq("product_id", product.id);
      }
      const rows = variants
        .filter((v) => v.name.trim())
        .map((v, i) => ({
          product_id: productId,
          name: v.name.trim(),
          sku: (v.sku.trim() || `${slug}-${i + 1}`).toUpperCase(),
          size: v.size.trim() || null,
          color: v.color.trim() || null,
          stock: Number(v.stock) || 0,
        }));
      if (rows.length) {
        const { error } = await sb.from("product_variants").insert(rows);
        if (error) throw error;
      }

      toast.success(product ? "Product updated" : "Product created");
      onSaved();
    } catch (e: any) {
      toast.error(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4">
      <div className="my-8 w-full max-w-2xl rounded-2xl border bg-card shadow-soft-lg">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold">
            {product ? "Edit product" : "New product"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 p-6">
          <Field label="Name">
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </Field>

          <Field label="Description">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Price ($)">
              <Input
                inputMode="decimal"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="249.00"
              />
            </Field>
            <Field label="Compare-at price ($, optional)">
              <Input
                inputMode="decimal"
                value={compareAt}
                onChange={(e) => setCompareAt(e.target.value)}
                placeholder="299.00"
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Category">
              <Select value={categoryId} onChange={setCategoryId}>
                <option value="">Select…</option>
                {cats.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Brand (optional)">
              <Select value={brandId} onChange={setBrandId}>
                <option value="">None</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="h-4 w-4"
              />
              Featured on homepage
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4"
              />
              Active (visible in store)
            </label>
          </div>

          {/* Images */}
          <Field label="Photos">
            <div className="flex flex-wrap gap-3">
              {images.map((url, i) => (
                <div
                  key={i}
                  className="relative h-20 w-20 overflow-hidden rounded-lg border bg-muted"
                >
                  <Image src={url} alt="" fill sizes="80px" className="object-cover" />
                  <button
                    onClick={() => setImages((p) => p.filter((_, idx) => idx !== i))}
                    className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-black/60 text-white"
                    aria-label="Remove photo"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <label className="grid h-20 w-20 cursor-pointer place-items-center rounded-lg border border-dashed text-muted-foreground hover:bg-muted">
                {uploading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Upload className="h-5 w-5" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleUpload(e.target.files)}
                />
              </label>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              First photo is the main image. Uploads save to your store storage.
            </p>
          </Field>

          {/* Variants */}
          <Field label="Variants & stock">
            <div className="space-y-2">
              {variants.map((v, i) => (
                <div key={i} className="grid grid-cols-12 gap-2">
                  <Input
                    className="col-span-4"
                    placeholder="Name (e.g. Black / Large)"
                    value={v.name}
                    onChange={(e) => setVariant(i, { name: e.target.value })}
                  />
                  <Input
                    className="col-span-4"
                    placeholder="SKU (optional)"
                    value={v.sku}
                    onChange={(e) => setVariant(i, { sku: e.target.value })}
                  />
                  <Input
                    className="col-span-3"
                    inputMode="numeric"
                    placeholder="Stock"
                    value={String(v.stock)}
                    onChange={(e) =>
                      setVariant(i, { stock: Number(e.target.value) || 0 })
                    }
                  />
                  <button
                    onClick={() =>
                      setVariants((vs) => vs.filter((_, idx) => idx !== i))
                    }
                    className="col-span-1 grid place-items-center rounded-md text-muted-foreground hover:bg-muted"
                    aria-label="Remove variant"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={() =>
                  setVariants((vs) => [
                    ...vs,
                    { name: "", sku: "", size: "", color: "", stock: 0 },
                  ])
                }
                className="text-sm font-medium text-accent hover:underline"
              >
                + Add variant
              </button>
            </div>
          </Field>
        </div>

        <div className="flex items-center justify-end gap-2 border-t px-6 py-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save} disabled={saving || uploading}>
            {saving ? "Saving…" : product ? "Save changes" : "Create product"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">{label}</label>
      {children}
    </div>
  );
}

function Select({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {children}
    </select>
  );
}
