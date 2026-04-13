"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { AuthLogo } from "@/components/auth/auth-logo";
import { GoogleIcon } from "@/components/auth/google-icon";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = getSupabaseBrowserClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const rawErr = searchParams.get("error");
  const [error, setError] = useState<string | null>(() => {
    if (!rawErr) return null;
    try {
      return decodeURIComponent(rawErr);
    } catch {
      return rawErr;
    }
  });
  const [submitting, setSubmitting] = useState(false);

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const { error: signError } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);
    if (signError) {
      setError(signError.message);
      return;
    }
    router.push("/rankings");
    router.refresh();
  }

  async function handleGoogle() {
    setError(null);
    const origin = window.location.origin;
    const { error: oAuthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${origin}/auth/callback?next=/rankings` },
    });
    if (oAuthError) setError(oAuthError.message);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0D1110] px-4 py-12">
      <div className="w-full max-w-[400px] rounded-xl border border-[rgba(56,160,71,0.12)] bg-[#1C2420] p-8 shadow-xl">
        <div className="mb-8 flex flex-col items-center">
          <AuthLogo className="h-12 w-12" />
          <h1 className="mt-4 font-display text-2xl font-bold tracking-tight text-white">
            Sign in to SportScope
          </h1>
        </div>

        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label htmlFor="login-email" className="mb-1.5 block text-xs font-medium text-[#7A9490]">
              Email
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-[rgba(56,160,71,0.15)] bg-[#0D1110] px-3 py-2.5 text-sm text-white placeholder:text-[#4A5E58] outline-none ring-[#2D7A3A]/40 focus:ring-2"
              placeholder="you@company.com"
            />
          </div>
          <div>
            <label htmlFor="login-password" className="mb-1.5 block text-xs font-medium text-[#7A9490]">
              Password
            </label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-[rgba(56,160,71,0.15)] bg-[#0D1110] px-3 py-2.5 text-sm text-white placeholder:text-[#4A5E58] outline-none ring-[#2D7A3A]/40 focus:ring-2"
              placeholder="••••••••"
            />
          </div>

          {error ? (
            <p className="rounded-lg bg-[#D94F4F]/10 px-3 py-2 text-xs text-[#D94F4F]">{error}</p>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-[#2D7A3A] py-3 text-sm font-semibold text-white transition hover:bg-[#256d33] disabled:opacity-60"
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[rgba(56,160,71,0.12)]" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase tracking-wider text-[#4A5E58]">
            <span className="bg-[#1C2420] px-2">Or</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGoogle}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-[rgba(56,160,71,0.2)] bg-[#0D1110] py-3 text-sm font-medium text-white transition hover:border-[rgba(56,160,71,0.35)]"
        >
          <GoogleIcon className="h-5 w-5" />
          Continue with Google
        </button>

        <p className="mt-8 text-center text-sm text-[#7A9490]">
          No account?{" "}
          <Link href="/signup" className="font-semibold text-[#38A047] hover:text-[#2D9E50]">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
