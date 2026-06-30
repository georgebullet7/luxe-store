import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

/**
 * Stripe webhook receiver.
 *
 * Production setup:
 *   1. `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
 *   2. Put the printed signing secret in STRIPE_WEBHOOK_SECRET.
 *
 * On `checkout.session.completed` we would mark the Order PAID, decrement
 * inventory, and send a confirmation email. The DB writes are stubbed with
 * comments since the demo runs on mock data.
 */
export async function POST(req: Request) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !webhookSecret) {
    return NextResponse.json(
      { received: false, reason: "Stripe webhook not configured" },
      { status: 200 }
    );
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const payload = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err) {
    console.error("[webhook] signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      // await prisma.order.update({
      //   where: { stripeSessionId: session.id },
      //   data: { status: "PAID", payment: { update: { status: "SUCCEEDED" } } },
      // });
      // await decrementInventory(session);
      // await sendOrderConfirmationEmail(session.customer_details?.email);
      console.log("[webhook] checkout completed:", session.id);
      break;
    }
    case "payment_intent.payment_failed": {
      const intent = event.data.object as Stripe.PaymentIntent;
      console.warn("[webhook] payment failed:", intent.id);
      break;
    }
    default:
      // Unhandled event types are acknowledged so Stripe stops retrying.
      break;
  }

  return NextResponse.json({ received: true });
}
