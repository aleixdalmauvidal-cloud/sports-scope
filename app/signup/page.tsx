import { Suspense } from "react";
import type { Metadata } from "next";
import { SignupForm } from "@/components/auth/signup-form";

export const metadata: Metadata = {
  title: "Create account | Sports Scope",
  description: "Create a free SportScope account.",
};

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0D1110]" />}>
      <SignupForm />
    </Suspense>
  );
}
