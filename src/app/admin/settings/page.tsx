"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AdminSettingsPage() {
  const [store, setStore] = useState({
    name: "LUXE",
    supportEmail: "support@luxe.example",
    currency: "USD",
    freeShipThreshold: "100",
    taxRate: "8",
  });

  function update<K extends keyof typeof store>(key: K, val: string) {
    setStore((s) => ({ ...s, [key]: val }));
  }

  return (
    <div className="max-w-xl space-y-6">
      <Card>
        <CardContent className="space-y-4 p-5">
          <h2 className="text-lg font-semibold">Store</h2>
          <Field label="Store name">
            <Input
              value={store.name}
              onChange={(e) => update("name", e.target.value)}
            />
          </Field>
          <Field label="Support email">
            <Input
              type="email"
              value={store.supportEmail}
              onChange={(e) => update("supportEmail", e.target.value)}
            />
          </Field>
          <Field label="Currency">
            <Input
              value={store.currency}
              onChange={(e) => update("currency", e.target.value)}
            />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 p-5">
          <h2 className="text-lg font-semibold">Checkout</h2>
          <Field label="Free shipping threshold ($)">
            <Input
              inputMode="numeric"
              value={store.freeShipThreshold}
              onChange={(e) => update("freeShipThreshold", e.target.value)}
            />
          </Field>
          <Field label="Tax rate (%)">
            <Input
              inputMode="numeric"
              value={store.taxRate}
              onChange={(e) => update("taxRate", e.target.value)}
            />
          </Field>
        </CardContent>
      </Card>

      <Button onClick={() => toast.success("Settings saved (demo only)")}>
        Save settings
      </Button>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">{label}</label>
      {children}
    </div>
  );
}
