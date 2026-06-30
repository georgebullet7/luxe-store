"use client";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Wire to Sentry / logging in production
    console.error(error);
  }, [error]);

  return (
    <div className="container flex flex-col items-center justify-center py-32 text-center">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="mt-2 max-w-sm text-muted-foreground">
        An unexpected error occurred. Please try again.
      </p>
      <Button className="mt-8" onClick={reset}>Try again</Button>
    </div>
  );
}
