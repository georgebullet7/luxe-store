/**
 * Prisma seed script.
 *
 *   npm run db:seed   (runs `tsx prisma/seed.ts`)
 *
 * Idempotent: uses upserts keyed on unique fields so it can be re-run safely.
 * The catalog is derived from src/lib/mock-data.ts so the seeded database
 * matches exactly what the storefront shows in demo mode.
 */
import { PrismaClient } from "@prisma/client";
import {
  categories as mockCategories,
  products as mockProducts,
  brands as mockBrands,
  reviewsByProduct,
} from "../src/lib/mock-data";
import { slugify } from "../src/lib/utils";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database…");

  // ── Users ───────────────────────────────────────────────
  const admin = await prisma.user.upsert({
    where: { email: "admin@luxe.example" },
    update: {},
    create: {
      email: "admin@luxe.example",
      name: "LUXE Admin",
      role: "ADMIN",
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: "george@example.com" },
    update: {},
    create: {
      email: "george@example.com",
      name: "George A.",
      role: "CUSTOMER",
      addresses: {
        create: {
          type: "SHIPPING",
          fullName: "George A.",
          phone: "+961 70 000 000",
          line1: "Rue 42",
          city: "Baabda",
          state: "Mount Lebanon",
          postalCode: "1004",
          country: "Lebanon",
          isDefault: true,
        },
      },
    },
  });

  // ── Brands ──────────────────────────────────────────────
  const brandByName = new Map<string, string>();
  for (const name of mockBrands) {
    const b = await prisma.brand.upsert({
      where: { name },
      update: {},
      create: { name, slug: slugify(name) },
    });
    brandByName.set(name, b.id);
  }

  // ── Categories ──────────────────────────────────────────
  const categoryBySlug = new Map<string, string>();
  for (const c of mockCategories) {
    const cat = await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: {
        name: c.name,
        slug: c.slug,
        description: c.description ?? null,
        imageUrl: c.imageUrl ?? null,
      },
    });
    categoryBySlug.set(c.slug, cat.id);
  }

  // ── Products + variants + inventory ─────────────────────
  for (const p of mockProducts) {
    const categoryId = categoryBySlug.get(p.categorySlug)!;
    const brandId = p.brandName ? brandByName.get(p.brandName) : undefined;

    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        compareAtPrice: p.compareAtPrice ?? null,
        images: p.images,
        specifications: p.specifications ?? undefined,
        isFeatured: p.isFeatured,
        rating: p.rating,
        reviewCount: p.reviewCount,
        categoryId,
        brandId: brandId ?? null,
        variants: {
          create: p.variants.map((v) => ({
            name: v.name,
            sku: v.sku,
            size: v.size ?? null,
            color: v.color ?? null,
            priceDelta: v.priceDelta,
            inventory: { create: { quantity: v.stock } },
          })),
        },
      },
    });

    // ── Reviews for this product ──────────────────────────
    const reviews = reviewsByProduct[p.id] ?? [];
    for (const r of reviews) {
      // Demo: attribute every review to the seeded customer (unique per
      // product+user). In production each review maps to its real author.
      await prisma.review.upsert({
        where: {
          productId_userId: { productId: product.id, userId: customer.id },
        },
        update: {},
        create: {
          productId: product.id,
          userId: customer.id,
          rating: r.rating,
          title: r.title ?? null,
          comment: r.comment,
          isVerified: r.isVerified,
        },
      });
      break; // one review per (product,user) due to unique constraint
    }
  }

  // ── Coupons ─────────────────────────────────────────────
  await prisma.coupon.upsert({
    where: { code: "WELCOME10" },
    update: {},
    create: {
      code: "WELCOME10",
      description: "10% off your first order",
      discountType: "PERCENTAGE",
      discountValue: 10,
      maxUses: 1000,
      isActive: true,
    },
  });
  await prisma.coupon.upsert({
    where: { code: "SAVE20" },
    update: {},
    create: {
      code: "SAVE20",
      description: "$20 off orders over $150",
      discountType: "FIXED",
      discountValue: 2000,
      minSpend: 15000,
      maxUses: 200,
      isActive: true,
    },
  });

  console.log("✅ Seed complete.");
  console.log(`   Admin:    ${admin.email}`);
  console.log(`   Customer: ${customer.email}`);
  console.log(
    `   ${mockProducts.length} products, ${mockCategories.length} categories, ${mockBrands.length} brands`
  );
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
