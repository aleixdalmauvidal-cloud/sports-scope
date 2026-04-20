import { Suspense } from "react";
import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Sign in | Sports Scope",
  description: "Sign in to SportScope for full CMV analysis and rankings.",
};

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#08090E]">
          <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,229,160,0.08)_0%,transparent_55%)]" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
