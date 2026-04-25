"use client";

import { useState } from "react";
import { postStripeCheckout } from "@/lib/stripe/client";

export function CheckoutProButton({ className }: { className?: string }) {
  const [pending, setPending] = useState(false);

  return (
    <button
      type="button"
      disabled={pending}
      className={className}
      onClick={async () => {
        setPending(true);
        try {
          await postStripeCheckout("pro");
        } finally {
          setPending(false);
        }
      }}
    >
      {pending ? "Loading…" : "Start 14-day Free Trial"}
    </button>
  );
}
