import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getBaseUrl, getProPriceId, getStripeServerClient } from "@/lib/stripe/server";

export const runtime = "nodejs";

type UserRow = {
  id: string;
  organization_id: string | null;
  email?: string | null;
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const plan = url.searchParams.get("plan") ?? "pro";
  if (plan !== "pro") {
    return NextResponse.json({ error: "Unsupported plan" }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();

  if (authErr || !user) {
    const loginUrl = new URL("/login", getBaseUrl());
    loginUrl.searchParams.set("next", "/pricing");
    return NextResponse.redirect(loginUrl);
  }

  const { data: userRow } = await supabase
    .from("users" as any)
    .select("id, organization_id, email")
    .eq("id", user.id)
    .maybeSingle();

  const orgId = (userRow as UserRow | null)?.organization_id ?? null;
  if (!orgId) {
    return NextResponse.json(
      { error: "User has no organization_id. Cannot create subscription." },
      { status: 400 }
    );
  }

  const stripe = getStripeServerClient();
  const { data: existingSubscription } = await supabase
    .from("subscriptions" as any)
    .select("stripe_customer_id")
    .eq("organization_id", orgId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let customerId = (existingSubscription as any)?.stripe_customer_id as string | undefined;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email ?? (userRow as UserRow | null)?.email ?? undefined,
      metadata: {
        user_id: user.id,
        organization_id: orgId,
      },
    });
    customerId = customer.id;
  }

  const baseUrl = getBaseUrl();
  const checkout = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: getProPriceId(), quantity: 1 }],
    success_url: `${baseUrl}/pricing?checkout=success`,
    cancel_url: `${baseUrl}/pricing?checkout=cancelled`,
    subscription_data: {
      metadata: {
        organization_id: orgId,
        user_id: user.id,
      },
    },
    metadata: {
      organization_id: orgId,
      user_id: user.id,
      plan: "pro",
    },
    allow_promotion_codes: true,
  });

  if (!checkout.url) {
    return NextResponse.json({ error: "Stripe checkout URL not returned" }, { status: 500 });
  }

  return NextResponse.redirect(checkout.url);
}
