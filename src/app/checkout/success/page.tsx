import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Order confirmed" };

export default function SuccessPage() {
  return (
    <div className="container flex flex-col items-center justify-center py-28 text-center">
      <CheckCircle2 className="h-16 w-16 text-emerald-500" />
      <h1 className="mt-6 text-3xl font-bold tracking-tight">Thank you for your order!</h1>
      <p className="mt-2 max-w-md text-muted-foreground">
        A confirmation email is on its way. You can track your order status from your dashboard.
      </p>
      <div className="mt-8 flex gap-3">
        <Button size="lg" asChild><Link href="/dashboard">View orders</Link></Button>
        <Button size="lg" variant="outline" asChild><Link href="/shop">Keep shopping</Link></Button>
      </div>
    </div>
  );
}
