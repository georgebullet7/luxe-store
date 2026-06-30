import type { Product, Category, Review } from "./types";

// Unsplash images keep the demo runnable without Cloudinary configured.
const img = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=80`;

export const categories: Category[] = [
  { id: "c1", name: "Audio", slug: "audio", description: "Headphones, earbuds & speakers", imageUrl: img("photo-1505740420928-5e560c06d30e"), productCount: 2 },
  { id: "c2", name: "Wearables", slug: "wearables", description: "Smartwatches & trackers", imageUrl: img("photo-1523275335684-37898b6baf30"), productCount: 1 },
  { id: "c3", name: "Footwear", slug: "footwear", description: "Performance & lifestyle", imageUrl: img("photo-1542291026-7eec264c27ff"), productCount: 2 },
  { id: "c4", name: "Accessories", slug: "accessories", description: "Bags, cases & more", imageUrl: img("photo-1553062407-98eeb64c6a62"), productCount: 1 },
];

function variant(id: string, name: string, sku: string, stock: number, extra: Partial<Product["variants"][number]> = {}) {
  return { id, name, sku, priceDelta: 0, stock, size: null, color: null, ...extra };
}

export const products: Product[] = [
  {
    id: "p1", name: "Aurora Wireless Headphones", slug: "aurora-wireless-headphones",
    description: "Reference-grade active noise cancellation, 40-hour battery, and adaptive transparency. Hand-tuned 40mm drivers deliver a wide, natural soundstage.",
    price: 24900, compareAtPrice: 29900, images: [img("photo-1505740420928-5e560c06d30e"), img("photo-1484704849700-f032a568e944"), img("photo-1583394838336-acd977736f90")],
    specifications: { Driver: "40mm dynamic", Battery: "40 hours", Bluetooth: "5.3", Weight: "248g", Charging: "USB-C, fast charge" },
    isFeatured: true, rating: 4.8, reviewCount: 312, categorySlug: "audio", categoryName: "Audio", brandName: "Sonance",
    variants: [variant("p1v1", "Midnight Black", "AUR-BLK", 24, { color: "Black" }), variant("p1v2", "Cloud White", "AUR-WHT", 11, { color: "White" })],
  },
  {
    id: "p2", name: "Pulse Pro Earbuds", slug: "pulse-pro-earbuds",
    description: "Featherweight in-ear monitors with spatial audio and a pocketable wireless charging case. Sweat- and water-resistant for any workout.",
    price: 14900, compareAtPrice: null, images: [img("photo-1590658268037-6bf12165a8df"), img("photo-1606220588913-b3aacb4d2f46")],
    specifications: { Driver: "11mm", Battery: "8h + 24h case", Rating: "IPX5", Codec: "AAC, LDAC" },
    isFeatured: true, rating: 4.6, reviewCount: 198, categorySlug: "audio", categoryName: "Audio", brandName: "Sonance",
    variants: [variant("p2v1", "Graphite", "PUL-GRA", 40, { color: "Graphite" })],
  },
  {
    id: "p3", name: "Vertex Smartwatch", slug: "vertex-smartwatch",
    description: "A titanium-cased smartwatch with always-on AMOLED, multiband GPS, and 7-day battery life. Tracks 120+ workouts and recovery.",
    price: 39900, compareAtPrice: 44900, images: [img("photo-1523275335684-37898b6baf30"), img("photo-1434493789847-2f02dc6ca35d")],
    specifications: { Case: "Titanium 44mm", Display: "AMOLED AOD", Battery: "7 days", GPS: "Dual-band", Water: "10 ATM" },
    isFeatured: true, rating: 4.9, reviewCount: 421, categorySlug: "wearables", categoryName: "Wearables", brandName: "Northpeak",
    variants: [variant("p3v1", "42mm", "VTX-42", 18, { size: "42mm" }), variant("p3v2", "46mm", "VTX-46", 9, { size: "46mm" })],
  },
  {
    id: "p4", name: "Stride Runner 2", slug: "stride-runner-2",
    description: "Energy-return foam meets a breathable engineered knit upper. Built for daily miles with a rocker geometry that keeps you moving forward.",
    price: 12900, compareAtPrice: 15900, images: [img("photo-1542291026-7eec264c27ff"), img("photo-1460353581641-37baddab0fa2")],
    specifications: { Drop: "8mm", Weight: "232g", Upper: "Engineered knit", Use: "Road running" },
    isFeatured: true, rating: 4.7, reviewCount: 276, categorySlug: "footwear", categoryName: "Footwear", brandName: "Kinetic",
    variants: [
      variant("p4v1", "US 8", "STR-08", 12, { size: "8" }),
      variant("p4v2", "US 9", "STR-09", 7, { size: "9" }),
      variant("p4v3", "US 10", "STR-10", 0, { size: "10" }),
      variant("p4v4", "US 11", "STR-11", 5, { size: "11" }),
    ],
  },
  {
    id: "p5", name: "Court Classic Low", slug: "court-classic-low",
    description: "A timeless leather low-top with a cushioned footbed and vulcanized rubber sole. Clean lines that pair with anything.",
    price: 9900, compareAtPrice: null, images: [img("photo-1549298916-b41d501d3772"), img("photo-1595950653106-6c9ebd614d3a")],
    specifications: { Upper: "Full-grain leather", Sole: "Vulcanized rubber", Fit: "True to size" },
    isFeatured: false, rating: 4.5, reviewCount: 143, categorySlug: "footwear", categoryName: "Footwear", brandName: "Kinetic",
    variants: [variant("p5v1", "US 9", "CRT-09", 20, { size: "9" }), variant("p5v2", "US 10", "CRT-10", 15, { size: "10" })],
  },
  {
    id: "p6", name: "Carry Everyday Backpack", slug: "carry-everyday-backpack",
    description: "A weatherproof 20L commuter pack with a padded 16-inch laptop sleeve, magnetic straps, and a luggage pass-through.",
    price: 11900, compareAtPrice: 13900, images: [img("photo-1553062407-98eeb64c6a62"), img("photo-1622560480605-d83c853bc5c3")],
    specifications: { Capacity: "20L", Laptop: 'Up to 16"', Material: "Recycled nylon", Warranty: "Lifetime" },
    isFeatured: true, rating: 4.6, reviewCount: 89, categorySlug: "accessories", categoryName: "Accessories", brandName: "Northpeak",
    variants: [variant("p6v1", "Olive", "BAG-OLV", 30, { color: "Olive" }), variant("p6v2", "Black", "BAG-BLK", 22, { color: "Black" })],
  },
];

export const reviewsByProduct: Record<string, Review[]> = {
  p1: [
    { id: "r1", author: "Maya R.", rating: 5, title: "Best ANC I've used", comment: "The noise cancellation genuinely beats my old pair, and the battery lasts a full work week.", isVerified: true, createdAt: "2026-05-02" },
    { id: "r2", author: "Daniel K.", rating: 4, title: "Great, slightly bass-heavy", comment: "Comfort is excellent for long sessions. EQ in the app fixes the bass if you want.", isVerified: true, createdAt: "2026-04-18" },
  ],
};

export const testimonials = [
  { id: "t1", name: "Lara Haddad", role: "Verified buyer", quote: "Checkout took ten seconds and my order arrived in two days. The packaging alone felt premium.", rating: 5 },
  { id: "t2", name: "Omar Nassar", role: "Verified buyer", quote: "I've reordered three times. Quality is consistent and support actually replies.", rating: 5 },
  { id: "t3", name: "Sophie Chen", role: "Verified buyer", quote: "The product photos match reality exactly. No surprises, just good gear.", rating: 4 },
];

export const brands = ["Sonance", "Northpeak", "Kinetic"];
