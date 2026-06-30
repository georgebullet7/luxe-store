"use client";

import { useState } from "react";
import { MapPin, Plus, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Address {
  id: string;
  label: string;
  fullName: string;
  line1: string;
  city: string;
  country: string;
  isDefault: boolean;
}

const initial: Address[] = [
  {
    id: "a1",
    label: "Home",
    fullName: "George A.",
    line1: "Rue 42, Baabda",
    city: "Mount Lebanon",
    country: "Lebanon",
    isDefault: true,
  },
];

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>(initial);

  function remove(id: string) {
    setAddresses((a) => a.filter((x) => x.id !== id));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Saved addresses</h2>
        <Button size="sm" variant="outline">
          <Plus className="mr-1 h-4 w-4" /> Add address
        </Button>
      </div>

      {addresses.length === 0 ? (
        <div className="rounded-xl border border-dashed py-14 text-center text-sm text-muted-foreground">
          <MapPin className="mx-auto mb-3 h-8 w-8" />
          No addresses saved yet.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((a) => (
            <Card key={a.id}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{a.label}</span>
                    {a.isDefault && (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                        Default
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"
                      aria-label="Edit address"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => remove(a.id)}
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"
                      aria-label="Delete address"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="mt-3 text-sm text-muted-foreground">
                  <p className="text-foreground">{a.fullName}</p>
                  <p>{a.line1}</p>
                  <p>
                    {a.city}, {a.country}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
