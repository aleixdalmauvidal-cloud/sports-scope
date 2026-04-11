import type { ReactNode } from "react";
import type { PlayerProfile } from "@/types/database";
import {
  formatCompactNumber,
  formatFollowerGrowthAbsolute,
  formatFollowersCompact,
  formatFormRating,
  formatInteger,
  formatMarketValueMillions,
  formatPercentValue,
  formatScore,
} from "@/lib/format";

type Props = {
  profile: PlayerProfile;
};

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
      {children}
    </h2>
  );
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-5 py-4 shadow-panel-inset">
      <p className="text-xs font-medium text-zinc-500">{label}</p>
      <p className="mt-2 font-mono text-xl font-semibold tabular-nums tracking-tight text-white sm:text-2xl">
        {value}
      </p>
      {sub ? <p className="mt-1 text-[11px] text-zinc-600">{sub}</p> : null}
    </div>
  );
}

function ScoreBar({
  label,
  value,
  max = 100,
}: {
  label: string;
  value: number;
  max?: number;
}) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div>
      <div className="mb-3 flex items-end justify-between gap-3">
        <span className="text-sm font-medium text-zinc-400">{label}</span>
        <span className="font-mono text-2xl font-bold tabular-nums text-white sm:text-3xl">
          {formatScore(value)}
          <span className="ml-1 text-base font-medium text-zinc-500">/100</span>
        </span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-accent-muted to-accent transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function PlayerProfileView({ profile }: Props) {
  const sm = profile.sports_metrics;
  const soc = profile.social_metrics;

  return (
    <div className="space-y-12">
      <section>
        <SectionTitle>Datos deportivos</SectionTitle>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <StatCard
            label="Market value"
            value={formatMarketValueMillions(sm?.market_value_millions ?? null)}
          />
          <StatCard
            label="Minutos jugados"
            value={formatInteger(sm?.minutes_played ?? null)}
          />
          <StatCard label="Goles" value={formatInteger(sm?.goals ?? null)} />
          <StatCard label="Asistencias" value={formatInteger(sm?.assists ?? null)} />
          <StatCard
            label="Form rating"
            value={formatFormRating(sm?.rating ?? null)}
            sub="Media temporada"
          />
        </div>
      </section>

      <section>
        <SectionTitle>Presencia social</SectionTitle>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <StatCard
            label="Seguidores Instagram"
            value={formatFollowersCompact(soc?.instagram_followers ?? null)}
          />
          <StatCard
            label="Seguidores TikTok"
            value={formatFollowersCompact(soc?.tiktok_followers ?? null)}
          />
          <StatCard
            label="Engagement rate"
            value={formatPercentValue(soc?.engagement_rate ?? null)}
          />
          <StatCard
            label="Avg views / post"
            value={formatCompactNumber(soc?.avg_views_per_post ?? null)}
          />
          <StatCard
            label="Crecimiento followers 30d"
            value={formatFollowerGrowthAbsolute(soc?.followers_growth_30d ?? null)}
            sub="Seguidores nuevos (30 días)"
          />
        </div>
      </section>

      <section className="rounded-2xl border border-white/[0.08] bg-gradient-to-b from-accent/[0.06] to-transparent p-6 sm:p-8">
        <SectionTitle>CMV desglose</SectionTitle>
        <div className="mt-8 space-y-10">
          <ScoreBar label="Sports score" value={profile.sports_score} />
          <ScoreBar label="Social score" value={profile.social_score} />
          <div className="border-t border-white/[0.08] pt-10">
            <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-accent-muted">
              CMV total
            </p>
            <p className="mt-3 text-center font-mono text-5xl font-bold tabular-nums tracking-tight text-accent sm:text-6xl [text-shadow:0_0_40px_rgba(46,228,168,0.25)]">
              {formatScore(profile.cmv_total)}
            </p>
            <p className="mt-2 text-center text-sm text-zinc-500">Índice agregado 0–100</p>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-white/[0.06] bg-surface-raised/50 p-5 shadow-panel-inset">
        <h2 className="text-sm font-semibold text-white">Sobre el CMV</h2>
        <p className="mt-2 text-sm leading-relaxed text-zinc-500">
          El CMV es un score de 0 a 100 que combina valor deportivo, presencia en redes e
          historial comercial. Los datos deportivos y sociales mostrados provienen de tus
          tablas <span className="font-mono text-zinc-400">sports_metrics</span> y{" "}
          <span className="font-mono text-zinc-400">social_metrics</span> (última fila por
          fecha).
        </p>
      </section>
    </div>
  );
}
