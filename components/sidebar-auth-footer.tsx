"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

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

export function SidebarAuthFooter() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex w-full flex-col items-center gap-2 py-1">
        <div className="h-8 w-8 animate-pulse rounded-full bg-muted/50" />
      </div>
    );
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className="w-full rounded-lg py-2 text-center text-[10px] font-semibold uppercase tracking-wide text-[#38A047] transition hover:bg-[rgba(45,122,58,0.12)]"
      >
        Sign in
      </Link>
    );
  }

  return (
    <div className="flex w-full flex-col items-center gap-2 py-1">
      <div
        className="flex h-8 w-8 items-center justify-center rounded-full border border-[rgba(56,160,71,0.22)] bg-[rgba(45,122,58,0.15)] text-[10px] font-bold text-[#E8F5EA]"
        title={user.email ?? undefined}
      >
        {userInitials(user)}
      </div>
      <button
        type="button"
        onClick={async () => {
          await signOut();
          router.refresh();
        }}
        className="text-[9px] font-medium uppercase tracking-wide text-[#7A9490] transition hover:text-[#C8D8D4]"
      >
        Sign out
      </button>
    </div>
  );
}
