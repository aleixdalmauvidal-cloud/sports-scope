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
    <h2 className="section-title">
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
    <div className="rounded-2xl border border-border bg-card/60 px-6 py-6 shadow-panel-inset sm:px-7 sm:py-7">
      <p className="text-base font-medium text-[#7A9490]">{label}</p>
      <p className="font-display mt-3 text-2xl font-semibold tabular-nums tracking-tight text-white sm:text-3xl">
        {value}
      </p>
      {sub ? <p className="mt-2 text-sm text-[#4A5E58]">{sub}</p> : null}
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
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <span className="text-base font-semibold text-zinc-300">{label}</span>
        <span className="font-mono text-3xl font-bold tabular-nums text-white sm:text-4xl">
          {formatScore(value)}
          <span className="ml-2 text-lg font-medium text-zinc-500">/100</span>
        </span>
      </div>
      <div className="h-4 overflow-hidden rounded-full bg-white/[0.08]">
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
    <div className="space-y-14 sm:space-y-16">
      <section>
        <SectionTitle>Datos deportivos</SectionTitle>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
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
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
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

      <section className="rounded-2xl border border-white/[0.12] bg-gradient-to-b from-accent/[0.08] to-transparent p-8 sm:p-10 lg:p-12">
        <SectionTitle>CMV desglose</SectionTitle>
        <div className="mt-10 space-y-12">
          <ScoreBar label="Sports score" value={profile.sports_score} />
          <ScoreBar label="Social score" value={profile.social_score} />
          <div className="border-t border-white/[0.12] pt-12">
            <p className="text-center text-sm font-semibold uppercase tracking-[0.22em] text-accent-muted">
              CMV total
            </p>
            <p className="mt-4 text-center font-mono text-6xl font-bold tabular-nums tracking-tight text-accent sm:text-7xl [text-shadow:0_0_48px_rgba(46,228,168,0.28)]">
              {formatScore(profile.cmv_total)}
            </p>
            <p className="mt-3 text-center text-base text-zinc-400">Índice agregado 0–100</p>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-white/[0.1] bg-surface-raised/70 p-6 shadow-panel-inset sm:p-8">
        <h2 className="text-lg font-semibold text-white">Sobre el CMV</h2>
        <p className="mt-3 text-base leading-relaxed text-zinc-400">
          El CMV es un score de 0 a 100 que combina valor deportivo, presencia en redes e
          historial comercial. Los datos deportivos y sociales mostrados provienen de tus
          tablas <span className="font-mono text-zinc-300">sports_metrics</span> y{" "}
          <span className="font-mono text-zinc-300">social_metrics</span> (última fila por
          fecha).
        </p>
      </section>
    </div>
  );
}
