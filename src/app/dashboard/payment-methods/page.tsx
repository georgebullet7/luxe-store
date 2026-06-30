"use client";

import { CreditCard, Plus, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const cards = [
  { id: "c1", brand: "Visa", last4: "4242", exp: "08/28", isDefault: true },
];

export default function PaymentMethodsPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Payment methods</h2>
        <Button size="sm" variant="outline">
          <Plus className="mr-1 h-4 w-4" /> Add card
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map((c) => (
          <Card key={c.id}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-14 place-items-center rounded-md bg-primary text-primary-foreground">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">
                      {c.brand} •••• {c.last4}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Expires {c.exp}
                    </p>
                  </div>
                </div>
                {c.isDefault && (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                    Default
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <ShieldCheck className="h-4 w-4" />
        Cards are tokenized and stored by Stripe — never on our servers.
      </p>
    </div>
  );
}
