import { Suspense } from "react";
import type { Metadata } from "next";
import { SignupForm } from "@/components/auth/signup-form";

export const metadata: Metadata = {
  title: "Create account | Sports Scope",
  description: "Create a free SportScope account.",
};

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#08090E]">
          <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,229,160,0.08)_0%,transparent_55%)]" />
        </div>
      }
    >
      <SignupForm />
    </Suspense>
  );
}
