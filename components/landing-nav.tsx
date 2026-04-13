"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 44 44" fill="none" aria-hidden className={className}>
      <circle cx="22" cy="22" r="18" stroke="#2D7A3A" strokeWidth={1.5} />
      <circle cx="22" cy="22" r="10" stroke="#38A047" strokeWidth={1.5} />
      <circle cx="22" cy="22" r="3" fill="#38A047" />
      <line x1="4" y1="22" x2="12" y2="22" stroke="#2D7A3A" strokeWidth={1.5} strokeLinecap="round" />
      <line x1="32" y1="22" x2="40" y2="22" stroke="#2D7A3A" strokeWidth={1.5} strokeLinecap="round" />
      <line x1="22" y1="4" x2="22" y2="12" stroke="#2D7A3A" strokeWidth={1.5} strokeLinecap="round" />
      <line x1="22" y1="32" x2="22" y2="40" stroke="#2D7A3A" strokeWidth={1.5} strokeLinecap="round" />
    </svg>
  );
}

function userInitials(user: { email?: string | null; user_metadata?: { full_name?: string } }) {
  const name = user.user_metadata?.full_name?.trim();
  if (name) {
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0]![0] + parts[parts.length - 1]![0]).toUpperCase();
    return parts[0]!.slice(0, 2).toUpperCase();
  }
  const e = user.email?.split("@")[0] ?? "?";
  return e.slice(0, 2).toUpperCase();
}

export function LandingNav() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  return (
    <header className="relative z-20 border-b border-[rgba(56,160,71,0.08)] bg-[#0D1110]/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 lg:h-[4.25rem] lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <LogoMark className="h-10 w-10 shrink-0" />
          <span className="font-display text-lg font-semibold tracking-tight text-white">Sports Scope</span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/rankings"
            className="rounded-lg px-2 py-2 text-sm text-[#7A9490] transition hover:bg-white/[0.04] hover:text-white sm:px-3"
          >
            Rankings
          </Link>
          <Link
            href="/compare"
            className="hidden rounded-lg px-3 py-2 text-sm text-[#7A9490] transition hover:bg-white/[0.04] hover:text-white sm:inline-block"
          >
            Compare
          </Link>

          {loading ? (
            <span className="h-9 w-20 animate-pulse rounded-lg bg-white/[0.06]" aria-hidden />
          ) : user ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden max-w-[140px] items-center gap-2 sm:flex" title={user.email ?? undefined}>
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[rgba(56,160,71,0.25)] bg-[rgba(45,122,58,0.15)] text-[10px] font-semibold text-[#E8F5EA]">
                  {userInitials(user)}
                </div>
                <span className="truncate text-xs text-[#C8D8D4]">{user.email}</span>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[rgba(56,160,71,0.25)] bg-[rgba(45,122,58,0.15)] text-[10px] font-semibold text-[#E8F5EA] sm:hidden">
                {userInitials(user)}
              </div>
              <button
                type="button"
                onClick={async () => {
                  await signOut();
                  router.refresh();
                }}
                className="rounded-lg px-3 py-2 text-sm text-[#7A9490] transition hover:bg-white/[0.04] hover:text-white"
              >
                Sign out
              </button>
            </div>
          ) : (
            <>
              <Link href="/login" className="rounded-lg px-3 py-2 text-sm text-[#7A9490] transition hover:text-white">
                Sign in
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-[#2D7A3A] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#256d33]"
              >
                Get access
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
