import { Hero } from "@/components/hero";
import { SectionHeading } from "@/components/section-heading";
import { ProductCard } from "@/components/product-card";
import { CategoryGrid } from "@/components/category-grid";
import { Testimonials } from "@/components/testimonials";
import { PromoBanner } from "@/components/promo-banner";
import { getFeaturedProducts, getBestSellers, getCategories } from "@/lib/data";

export default async function HomePage() {
  const [featured, bestSellers, categories] = await Promise.all([
    getFeaturedProducts(),
    getBestSellers(),
    getCategories(),
  ]);

  return (
    <>
      <Hero />

      <section className="container py-16">
        <SectionHeading title="Shop by category" subtitle="Find what you're looking for" href="/shop" />
        <CategoryGrid categories={categories} />
      </section>

      <section className="container py-16">
        <SectionHeading title="Featured products" subtitle="Hand-picked favourites" href="/shop" />
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
          {featured.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </section>

      <section className="container py-4">
        <PromoBanner />
      </section>

      <section className="container py-16">
        <SectionHeading title="Best sellers" subtitle="Loved by thousands" href="/shop?sort=rating" />
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4">
          {bestSellers.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </section>

      <section className="container py-16">
        <SectionHeading title="What customers say" subtitle="Real reviews from verified buyers" />
        <Testimonials />
      </section>
    </>
  );
}
