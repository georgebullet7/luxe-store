"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Wallet } from "lucide-react";
import { getBrowserSupabase } from "@/lib/supabase-browser";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default function CheckoutSuccessPage() {
  const [order, setOrder] = useState("");
  const [pay, setPay] = useState("");
  const [whish, setWhish] = useState<string | null>(null);
  const [omt, setOmt] = useState<string | null>(null);
  const [instr, setInstr] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setOrder(params.get("order") ?? "");
    const p = params.get("pay") ?? "";
    setPay(p);
    if (p === "prepaid") {
      (async () => {
        const sb = getBrowserSupabase();
        if (!sb) return;
        const { data } = await sb
          .from("site_settings")
          .select("whish_number,omt_details,payment_instructions")
          .eq("id", "main")
          .maybeSingle();
        if (data) {
          setWhish(data.whish_number);
          setOmt(data.omt_details);
          setInstr(data.payment_instructions);
        }
      })();
    }
  }, []);

  return (
    <div className="container flex min-h-[70vh] items-center justify-center py-10">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <h1 className="mt-5 text-2xl font-bold tracking-tight">Order placed!</h1>
        {order && (
          <p className="mt-1 text-muted-foreground">
            Your order number is <span className="font-semibold text-foreground">{order}</span>
          </p>
        )}

        {pay === "prepaid" ? (
          <div className="mt-6 rounded-xl border bg-muted/40 p-5 text-left text-sm">
            <p className="flex items-center gap-2 font-medium">
              <Wallet className="h-4 w-4" /> Complete your payment
            </p>
            <ul className="mt-3 space-y-1 text-muted-foreground">
              {whish && (
                <li>
                  Whish to: <span className="font-medium text-foreground">{whish}</span>
                </li>
              )}
              {omt && (
                <li>
                  OMT: <span className="font-medium text-foreground">{omt}</span>
                </li>
              )}
            </ul>
            {instr && <p className="mt-2 text-muted-foreground">{instr}</p>}
            <p className="mt-3 text-xs text-muted-foreground">
              Once we receive your payment, we&apos;ll confirm and deliver your order.
            </p>
          </div>
        ) : (
          <p className="mt-6 text-muted-foreground">
            We&apos;ll contact you shortly to arrange delivery. Please have the cash ready.
          </p>
        )}

        <div className="mt-8 flex justify-center gap-3">
          <Button asChild>
            <Link href="/shop">Continue shopping</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">Back home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
