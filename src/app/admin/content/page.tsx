"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Upload, Loader2 } from "lucide-react";
import { getBrowserSupabase } from "@/lib/supabase-browser";
import { defaultSettings, type SiteSettings } from "@/lib/site";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AdminContentPage() {
  const [s, setS] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    (async () => {
      const sb = getBrowserSupabase();
      if (!sb) return setLoading(false);
      const { data } = await sb
        .from("site_settings")
        .select("*")
        .eq("id", "main")
        .maybeSingle();
      if (data) {
        const merged = { ...defaultSettings };
        for (const k of Object.keys(defaultSettings) as (keyof SiteSettings)[]) {
          const v = (data as any)[k];
          if (v !== null && v !== undefined) (merged as any)[k] = v;
        }
        setS(merged);
      }
      setLoading(false);
    })();
  }, []);

  function set<K extends keyof SiteSettings>(key: K, val: SiteSettings[K]) {
    setS((prev) => ({ ...prev, [key]: val }));
  }

  async function uploadHero(file: File | null) {
    if (!file) return;
    const sb = getBrowserSupabase();
    if (!sb) return;
    setUploading(true);
    try {
      const safe = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
      const path = `site/${Date.now()}-${safe}`;
      const { error } = await sb.storage
        .from("product-images")
        .upload(path, file, { upsert: false });
      if (error) return toast.error("Upload failed: " + error.message);
      const { data } = sb.storage.from("product-images").getPublicUrl(path);
      set("hero_image", data.publicUrl);
      toast.success("Image uploaded");
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    const sb = getBrowserSupabase();
    if (!sb) return;
    setSaving(true);
    try {
      const { error } = await sb
        .from("site_settings")
        .upsert({ id: "main", ...s, updated_at: new Date().toISOString() });
      if (error) throw error;
      toast.success("Saved — your homepage is updated");
    } catch (e: any) {
      toast.error(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="py-16 text-center text-muted-foreground">Loading…</div>;
  }

  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <CardContent className="space-y-4 p-5">
          <h2 className="text-lg font-semibold">Store</h2>
          <Field label="Store name (shown in header & footer)">
            <Input value={s.store_name} onChange={(e) => set("store_name", e.target.value)} />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-5">
          <h2 className="text-lg font-semibold">Homepage hero</h2>
          <Field label="Small label (eyebrow)">
            <Input value={s.hero_eyebrow} onChange={(e) => set("hero_eyebrow", e.target.value)} />
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Headline (line 1)">
              <Input value={s.hero_title} onChange={(e) => set("hero_title", e.target.value)} />
            </Field>
            <Field label="Headline (line 2, lighter)">
              <Input value={s.hero_title_accent} onChange={(e) => set("hero_title_accent", e.target.value)} />
            </Field>
          </div>
          <Field label="Subtitle paragraph">
            <Textarea value={s.hero_subtitle} onChange={(v) => set("hero_subtitle", v)} />
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Main button text">
              <Input value={s.hero_primary_label} onChange={(e) => set("hero_primary_label", e.target.value)} />
            </Field>
            <Field label="Main button link">
              <Input value={s.hero_primary_href} onChange={(e) => set("hero_primary_href", e.target.value)} />
            </Field>
            <Field label="Second button text">
              <Input value={s.hero_secondary_label} onChange={(e) => set("hero_secondary_label", e.target.value)} />
            </Field>
            <Field label="Second button link">
              <Input value={s.hero_secondary_href} onChange={(e) => set("hero_secondary_href", e.target.value)} />
            </Field>
          </div>
          <Field label="Hero image">
            <div className="flex items-center gap-4">
              <div className="relative h-20 w-20 overflow-hidden rounded-lg border bg-muted">
                {s.hero_image && (
                  <Image src={s.hero_image} alt="" fill sizes="80px" className="object-cover" />
                )}
              </div>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted">
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                Upload image
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => uploadHero(e.target.files?.[0] ?? null)}
                />
              </label>
            </div>
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Promo banner</h2>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={s.promo_enabled}
                onChange={(e) => set("promo_enabled", e.target.checked)}
                className="h-4 w-4"
              />
              Show on homepage
            </label>
          </div>
          <Field label="Small label">
            <Input value={s.promo_eyebrow} onChange={(e) => set("promo_eyebrow", e.target.value)} />
          </Field>
          <Field label="Title">
            <Input value={s.promo_title} onChange={(e) => set("promo_title", e.target.value)} />
          </Field>
          <Field label="Subtitle">
            <Textarea value={s.promo_subtitle} onChange={(v) => set("promo_subtitle", v)} />
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Button text">
              <Input value={s.promo_cta_label} onChange={(e) => set("promo_cta_label", e.target.value)} />
            </Field>
            <Field label="Button link">
              <Input value={s.promo_cta_href} onChange={(e) => set("promo_cta_href", e.target.value)} />
            </Field>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-5">
          <h2 className="text-lg font-semibold">Footer</h2>
          <Field label="Footer tagline">
            <Textarea value={s.footer_tagline} onChange={(v) => set("footer_tagline", v)} />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-5">
          <h2 className="text-lg font-semibold">Customer support</h2>
          <p className="text-sm text-muted-foreground">
            Shown as chat buttons in the footer. WhatsApp also appears as a floating
            bubble on every page.
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="WhatsApp number">
              <Input
                inputMode="tel"
                placeholder="e.g. 70 123 456"
                value={s.support_whatsapp}
                onChange={(e) => set("support_whatsapp", e.target.value)}
              />
            </Field>
            <Field label="Telegram username">
              <Input
                placeholder="e.g. bulletluxe (without @)"
                value={s.support_telegram}
                onChange={(e) => set("support_telegram", e.target.value)}
              />
            </Field>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={s.support_bubble_enabled}
              onChange={(e) => set("support_bubble_enabled", e.target.checked)}
              className="h-4 w-4"
            />
            Show floating WhatsApp bubble on the site
          </label>
        </CardContent>
      </Card>

      <div className="sticky bottom-4 flex justify-end">
        <Button onClick={save} disabled={saving || uploading} size="lg">
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">{label}</label>
      {children}
    </div>
  );
}

function Textarea({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={3}
      className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    />
  );
}
