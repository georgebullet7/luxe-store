import { z } from "zod";

// ── Auth / profile ─────────────────────────
export const addressSchema = z.object({
  fullName: z.string().min(2, "Name is required"),
  phone: z.string().min(6, "Valid phone required"),
  line1: z.string().min(3, "Address is required"),
  line2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().optional(),
  postalCode: z.string().min(2, "Postal code is required"),
  country: z.string().min(2, "Country is required"),
});
export type AddressInput = z.infer<typeof addressSchema>;

// ── Checkout ───────────────────────────────
export const checkoutSchema = z.object({
  email: z.string().email("Valid email required"),
  shipping: addressSchema,
  billingSameAsShipping: z.boolean().default(true),
  billing: addressSchema.optional(),
  couponCode: z.string().optional(),
});
export type CheckoutInput = z.infer<typeof checkoutSchema>;

// ── Reviews ────────────────────────────────
export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().max(120).optional(),
  comment: z.string().min(10, "Please write at least 10 characters").max(2000),
});
export type ReviewInput = z.infer<typeof reviewSchema>;

// ── Newsletter ─────────────────────────────
export const newsletterSchema = z.object({
  email: z.string().email("Enter a valid email"),
});

// ── Coupon ─────────────────────────────────
export const couponSchema = z.object({
  code: z.string().min(3).toUpperCase(),
});

// ── Admin: product CRUD ────────────────────
export const productSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().min(10),
  price: z.number().int().nonnegative(), // cents
  compareAtPrice: z.number().int().nonnegative().optional(),
  categoryId: z.string().cuid(),
  brandId: z.string().cuid().optional(),
  images: z.array(z.string().url()).min(1, "At least one image"),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
});
export type ProductInput = z.infer<typeof productSchema>;
