import type { Product, ShopFilters, SortOption } from "./types";
import { products, categories, brands, reviewsByProduct } from "./mock-data";

/*
 * DATA ACCESS LAYER
 * ─────────────────
 * Today these read from mock-data so the storefront runs with zero config.
 * To go live, replace each function body with a Prisma query, e.g.:
 *
 *   import { prisma } from "./prisma";
 *   export async function getFeaturedProducts() {
 *     return prisma.product.findMany({
 *       where: { isFeatured: true, isActive: true },
 *       include: { variants: true, category: true, brand: true },
 *       take: 8,
 *     });
 *   }
 *
 * Keeping all reads behind this module means pages/components never change.
 */

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  return products.filter((p) => p.isFeatured).slice(0, limit);
}

export async function getBestSellers(limit = 4): Promise<Product[]> {
  return [...products].sort((a, b) => b.reviewCount - a.reviewCount).slice(0, limit);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  return products.find((p) => p.slug === slug) ?? null;
}

export async function getRelatedProducts(slug: string, limit = 4): Promise<Product[]> {
  const current = products.find((p) => p.slug === slug);
  if (!current) return [];
  return products
    .filter((p) => p.slug !== slug && p.categorySlug === current.categorySlug)
    .slice(0, limit);
}

export async function getCategories() {
  return categories;
}

export async function getBrands() {
  return brands;
}

export async function getReviews(productId: string) {
  return reviewsByProduct[productId] ?? [];
}

const PAGE_SIZE = 6;

function sortProducts(list: Product[], sort: SortOption = "featured") {
  const copy = [...list];
  switch (sort) {
    case "price-asc": return copy.sort((a, b) => a.price - b.price);
    case "price-desc": return copy.sort((a, b) => b.price - a.price);
    case "rating": return copy.sort((a, b) => b.rating - a.rating);
    case "newest": return copy.reverse();
    default: return copy.sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured));
  }
}

export async function searchProducts(filters: ShopFilters) {
  let list = products.slice();

  if (filters.query) {
    const q = filters.query.toLowerCase();
    list = list.filter(
      (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
    );
  }
  if (filters.category) list = list.filter((p) => p.categorySlug === filters.category);
  if (filters.brands?.length) list = list.filter((p) => p.brandName && filters.brands!.includes(p.brandName));
  if (typeof filters.minPrice === "number") list = list.filter((p) => p.price >= filters.minPrice! * 100);
  if (typeof filters.maxPrice === "number") list = list.filter((p) => p.price <= filters.maxPrice! * 100);
  if (filters.minRating) list = list.filter((p) => p.rating >= filters.minRating!);

  list = sortProducts(list, filters.sort);

  const page = Math.max(1, filters.page ?? 1);
  const total = list.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const items = list.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return { items, total, page, totalPages, pageSize: PAGE_SIZE };
}

export async function autocomplete(query: string, limit = 5): Promise<Product[]> {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  return products.filter((p) => p.name.toLowerCase().includes(q)).slice(0, limit);
}
