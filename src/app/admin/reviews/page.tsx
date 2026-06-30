import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RatingStars } from "@/components/rating-stars";
import { reviewsByProduct, products } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Reviews" };

export default function AdminReviewsPage() {
  const nameById = new Map(products.map((p) => [p.id, p.name]));
  const all = Object.entries(reviewsByProduct).flatMap(([pid, list]) =>
    list.map((r) => ({ ...r, productName: nameById.get(pid) ?? pid }))
  );

  return (
    <div className="space-y-4">
      {all.map((r) => (
        <Card key={r.id}>
          <CardContent className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-medium">{r.author}</span>
                {r.isVerified && <Badge variant="secondary">Verified</Badge>}
              </div>
              <RatingStars rating={r.rating} />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              On {r.productName} · {formatDate(r.createdAt)}
            </p>
            {r.title && <p className="mt-2 font-medium">{r.title}</p>}
            <p className="mt-1 text-sm text-muted-foreground">{r.comment}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
