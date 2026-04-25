"use client";

type Plan = "free" | "pro" | "enterprise";

export function useSubscription() {
  const plan: Plan = "free";
  const isPro = false;
  const isLoading = false;
  return { plan, isPro, isLoading };
}
