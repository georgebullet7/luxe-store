import { NextResponse } from "next/server";
import { autocomplete } from "@/lib/data";

export const runtime = "nodejs";

// GET /api/search?q=head
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  if (q.trim().length < 2) return NextResponse.json({ results: [] });

  const products = await autocomplete(q, 6);
  const results = products.map((p) => ({
    slug: p.slug,
    name: p.name,
    image: p.images[0],
    price: p.price,
    categoryName: p.categoryName,
  }));
  return NextResponse.json({ results });
}
