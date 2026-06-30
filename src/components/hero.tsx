"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="container grid items-center gap-10 py-16 md:grid-cols-2 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <Badge variant="secondary" className="gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" /> New season drop
          </Badge>
          <h1 className="text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            Premium gear,<br />
            <span className="text-muted-foreground">minimally designed.</span>
          </h1>
          <p className="max-w-md text-lg text-muted-foreground">
            Sound, sport, and everyday essentials engineered to last. Free
            carbon-neutral shipping, 30-day returns, lifetime support.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button size="lg" asChild>
              <Link href="/shop">Shop the collection <ArrowRight className="h-4 w-4" /></Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/shop?category=audio">Explore audio</Link>
            </Button>
          </div>
          <div className="flex gap-8 pt-2 text-sm">
            <Stat value="50k+" label="Happy customers" />
            <Stat value="4.9★" label="Average rating" />
            <Stat value="2-day" label="Free shipping" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="relative aspect-[4/5] overflow-hidden rounded-xl bg-muted shadow-soft-lg md:aspect-square"
        >
          <Image
            src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80"
            alt="Featured product"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        </motion.div>
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-xl font-bold">{value}</p>
      <p className="text-muted-foreground">{label}</p>
    </div>
  );
}
