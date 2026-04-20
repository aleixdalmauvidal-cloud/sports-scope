import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { getStripeServerClient, getWebhookSecret } from "@/lib/stripe/server";

export const runtime = "nodejs";

function serviceSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }
  return createClient(url, key);
}

function toIso(ts?: number | null) {
  if (!ts) return null;
  return new Date(ts * 1000).toISOString();
}

async function syncSubscription(sub: Stripe.Subscription) {
  const supabase = serviceSupabase();
  const organizationId =
    sub.metadata?.organization_id ||
    (sub.items.data[0]?.metadata?.organization_id as string | undefined) ||
    null;

  if (!organizationId) return;

  const plan = sub.status === "active" || sub.status === "trialing" ? "pro" : "free";
  const payload = {
    organization_id: organizationId,
    stripe_customer_id: typeof sub.customer === "string" ? sub.customer : sub.customer.id,
    stripe_subscription_id: sub.id,
    plan,
    status: sub.status,
    current_period_start: toIso(sub.current_period_start),
    current_period_end: toIso(sub.current_period_end),
    cancel_at_period_end: sub.cancel_at_period_end,
    updated_at: new Date().toISOString(),
  } as any;

  await supabase
    .from("subscriptions" as any)
    .upsert(payload, { onConflict: "stripe_subscription_id" });

  await supabase
    .from("users" as any)
    .update({ subscription_plan: plan, updated_at: new Date().toISOString() })
    .eq("organization_id", organizationId);
}

async function syncCheckoutSession(session: Stripe.Checkout.Session) {
  if (session.mode !== "subscription") return;
  if (!session.subscription) return;
  const stripe = getStripeServerClient();
  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription.id;
  const sub = await stripe.subscriptions.retrieve(subscriptionId);
  await syncSubscription(sub);
}

export async function POST(req: Request) {
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  const rawBody = await req.text();
  const stripe = getStripeServerClient();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, getWebhookSecret());
  } catch (error: any) {
    return NextResponse.json({ error: `Invalid signature: ${error.message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await syncCheckoutSession(event.data.object as Stripe.Checkout.Session);
        break;
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await syncSubscription(event.data.object as Stripe.Subscription);
        break;
      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message ?? "Webhook handler failed" }, { status: 500 });
  }
}
