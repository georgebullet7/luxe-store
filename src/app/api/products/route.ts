import { NextResponse } from "next/server";
import { searchProducts } from "@/lib/data";
import type { SortOption } from "@/lib/types";

export const runtime = "nodejs";
// Revalidate this response every 60s (ISR-style caching for the API layer).
export const revalidate = 60;

/**
 * GET /api/products
 * Query params: query, category, brand (repeatable), minPrice, maxPrice,
 *               minRating, sort, page
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const result = await searchProducts({
    query: searchParams.get("query") ?? undefined,
    category: searchParams.get("category") ?? undefined,
    brands: searchParams.getAll("brand"),
    minPrice: numberOrUndefined(searchParams.get("minPrice")),
    maxPrice: numberOrUndefined(searchParams.get("maxPrice")),
    minRating: numberOrUndefined(searchParams.get("minRating")),
    sort: (searchParams.get("sort") as SortOption) ?? undefined,
    page: numberOrUndefined(searchParams.get("page")),
  });

  return NextResponse.json(result);
}

function numberOrUndefined(v: string | null): number | undefined {
  if (v == null || v === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}
