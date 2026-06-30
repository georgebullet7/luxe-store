import { NextResponse } from "next/server";
import { getProductBySlug, getRelatedProducts, getReviews } from "@/lib/data";

export const runtime = "nodejs";

// GET /api/products/[slug]
export async function GET(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  const product = await getProductBySlug(params.slug);
  if (!product) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const [related, reviews] = await Promise.all([
    getRelatedProducts(params.slug, 4),
    getReviews(product.id),
  ]);
  return NextResponse.json({ product, related, reviews });
}
