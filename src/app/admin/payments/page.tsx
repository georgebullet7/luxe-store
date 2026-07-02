"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getBrowserSupabase } from "@/lib/supabase-browser";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Pay = {
  cod_enabled: boolean;
  prepaid_enabled: boolean;
  whish_number: string;
  omt_details: string;
  payment_instructions: string;
  delivery_fee: string; // dollars in the form
  free_delivery_over: string; // dollars in the form ("" = never)
};

const EMPTY: Pay = {
  cod_enabled: true,
  prepaid_enabled: true,
  whish_number: "",
  omt_details: "",
  payment_instructions: "",
  delivery_fee: "0",
  free_delivery_over: "",
};

export default function AdminPaymentsPage() {
  const [p, setP] = useState<Pay>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const sb = getBrowserSupabase();
      if (!sb) return setLoading(false);
      const { data } = await sb
        .from("site_settings")
        .select(
          "cod_enabled,prepaid_enabled,whish_number,omt_details,payment_instructions,delivery_fee,free_delivery_over"
        )
        .eq("id", "main")
        .maybeSingle();
      if (data) {
        setP({
          cod_enabled: data.cod_enabled ?? true,
          prepaid_enabled: data.prepaid_enabled ?? true,
          whish_number: data.whish_number ?? "",
          omt_details: data.omt_details ?? "",
          payment_instructions: data.payment_instructions ?? "",
          delivery_fee: ((data.delivery_fee ?? 0) / 100).toString(),
          free_delivery_over:
            data.free_delivery_over != null
              ? (data.free_delivery_over / 100).toString()
              : "",
        });
      }
      setLoading(false);
    })();
  }, []);

  function set<K extends keyof Pay>(k: K, v: Pay[K]) {
    setP((prev) => ({ ...prev, [k]: v }));
  }

  async function save() {
    const sb = getBrowserSupabase();
    if (!sb) return;
    setSaving(true);
    try {
      const payload = {
        id: "main",
        cod_enabled: p.cod_enabled,
        prepaid_enabled: p.prepaid_enabled,
        whish_number: p.whish_number.trim() || null,
        omt_details: p.omt_details.trim() || null,
        payment_instructions: p.payment_instructions.trim() || null,
        delivery_fee: Math.round(parseFloat(p.delivery_fee || "0") * 100),
        free_delivery_over: p.free_delivery_over
          ? Math.round(parseFloat(p.free_delivery_over) * 100)
          : null,
      };
      const { error } = await sb.from("site_settings").upsert(payload);
      if (error) throw error;
      toast.success("Payment settings saved");
    } catch (e: any) {
      toast.error(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading)
    return <div className="py-16 text-center text-muted-foreground">Loading…</div>;

  return (
    <div className="max-w-xl space-y-6">
      <Card>
        <CardContent className="space-y-4 p-5">
          <h2 className="text-lg font-semibold">Payment options</h2>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={p.cod_enabled}
              onChange={(e) => set("cod_enabled", e.target.checked)}
              className="h-4 w-4"
            />
            Cash on delivery (courier)
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={p.prepaid_enabled}
              onChange={(e) => set("prepaid_enabled", e.target.checked)}
              className="h-4 w-4"
            />
            Pay now by Whish / OMT (you deliver)
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-5">
          <h2 className="text-lg font-semibold">Whish / OMT details</h2>
          <p className="text-sm text-muted-foreground">
            Shown to customers who choose “Pay now”. They send payment to these, then
            you confirm it in Orders and deliver.
          </p>
          <Field label="Whish number">
            <Input
              value={p.whish_number}
              onChange={(e) => set("whish_number", e.target.value)}
              placeholder="e.g. 71 234 567"
            />
          </Field>
          <Field label="OMT details">
            <Input
              value={p.omt_details}
              onChange={(e) => set("omt_details", e.target.value)}
              placeholder="e.g. Full name + phone for OMT transfer"
            />
          </Field>
          <Field label="Extra instructions (optional)">
            <textarea
              rows={3}
              value={p.payment_instructions}
              onChange={(e) => set("payment_instructions", e.target.value)}
              placeholder="e.g. After sending, WhatsApp us the transfer screenshot on 03 000 000."
              className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-5">
          <h2 className="text-lg font-semibold">Delivery fee</h2>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Delivery fee ($)">
              <Input
                inputMode="decimal"
                value={p.delivery_fee}
                onChange={(e) => set("delivery_fee", e.target.value)}
              />
            </Field>
            <Field label="Free delivery over ($, optional)">
              <Input
                inputMode="decimal"
                value={p.free_delivery_over}
                onChange={(e) => set("free_delivery_over", e.target.value)}
                placeholder="leave blank for none"
              />
            </Field>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button size="lg" onClick={save} disabled={saving}>
          {saving ? "Saving…" : "Save settings"}
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
