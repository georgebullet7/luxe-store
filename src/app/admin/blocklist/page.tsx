"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { ShieldBan, Trash2, Plus } from "lucide-react";
import { getBrowserSupabase } from "@/lib/supabase-browser";
import { normalizeLebanesePhone } from "@/lib/phone";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";

type Blocked = { phone: string; reason: string | null; created_at: string };

export default function AdminBlocklistPage() {
  const [rows, setRows] = useState<Blocked[]>([]);
  const [loading, setLoading] = useState(true);
  const [phone, setPhone] = useState("");
  const [reason, setReason] = useState("");

  const load = useCallback(async () => {
    const sb = getBrowserSupabase();
    if (!sb) return;
    setLoading(true);
    const { data } = await sb
      .from("blocked_phones")
      .select("*")
      .order("created_at", { ascending: false });
    setRows((data as Blocked[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function add() {
    const normalized = normalizeLebanesePhone(phone);
    if (!normalized) return toast.error("Enter a valid Lebanese mobile number");
    const sb = getBrowserSupabase();
    const { error } = await sb!
      .from("blocked_phones")
      .insert({ phone: normalized, reason: reason.trim() || null });
    if (error) {
      if (error.code === "23505") return toast.error("This number is already blocked");
      return toast.error(error.message);
    }
    toast.success(`${normalized} blocked`);
    setPhone("");
    setReason("");
    load();
  }

  async function unblock(p: string) {
    const sb = getBrowserSupabase();
    const { error } = await sb!.from("blocked_phones").delete().eq("phone", p);
    if (error) return toast.error(error.message);
    toast.success("Number unblocked");
    load();
  }

  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <CardContent className="space-y-4 p-5">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <ShieldBan className="h-5 w-5" /> Blocked phone numbers
          </h2>
          <p className="text-sm text-muted-foreground">
            Blocked numbers can&apos;t place orders. Use this for fake orders,
            no-shows, or abuse.
          </p>
          <div className="flex flex-wrap gap-2">
            <Input
              className="max-w-[180px]"
              inputMode="tel"
              placeholder="e.g. 70 123 456"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <Input
              className="flex-1"
              placeholder="Reason (optional, e.g. fake order 12 Jun)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <Button onClick={add}>
              <Plus className="mr-1 h-4 w-4" /> Block
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-10 text-center text-muted-foreground">Loading…</div>
          ) : rows.length === 0 ? (
            <div className="p-10 text-center text-muted-foreground">
              No blocked numbers.
            </div>
          ) : (
            <ul className="divide-y">
              {rows.map((r) => (
                <li key={r.phone} className="flex items-center gap-3 px-5 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-sm font-medium">{r.phone}</p>
                    <p className="text-xs text-muted-foreground">
                      {r.reason || "No reason given"} · {formatDate(r.created_at)}
                    </p>
                  </div>
                  <button
                    onClick={() => unblock(r.phone)}
                    className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"
                    aria-label={`Unblock ${r.phone}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
