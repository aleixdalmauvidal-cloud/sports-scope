"use client";

import Link from "next/link";
import type { PlayerProfile } from "@/types/database";
import { Sidebar } from "@/components/sidebar";
import { PlayerProfileView } from "@/components/PlayerProfileView";

export function PlayerProfileClient({ profile }: { profile: PlayerProfile }) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="ml-20 p-6 lg:p-8">
        <header className="mb-8">
          <Link href="/rankings" className="text-xs text-foreground-secondary hover:text-foreground">
            Rankings
          </Link>
          <h1 className="mt-2 text-3xl font-bold text-foreground">{profile.name}</h1>
          <p className="mt-1 text-sm text-foreground-secondary">
            {profile.club} · {profile.league ?? "Unknown league"}
          </p>
        </header>

        <PlayerProfileView profile={profile} />
      </main>
    </div>
  );
}
