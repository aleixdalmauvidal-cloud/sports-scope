import Stripe from "stripe";

let stripeClient: Stripe | null = null;

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing ${name}`);
  }
  return value;
}

export function getStripeServerClient() {
  if (stripeClient) return stripeClient;
  stripeClient = new Stripe(requiredEnv("STRIPE_SECRET_KEY"), {
    apiVersion: "2025-03-31.basil",
  });
  return stripeClient;
}

export function getBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    "http://localhost:3000"
  );
}

export function getProPriceId() {
  return requiredEnv("STRIPE_PRO_PRICE_ID");
}

export function getWebhookSecret() {
  return requiredEnv("STRIPE_WEBHOOK_SECRET");
}
