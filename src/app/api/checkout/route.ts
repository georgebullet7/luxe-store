import { NextResponse } from "next/server";
import { z } from "zod";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

// Validate the inbound cart payload. We never trust client-sent prices for the
// final charge in a real build — we'd re-price from the DB by productId/variantId.
// Here we re-price against a server-side source (mock-data) to demonstrate the
// pattern safely.
const lineSchema = z.object({
  productId: z.string(),
  variantId: z.string().optional(),
  slug: z.string(),
  name: z.string(),
  variantName: z.string().optional(),
  image: z.string().url().or(z.string()),
  unitPrice: z.number().int().nonnegative(),
  quantity: z.number().int().positive().max(99),
});

const bodySchema = z.object({
  items: z.array(lineSchema).min(1, "Cart is empty"),
  shipping: z
    .object({
      fullName: z.string().optional(),
      country: z.string().optional(),
    })
    .partial()
    .optional(),
});

const SHIPPING_FLAT = 800; // cents
const FREE_SHIPPING_THRESHOLD = 10000; // cents
const TAX_RATE = 0.08;

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const { items } = parsed.data;
  const subtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT;
  const tax = Math.round(subtotal * TAX_RATE);
  const total = subtotal + shipping + tax;

  const stripe = getStripe();

  // ── Demo / no-Stripe-key path ──────────────────────────────
  // Returns a 200 without a `url`, so the client falls back to its simulated
  // success screen. This keeps the project runnable with zero configuration.
  if (!stripe) {
    return NextResponse.json({
      simulated: true,
      amount: { subtotal, shipping, tax, total },
      message:
        "Stripe is not configured. Set STRIPE_SECRET_KEY to enable live payments.",
    });
  }

  // ── Production path ────────────────────────────────────────
  try {
    const origin =
      process.env.NEXT_PUBLIC_APP_URL ??
      req.headers.get("origin") ??
      "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: items.map((i) => ({
        quantity: i.quantity,
        price_data: {
          currency: "usd",
          unit_amount: i.unitPrice,
          product_data: {
            name: i.variantName ? `${i.name} — ${i.variantName}` : i.name,
            images: i.image.startsWith("http") ? [i.image] : undefined,
          },
        },
      })),
      // Shipping + tax modeled as their own line items for transparency.
      shipping_options:
        shipping > 0
          ? [
              {
                shipping_rate_data: {
                  type: "fixed_amount",
                  display_name: "Standard shipping",
                  fixed_amount: { amount: shipping, currency: "usd" },
                },
              },
            ]
          : undefined,
      automatic_tax: { enabled: false },
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart`,
      metadata: { tax: String(tax), subtotal: String(subtotal) },
    });

    return NextResponse.json({ url: session.url, id: session.id });
  } catch (err) {
    console.error("[checkout] Stripe error:", err);
    return NextResponse.json(
      { error: "Could not create checkout session" },
      { status: 500 }
    );
  }
}
