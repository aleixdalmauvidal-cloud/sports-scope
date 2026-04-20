"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

type Plan = "free" | "pro" | "enterprise";

type CacheEntry = {
  plan: Plan;
  fetchedAt: number;
};

const CACHE_TTL_MS = 5 * 60 * 1000;
const planCache = new Map<string, CacheEntry>();
const inflight = new Map<string, Promise<Plan>>();

async function fetchPlanForUser(userId: string): Promise<Plan> {
  const supabase = getSupabaseBrowserClient();

  const { data: userRow } = await supabase
    .from("users" as any)
    .select("subscription_plan, organization_id")
    .eq("id", userId)
    .maybeSingle();

  const userPlan = String((userRow as any)?.subscription_plan ?? "").toLowerCase();
  if (userPlan === "pro" || userPlan === "enterprise" || userPlan === "free") {
    return userPlan as Plan;
  }

  const organizationId = (userRow as any)?.organization_id;
  if (organizationId) {
    const { data: subscription } = await supabase
      .from("subscriptions" as any)
      .select("plan, status")
      .eq("organization_id", organizationId)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const status = String((subscription as any)?.status ?? "").toLowerCase();
    const plan = String((subscription as any)?.plan ?? "").toLowerCase();
    const activeStatuses = new Set(["active", "trialing"]);
    if (activeStatuses.has(status) && (plan === "pro" || plan === "enterprise")) {
      return plan as Plan;
    }
  }

  return "free";
}

async function getCachedPlan(userId: string): Promise<Plan> {
  const now = Date.now();
  const cached = planCache.get(userId);
  if (cached && now - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.plan;
  }

  const pending = inflight.get(userId);
  if (pending) return pending;

  const req = fetchPlanForUser(userId)
    .then((plan) => {
      planCache.set(userId, { plan, fetchedAt: Date.now() });
      return plan;
    })
    .catch(() => {
      return "free" as Plan;
    })
    .finally(() => {
      inflight.delete(userId);
    });

  inflight.set(userId, req);
  return req;
}

export function useSubscription() {
  const { user, loading: authLoading } = useAuth();
  const [plan, setPlan] = useState<Plan>("free");
  const [isLoading, setIsLoading] = useState(true);
  const userId = user?.id ?? null;

  useEffect(() => {
    let cancelled = false;

    if (authLoading) {
      setIsLoading(true);
      return () => {
        cancelled = true;
      };
    }

    if (!userId) {
      setPlan("free");
      setIsLoading(false);
      return () => {
        cancelled = true;
      };
    }

    setIsLoading(true);
    getCachedPlan(userId).then((nextPlan) => {
      if (!cancelled) {
        setPlan(nextPlan);
        setIsLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [authLoading, userId]);

  const isPro = useMemo(() => plan === "pro" || plan === "enterprise", [plan]);

  return { plan, isPro, isLoading };
}
