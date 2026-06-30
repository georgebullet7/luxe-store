import Image from "next/image";
import Link from "next/link";
import type { Category } from "@/lib/types";

export function CategoryGrid({ categories }: { categories: Category[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {categories.map((cat) => (
        <Link key={cat.id} href={`/shop?category=${cat.slug}`} className="group relative aspect-[4/5] overflow-hidden rounded-xl bg-muted">
          {cat.imageUrl && (
            <Image src={cat.imageUrl} alt={cat.name} fill sizes="(max-width:768px) 50vw, 25vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-4">
            <h3 className="font-semibold text-white">{cat.name}</h3>
            <p className="text-sm text-white/80">{cat.productCount} products</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
