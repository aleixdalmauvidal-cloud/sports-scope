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
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0D1110] px-4 py-12">
        <div className="w-full max-w-[400px] rounded-xl border border-[rgba(56,160,71,0.12)] bg-[#1C2420] p-8 text-center shadow-xl">
          <AuthLogo className="mx-auto h-12 w-12" />
          <h1 className="mt-4 font-display text-xl font-bold text-white">Check your email</h1>
          <p className="mt-2 text-sm text-[#7A9490]">
            We sent a confirmation link to <span className="text-[#C8D8D4]">{email}</span>. Open it to
            activate your account, then sign in.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-block text-sm font-semibold text-[#38A047] hover:text-[#2D9E50]"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0D1110] px-4 py-12">
      <div className="w-full max-w-[400px] rounded-xl border border-[rgba(56,160,71,0.12)] bg-[#1C2420] p-8 shadow-xl">
        <div className="mb-8 flex flex-col items-center">
          <AuthLogo className="h-12 w-12" />
          <h1 className="mt-4 font-display text-2xl font-bold tracking-tight text-white">
            Create your account
          </h1>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label htmlFor="signup-email" className="mb-1.5 block text-xs font-medium text-[#7A9490]">
              Email
            </label>
            <input
              id="signup-email"
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
            <label htmlFor="signup-password" className="mb-1.5 block text-xs font-medium text-[#7A9490]">
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
              className="w-full rounded-lg border border-[rgba(56,160,71,0.15)] bg-[#0D1110] px-3 py-2.5 text-sm text-white placeholder:text-[#4A5E58] outline-none ring-[#2D7A3A]/40 focus:ring-2"
              placeholder="At least 6 characters"
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
            {submitting ? "Creating…" : "Create account"}
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
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-[#38A047] hover:text-[#2D9E50]">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
