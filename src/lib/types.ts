// Domain types shared across client and server.
// These mirror the Prisma models but stay framework-agnostic so client
// components (which must not import @prisma/client) can use them safely.

export type Money = number; // minor units (cents)

export interface ProductVariant {
  id: string;
  name: string;
  size?: string | null;
  color?: string | null;
  sku: string;
  priceDelta: Money;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: Money;
  compareAtPrice?: Money | null;
  images: string[];
  specifications?: Record<string, string> | null;
  isFeatured: boolean;
  rating: number;
  reviewCount: number;
  categorySlug: string;
  categoryName: string;
  brandName?: string | null;
  variants: ProductVariant[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  productCount?: number;
}

export interface Review {
  id: string;
  author: string;
  avatarUrl?: string | null;
  rating: number;
  title?: string | null;
  comment: string;
  isVerified: boolean;
  createdAt: string;
}

export interface CartLine {
  productId: string;
  variantId?: string;
  slug: string;
  name: string;
  variantName?: string;
  image: string;
  unitPrice: Money;
  quantity: number;
}

export type SortOption =
  | "featured"
  | "newest"
  | "price-asc"
  | "price-desc"
  | "rating";

export interface ShopFilters {
  query?: string;
  category?: string;
  brands?: string[];
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sort?: SortOption;
  page?: number;
}
