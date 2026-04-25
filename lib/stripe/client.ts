import { loadStripe } from "@stripe/stripe-js";

let stripePromise: ReturnType<typeof loadStripe> | null = null;

export function getStripeJsClient() {
  if (stripePromise) return stripePromise;
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if (!publishableKey) {
    throw new Error("Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY");
  }
  stripePromise = loadStripe(publishableKey);
  return stripePromise;
}

type StripeSessionResponse = {
  url?: string;
  redirect?: string;
  error?: string;
};

/** Browser-only: POST /api/stripe/checkout then navigates to Stripe or login. */
export async function postStripeCheckout(plan: "pro" = "pro"): Promise<void> {
  const res = await fetch("/api/stripe/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ plan }),
    credentials: "same-origin",
  });
  const data = (await res.json().catch(() => ({}))) as StripeSessionResponse;
  if (data.redirect) {
    window.location.assign(data.redirect);
    return;
  }
  if (!res.ok) {
    console.error(data.error ?? res.statusText);
    return;
  }
  if (data.url) window.location.assign(data.url);
}

/** Browser-only: POST /api/stripe/portal then navigates to Stripe billing or login. */
export async function postStripeBillingPortal(): Promise<void> {
  const res = await fetch("/api/stripe/portal", {
    method: "POST",
    credentials: "same-origin",
  });
  const data = (await res.json().catch(() => ({}))) as StripeSessionResponse;
  if (data.redirect) {
    window.location.assign(data.redirect);
    return;
  }
  if (!res.ok) {
    console.error(data.error ?? res.statusText);
    return;
  }
  if (data.url) window.location.assign(data.url);
}
