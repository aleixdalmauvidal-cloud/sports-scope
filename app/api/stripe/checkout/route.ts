import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getBaseUrl, getProPriceId, getStripeServerClient } from "@/lib/stripe/server";

export const runtime = "nodejs";

type UserRow = {
  id: string;
  organization_id: string | null;
  email?: string | null;
};

function maskSecret(value: string | undefined) {
  if (!value) return "(missing)";
  if (value.length <= 8) return "*".repeat(value.length);
  return `${value.slice(0, 4)}***${value.slice(-4)}`;
}

export async function POST(request: Request) {
  try {
    console.log("[stripe/checkout] env check", {
      STRIPE_SECRET_KEY: maskSecret(process.env.STRIPE_SECRET_KEY),
      STRIPE_PRO_PRICE_ID: maskSecret(process.env.STRIPE_PRO_PRICE_ID),
    });

    let plan = "pro";
    const contentType = request.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      try {
        const body = (await request.json()) as { plan?: unknown };
        if (typeof body?.plan === "string") plan = body.plan;
      } catch {
        /* empty or invalid JSON — default plan */
      }
    }
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
      return NextResponse.json({ redirect: loginUrl.toString() }, { status: 401 });
    }

    const { data: userRow } = await supabase
      .from("users" as any)
      .select("id, organization_id, email")
      .eq("id", user.id)
      .maybeSingle();

    const orgId = (userRow as UserRow | null)?.organization_id ?? user.id;

    const stripe = getStripeServerClient();
    const priceId = getProPriceId();
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

    const checkout = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://sports-scope.vercel.app"}/pricing?upgraded=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "https://sports-scope.vercel.app"}/pricing`,
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

    return NextResponse.json({ url: checkout.url });
  } catch (error: any) {
    console.error("[stripe/checkout] full error:", error);
    console.error("[stripe/checkout] error stack:", error?.stack);
    return NextResponse.json(
      { error: error?.message ?? "Stripe checkout failed" },
      { status: 500 }
    );
  }
}
