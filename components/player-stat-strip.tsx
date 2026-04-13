import type { PlayerProfile } from "@/types/database";
import { formatInteger } from "@/lib/format";

export function PlayerStatStrip({ profile }: { profile: PlayerProfile }) {
  const sports = profile.sports_metrics;
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <div className="rounded-[10px] border border-border bg-card p-4">
        <p className="font-display text-[22px] font-bold text-white">{formatInteger(sports?.goals ?? null)}</p>
        <p className="mt-1 text-[9px] uppercase tracking-[0.14em] text-[#4A5E58]">Goals</p>
      </div>
      <div className="rounded-[10px] border border-border bg-card p-4">
        <p className="font-display text-[22px] font-bold text-white">{formatInteger(sports?.assists ?? null)}</p>
        <p className="mt-1 text-[9px] uppercase tracking-[0.14em] text-[#4A5E58]">Assists</p>
      </div>
      <div className="rounded-[10px] border border-border bg-card p-4">
        <p className="font-display text-[22px] font-bold text-white">{formatInteger(sports?.matches_played ?? null)}</p>
        <p className="mt-1 text-[9px] uppercase tracking-[0.14em] text-[#4A5E58]">Apps</p>
      </div>
      <div className="rounded-[10px] border border-border bg-card p-4">
        <p className="font-display text-[22px] font-bold text-white">{formatInteger(sports?.minutes_played ?? null)}</p>
        <p className="mt-1 text-[9px] uppercase tracking-[0.14em] text-[#4A5E58]">Minutes</p>
      </div>
    </div>
  );
}
