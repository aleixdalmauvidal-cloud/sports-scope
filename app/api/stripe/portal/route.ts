import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getBaseUrl, getStripeServerClient } from "@/lib/stripe/server";

export const runtime = "nodejs";

export async function POST() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();

  if (authErr || !user) {
    const loginUrl = new URL("/login", getBaseUrl());
    loginUrl.searchParams.set("next", "/pricing");
    return NextResponse.json({ redirect: loginUrl.toString() }, { status: 401 });
  }

  const { data: userRow } = await supabase
    .from("users" as any)
    .select("organization_id")
    .eq("id", user.id)
    .maybeSingle();

  const orgId = (userRow as any)?.organization_id as string | undefined;
  if (!orgId) {
    return NextResponse.json({ error: "No organization linked to user" }, { status: 400 });
  }

  const { data: subscription } = await supabase
    .from("subscriptions" as any)
    .select("stripe_customer_id")
    .eq("organization_id", orgId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const customerId = (subscription as any)?.stripe_customer_id as string | undefined;
  if (!customerId) {
    return NextResponse.json({ error: "No Stripe customer found for organization" }, { status: 404 });
  }

  const stripe = getStripeServerClient();
  const portal = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${getBaseUrl()}/pricing`,
  });

  return NextResponse.json({ url: portal.url });
}
