import { supabase } from "./supabase";

export type SiteSettings = {
  store_name: string;
  hero_eyebrow: string;
  hero_title: string;
  hero_title_accent: string;
  hero_subtitle: string;
  hero_primary_label: string;
  hero_primary_href: string;
  hero_secondary_label: string;
  hero_secondary_href: string;
  hero_image: string;
  promo_enabled: boolean;
  promo_eyebrow: string;
  promo_title: string;
  promo_subtitle: string;
  promo_cta_label: string;
  promo_cta_href: string;
  footer_tagline: string;
  support_whatsapp: string;
  support_telegram: string;
  support_bubble_enabled: boolean;
};

export const defaultSettings: SiteSettings = {
  store_name: "LUXE",
  hero_eyebrow: "New season drop",
  hero_title: "Premium gear,",
  hero_title_accent: "minimally designed.",
  hero_subtitle:
    "Sound, sport, and everyday essentials engineered to last. Free carbon-neutral shipping, 30-day returns, lifetime support.",
  hero_primary_label: "Shop the collection",
  hero_primary_href: "/shop",
  hero_secondary_label: "Explore audio",
  hero_secondary_href: "/shop?category=audio",
  hero_image:
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80",
  promo_enabled: true,
  promo_eyebrow: "Flash sale · 48 hours",
  promo_title: "Up to 30% off audio",
  promo_subtitle:
    "Our most-loved headphones and earbuds, now at their best price of the season.",
  promo_cta_label: "Shop the sale",
  promo_cta_href: "/shop?category=audio",
  footer_tagline:
    "Premium essentials, designed to last. Free carbon-neutral shipping on every order.",
  support_whatsapp: "",
  support_telegram: "",
  support_bubble_enabled: true,
};

export async function getSiteSettings(): Promise<SiteSettings> {
  if (!supabase) return defaultSettings;
  const { data } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", "main")
    .maybeSingle();
  if (!data) return defaultSettings;

  // Merge over defaults so any blank/null column falls back gracefully.
  const merged = { ...defaultSettings };
  for (const key of Object.keys(defaultSettings) as (keyof SiteSettings)[]) {
    const v = (data as any)[key];
    if (v !== null && v !== undefined && v !== "") (merged as any)[key] = v;
  }
  return merged;
}
