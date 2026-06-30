import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Shared Supabase client for reading the public catalog.
 *
 * Uses the publishable (anon) key + Row Level Security: the browser/server can
 * only read what the RLS policies allow. If the env vars aren't set yet, this
 * is `null` and the data layer falls back to the bundled demo catalog — so the
 * site keeps working at every step instead of breaking.
 */
const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

// Only build a client if the URL is actually a valid http(s) URL. A blank,
// mistyped, or space-padded value would otherwise throw at build time, so we
// fall back to the bundled demo catalog instead of crashing.
function validUrl(u?: string): string | null {
  if (!u) return null;
  try {
    const parsed = new URL(u);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    return parsed.origin; // strips any trailing path/slash
  } catch {
    return null;
  }
}

const url = validUrl(rawUrl);

export const supabase: SupabaseClient | null =
  url && key ? createClient(url, key, { auth: { persistSession: false } }) : null;

export const isSupabaseConfigured = Boolean(url && key);

// Columns we always pull for a product, with its category, brand, and variants.
export const PRODUCT_SELECT =
  "*, category:categories(name,slug), brand:brands(name), variants:product_variants(id,name,sku,size,color,price_delta,stock)";
