import Stripe from "stripe";

/**
 * Lazily-instantiated Stripe client.
 *
 * The storefront demo runs WITHOUT any Stripe keys. We therefore expose a
 * nullable singleton: callers check `if (!stripe)` and fall back to a simulated
 * flow. In production set STRIPE_SECRET_KEY in your environment and the real
 * client is used automatically — no other code changes required.
 */
let _stripe: Stripe | null = null;

export function getStripe(): Stripe | null {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  _stripe = new Stripe(key, {
    apiVersion: "2024-12-18.acacia",
    typescript: true,
  });
  return _stripe;
}

export const isStripeConfigured = () => Boolean(process.env.STRIPE_SECRET_KEY);
