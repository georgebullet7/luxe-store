import type { Product, Category, Review, ShopFilters, SortOption } from "./types";
import { supabase, PRODUCT_SELECT } from "./supabase";
import {
  products as mockProducts,
  categories as mockCategories,
  brands as mockBrands,
  reviewsByProduct,
} from "./mock-data";

/*
 * DATA ACCESS LAYER
 * ─────────────────
 * Reads the catalog from Supabase when configured (NEXT_PUBLIC_SUPABASE_URL +
 * NEXT_PUBLIC_SUPABASE_ANON_KEY). If those env vars aren't set, every function
 * falls back to the bundled demo data so the site always works.
 *
 * Pages/components never import this file's internals — they only call these
 * functions and receive the framework-agnostic types from ./types.
 */

const PAGE_SIZE = 6;

// ── Row → domain mapping ────────────────────────────────────
function mapProduct(row: any): Product {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? "",
    price: row.price ?? 0,
    compareAtPrice: row.compare_at_price ?? null,
    images: row.images ?? [],
    specifications: row.specifications ?? {},
    isFeatured: Boolean(row.is_featured),
    rating: Number(row.rating) || 0,
    reviewCount: row.review_count ?? 0,
    categorySlug: row.category?.slug ?? "",
    categoryName: row.category?.name ?? "",
    brandName: row.brand?.name ?? null,
    variants: (row.variants ?? []).map((v: any) => ({
      id: v.id,
      name: v.name,
      sku: v.sku,
      size: v.size ?? null,
      color: v.color ?? null,
      priceDelta: v.price_delta ?? 0,
      stock: v.stock ?? 0,
    })),
  };
}

function mapReview(row: any): Review {
  return {
    id: row.id,
    author: row.author,
    avatarUrl: null,
    rating: row.rating,
    title: row.title ?? null,
    comment: row.comment,
    isVerified: Boolean(row.is_verified),
    createdAt: row.created_at,
  };
}

// ── Featured ────────────────────────────────────────────────
export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  if (!supabase) return mockProducts.filter((p) => p.isFeatured).slice(0, limit);
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("is_active", true)
    .eq("is_featured", true)
    .limit(limit);
  if (error || !data) return [];
  return data.map(mapProduct);
}

// ── Best sellers ────────────────────────────────────────────
export async function getBestSellers(limit = 4): Promise<Product[]> {
  if (!supabase)
    return [...mockProducts].sort((a, b) => b.reviewCount - a.reviewCount).slice(0, limit);
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("is_active", true)
    .order("review_count", { ascending: false })
    .limit(limit);
  if (error || !data) return [];
  return data.map(mapProduct);
}

// ── Single product ──────────────────────────────────────────
export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (!supabase) return mockProducts.find((p) => p.slug === slug) ?? null;
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("slug", slug)
    .maybeSingle();
  if (error || !data) return null;
  return mapProduct(data);
}

// ── Related products ────────────────────────────────────────
export async function getRelatedProducts(slug: string, limit = 4): Promise<Product[]> {
  if (!supabase) {
    const current = mockProducts.find((p) => p.slug === slug);
    if (!current) return [];
    return mockProducts
      .filter((p) => p.slug !== slug && p.categorySlug === current.categorySlug)
      .slice(0, limit);
  }
  const { data: current } = await supabase
    .from("products")
    .select("category_id")
    .eq("slug", slug)
    .maybeSingle();
  if (!current?.category_id) return [];
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("is_active", true)
    .eq("category_id", current.category_id)
    .neq("slug", slug)
    .limit(limit);
  if (error || !data) return [];
  return data.map(mapProduct);
}

// ── Categories (with product counts) ────────────────────────
export async function getCategories(): Promise<Category[]> {
  if (!supabase) return mockCategories;
  const { data, error } = await supabase
    .from("categories")
    .select("id,name,slug,description,image_url")
    .order("sort_order", { ascending: true });
  if (error || !data) return [];

  // Tally active products per category in one extra query.
  const counts: Record<string, number> = {};
  const { data: prods } = await supabase
    .from("products")
    .select("category_id")
    .eq("is_active", true);
  for (const p of prods ?? []) {
    if (p.category_id) counts[p.category_id] = (counts[p.category_id] ?? 0) + 1;
  }

  return data.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description ?? null,
    imageUrl: c.image_url ?? null,
    productCount: counts[c.id] ?? 0,
  }));
}

// ── Brands (names) ──────────────────────────────────────────
export async function getBrands(): Promise<string[]> {
  if (!supabase) return mockBrands;
  const { data, error } = await supabase.from("brands").select("name").order("name");
  if (error || !data) return [];
  return data.map((b) => b.name);
}

// ── Reviews ─────────────────────────────────────────────────
export async function getReviews(productId: string): Promise<Review[]> {
  if (!supabase) return reviewsByProduct[productId] ?? [];
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("product_id", productId)
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data.map(mapReview);
}

// ── Search / filter / sort / paginate ───────────────────────
function applySort(query: any, sort: SortOption = "featured") {
  switch (sort) {
    case "price-asc":
      return query.order("price", { ascending: true });
    case "price-desc":
      return query.order("price", { ascending: false });
    case "rating":
      return query.order("rating", { ascending: false });
    case "newest":
      return query.order("created_at", { ascending: false });
    default:
      return query
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false });
  }
}

export async function searchProducts(filters: ShopFilters) {
  if (!supabase) return searchMock(filters);

  let q = supabase
    .from("products")
    .select(PRODUCT_SELECT, { count: "exact" })
    .eq("is_active", true);

  if (filters.query) {
    const term = filters.query.replace(/[%,]/g, " ");
    q = q.or(`name.ilike.%${term}%,description.ilike.%${term}%`);
  }

  if (filters.category) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", filters.category)
      .maybeSingle();
    if (!cat) return { items: [], total: 0, page: 1, totalPages: 1, pageSize: PAGE_SIZE };
    q = q.eq("category_id", cat.id);
  }

  if (filters.brands?.length) {
    const { data: bs } = await supabase
      .from("brands")
      .select("id")
      .in("name", filters.brands);
    const ids = (bs ?? []).map((b) => b.id);
    if (ids.length === 0)
      return { items: [], total: 0, page: 1, totalPages: 1, pageSize: PAGE_SIZE };
    q = q.in("brand_id", ids);
  }

  if (typeof filters.minPrice === "number") q = q.gte("price", filters.minPrice * 100);
  if (typeof filters.maxPrice === "number") q = q.lte("price", filters.maxPrice * 100);
  if (filters.minRating) q = q.gte("rating", filters.minRating);

  q = applySort(q, filters.sort);

  const page = Math.max(1, filters.page ?? 1);
  const from = (page - 1) * PAGE_SIZE;
  q = q.range(from, from + PAGE_SIZE - 1);

  const { data, count, error } = await q;
  if (error || !data) return { items: [], total: 0, page, totalPages: 1, pageSize: PAGE_SIZE };

  const total = count ?? 0;
  return {
    items: data.map(mapProduct),
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    pageSize: PAGE_SIZE,
  };
}

// ── Autocomplete ────────────────────────────────────────────
export async function autocomplete(query: string, limit = 5): Promise<Product[]> {
  if (!query.trim()) return [];
  if (!supabase) {
    const term = query.toLowerCase();
    return mockProducts.filter((p) => p.name.toLowerCase().includes(term)).slice(0, limit);
  }
  const term = query.replace(/[%,]/g, " ");
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("is_active", true)
    .ilike("name", `%${term}%`)
    .limit(limit);
  if (error || !data) return [];
  return data.map(mapProduct);
}

// ── Mock fallback for search (used only when Supabase is off) ─
function searchMock(filters: ShopFilters) {
  let list = mockProducts.slice();
  if (filters.query) {
    const term = filters.query.toLowerCase();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term)
    );
  }
  if (filters.category) list = list.filter((p) => p.categorySlug === filters.category);
  if (filters.brands?.length)
    list = list.filter((p) => p.brandName && filters.brands!.includes(p.brandName));
  if (typeof filters.minPrice === "number")
    list = list.filter((p) => p.price >= filters.minPrice! * 100);
  if (typeof filters.maxPrice === "number")
    list = list.filter((p) => p.price <= filters.maxPrice! * 100);
  if (filters.minRating) list = list.filter((p) => p.rating >= filters.minRating!);

  const sort = filters.sort ?? "featured";
  const copy = [...list];
  if (sort === "price-asc") copy.sort((a, b) => a.price - b.price);
  else if (sort === "price-desc") copy.sort((a, b) => b.price - a.price);
  else if (sort === "rating") copy.sort((a, b) => b.rating - a.rating);
  else if (sort === "newest") copy.reverse();
  else copy.sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured));

  const page = Math.max(1, filters.page ?? 1);
  const total = copy.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const items = copy.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  return { items, total, page, totalPages, pageSize: PAGE_SIZE };
}
