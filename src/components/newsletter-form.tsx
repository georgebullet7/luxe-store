"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowRight } from "lucide-react";
import { newsletterSchema } from "@/lib/validations";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type FormData = z.infer<typeof newsletterSchema>;

export function NewsletterForm() {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
    useForm<FormData>({ resolver: zodResolver(newsletterSchema) });

  async function onSubmit(data: FormData) {
    // POST /api/newsletter in production
    await new Promise((r) => setTimeout(r, 500));
    toast.success("You're subscribed!", { description: data.email });
    reset();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
      <div className="flex gap-2">
        <Input type="email" placeholder="Email address" {...register("email")} aria-label="Email address" />
        <Button type="submit" size="icon" disabled={isSubmitting} aria-label="Subscribe">
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
      {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
    </form>
  );
}
