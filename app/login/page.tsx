import { Suspense } from "react";
import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Sign in | Sports Scope",
  description: "Sign in to SportScope for full CMV analysis and rankings.",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0D1110]" />}>
      <LoginForm />
    </Suspense>
  );
}
