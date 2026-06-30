import { Card, CardContent } from "@/components/ui/card";
import { RatingStars } from "@/components/rating-stars";
import { testimonials } from "@/lib/mock-data";

export function Testimonials() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {testimonials.map((t) => (
        <Card key={t.id} className="h-full">
          <CardContent className="flex h-full flex-col gap-4 p-6">
            <RatingStars rating={t.rating} size={16} />
            <p className="flex-1 text-sm leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
            <div>
              <p className="text-sm font-semibold">{t.name}</p>
              <p className="text-xs text-muted-foreground">{t.role}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
