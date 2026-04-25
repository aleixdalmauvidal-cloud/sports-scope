"use client";

import Link from "next/link";
import type { PlayerProfile } from "@/types/database";
import { Sidebar } from "@/components/sidebar";

export function PlayerProfileClient({ profile }: { profile: PlayerProfile }) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="ml-20 p-6 lg:p-8">
        <div className="mb-6">
          <Link href="/players" className="text-xs text-foreground-secondary hover:text-foreground">
            Players
          </Link>
          <h1 className="mt-2 text-3xl font-bold text-foreground">{profile.name}</h1>
          <p className="mt-1 text-sm text-foreground-secondary">
            {profile.club} · {profile.league ?? "Unknown league"}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="CMV" value={Math.round(profile.cmv_total)} accent />
          <Stat label="Sports" value={Math.round(profile.sports_score)} />
          <Stat label="Social" value={Math.round(profile.social_score)} />
          <Stat label="Commercial" value={Math.round(profile.commercial_score)} />
        </div>

        <section className="mt-8 rounded-xl border border-border-default bg-background-surface p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground-secondary">
            Player Details
          </h2>
          <div className="mt-4 grid gap-3 text-sm text-foreground-secondary sm:grid-cols-2 lg:grid-cols-3">
            <Info label="Position" value={profile.position || "—"} />
            <Info label="Nationality" value={profile.nationality || "—"} />
            <Info label="Age" value={profile.age != null ? String(profile.age) : "—"} />
            <Info label="CMV Rank" value={profile.cmv_rank != null ? `#${profile.cmv_rank}` : "—"} />
            <Info
              label="Momentum"
              value={profile.momentum_score != null ? String(Math.round(profile.momentum_score)) : "—"}
            />
            <Info
              label="Brand Fit"
              value={profile.brand_fit_score != null ? String(Math.round(profile.brand_fit_score)) : "—"}
            />
          </div>
        </section>
      </main>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className="rounded-xl border border-border-default bg-background-surface p-4">
      <p className="text-xs uppercase tracking-wider text-foreground-tertiary">{label}</p>
      <p className={`mt-2 font-mono text-3xl font-bold ${accent ? "text-accent-primary" : "text-foreground"}`}>
        {value}
      </p>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-foreground-tertiary">{label}</p>
      <p className="mt-1 text-foreground">{value}</p>
    </div>
  );
}
