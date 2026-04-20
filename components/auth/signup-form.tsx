"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { AuthLogo } from "@/components/auth/auth-logo";
import { GoogleIcon } from "@/components/auth/google-icon";

export function SignupForm() {
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
  const [checkEmail, setCheckEmail] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const origin = window.location.origin;
    const { data, error: signError } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${origin}/auth/callback?next=/rankings` },
    });
    setSubmitting(false);
    if (signError) {
      setError(signError.message);
      return;
    }
    if (data.session) {
      router.push("/rankings");
      router.refresh();
      return;
    }
    setCheckEmail(true);
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

  if (checkEmail) {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center bg-[#08090E] px-4 py-12">
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,229,160,0.08)_0%,transparent_55%)]" />
        <div className="relative w-full max-w-[420px] rounded-2xl border border-white/[0.08] bg-[#0D0F18] p-8 text-center shadow-[0_0_0_1px_rgba(0,229,160,0.04),0_24px_80px_rgba(0,0,0,0.55)]">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.08] bg-[#08090E]">
            <AuthLogo className="h-10 w-10" />
          </div>
          <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.28em] text-[#00E5A0]">
            Verify email
          </p>
          <h1 className="mt-2 font-display text-xl font-bold text-white">Check your email</h1>
          <p className="mt-2 text-sm text-[#9CA3AF]">
            We sent a confirmation link to{" "}
            <span className="font-mono text-[#E5E7EB]">{email}</span>. Open it to activate your
            account, then sign in.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-block text-sm font-semibold text-[#00E5A0] hover:brightness-110"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-[#08090E] px-4 py-12">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,229,160,0.08)_0%,transparent_55%)]" />
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:48px_48px] opacity-40" />

      <div className="relative w-full max-w-[420px] rounded-2xl border border-white/[0.08] bg-[#0D0F18] p-8 shadow-[0_0_0_1px_rgba(0,229,160,0.04),0_24px_80px_rgba(0,0,0,0.55)]">
        <div className="mb-8 flex flex-col items-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.08] bg-[#08090E] shadow-[0_0_40px_rgba(0,229,160,0.12)]">
            <AuthLogo className="h-10 w-10" />
          </div>
          <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.28em] text-[#00E5A0]">
            Sports Scope
          </p>
          <h1 className="mt-2 text-center font-display text-2xl font-bold tracking-tight text-white">
            Create your account
          </h1>
          <p className="mt-2 text-center text-sm text-[#9CA3AF]">
            Free access to rankings and profiles. Upgrade later for Pro intelligence.
          </p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label
              htmlFor="signup-email"
              className="mb-1.5 block font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-[#9CA3AF]"
            >
              Email
            </label>
            <input
              id="signup-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-white/[0.08] bg-[#08090E] px-3 py-2.5 text-sm text-white placeholder:text-[#6B7280] outline-none transition focus:border-[#00E5A0]/50 focus:ring-2 focus:ring-[#00E5A0]/20"
              placeholder="you@company.com"
            />
          </div>
          <div>
            <label
              htmlFor="signup-password"
              className="mb-1.5 block font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-[#9CA3AF]"
            >
              Password
            </label>
            <input
              id="signup-password"
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-white/[0.08] bg-[#08090E] px-3 py-2.5 font-mono text-sm text-white placeholder:text-[#6B7280] outline-none transition focus:border-[#00E5A0]/50 focus:ring-2 focus:ring-[#00E5A0]/20"
              placeholder="At least 6 characters"
            />
            <p className="mt-1.5 font-mono text-[11px] text-[#6B7280]">Minimum length: 6</p>
          </div>

          {error ? (
            <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 font-mono text-xs text-red-300">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-[#00E5A0] py-3 text-sm font-semibold text-black transition hover:brightness-95 disabled:opacity-60"
          >
            {submitting ? "Creating…" : "Create account"}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/[0.08]" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase tracking-wider text-[#6B7280]">
            <span className="bg-[#0D0F18] px-2 font-mono">Or</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGoogle}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/[0.12] bg-[#08090E] py-3 text-sm font-medium text-white transition hover:border-[#00E5A0]/35 hover:bg-white/[0.03]"
        >
          <GoogleIcon className="h-5 w-5" />
          Continue with Google
        </button>

        <p className="mt-8 text-center text-sm text-[#9CA3AF]">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-[#00E5A0] hover:brightness-110">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
