"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import type { PlayerRow } from "@/types/database";
import { formatScore } from "@/lib/format";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { nationalityToFlagEmoji } from "@/lib/v0-player";

type Props = {
  players: PlayerRow[];
  children?: ReactNode;
};

const positionLabels: Record<string, string> = {
  GK: "POR",
  DF: "DEF",
  MF: "MED",
  FW: "DEL",
};

function positionBadge(pos: string) {
  return positionLabels[pos] ?? pos.slice(0, 3).toUpperCase();
}

/** Accent color by global rank (cycles every 8). */
const RANK_ACCENTS = [
  "#7C6FFF",
  "#00E5A0",
  "#FFB547",
  "#4FC3F7",
  "#7C6FFF",
  "#00E5A0",
  "#FF4D6A",
  "#888888",
] as const;

function accentForRank(rank: number): string {
  return RANK_ACCENTS[(Math.max(1, rank) - 1) % RANK_ACCENTS.length];
}

function playerInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const GAUGE_META = [
  { key: "SPT", color: "#7C6FFF", get: (p: PlayerRow) => p.sports_score },
  { key: "SOC", color: "#00E5A0", get: (p: PlayerRow) => p.social_score },
  { key: "COM", color: "#FFB547", get: (p: PlayerRow) => p.commercial_score },
  { key: "BRD", color: "#4FC3F7", get: (p: PlayerRow) => p.brand_fit_score },
  { key: "MOM", color: "#FF6B9D", get: (p: PlayerRow) => p.momentum_score },
  { key: "ADJ", color: "#69F0AE", get: (p: PlayerRow) => p.adjustment_score },
] as const;

/** Arc from -135° to +135° (270° sweep), math angles; y-up conversion for SVG. */
function MiniArcGauge({
  value,
  color,
  label,
}: {
  value: number;
  color: string;
  label: string;
}) {
  const score = Math.min(100, Math.max(0, Number.isFinite(value) ? value : 0));
  const cx = 18;
  const cy = 18;
  const r = 12.5;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const x1 = cx + r * Math.cos(toRad(-135));
  const y1 = cy - r * Math.sin(toRad(-135));
  const x2 = cx + r * Math.cos(toRad(135));
  const y2 = cy - r * Math.sin(toRad(135));
  const d = `M ${x1} ${y1} A ${r} ${r} 0 1 1 ${x2} ${y2}`;
  const arcLen = (270 / 360) * 2 * Math.PI * r;
  const offset = arcLen * (1 - score / 100);

  return (
    <div className="flex w-9 flex-col items-center gap-0.5">
      <svg width={36} height={36} viewBox="0 0 36 36" className="shrink-0 overflow-visible" aria-hidden>
        <path
          d={d}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={3}
          strokeLinecap="round"
        />
        <path
          d={d}
          fill="none"
          stroke={color}
          strokeWidth={3}
          strokeLinecap="round"
          strokeDasharray={arcLen}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-500 ease-out"
        />
        <text
          x={18}
          y={21}
          textAnchor="middle"
          fill={color}
          className="font-mono text-[8px] font-bold tabular-nums"
          style={{ fontSize: 8 }}
        >
          {formatScore(score)}
        </text>
      </svg>
      <span className="text-[8px] font-bold uppercase tracking-tight text-zinc-500">{label}</span>
    </div>
  );
}

function RankingPlayerCard({ player, rank }: { player: PlayerRow; rank: number }) {
  const accent = accentForRank(rank);
  const flag = nationalityToFlagEmoji(player.nationality);
  const posLabel = positionBadge(player.position);
  /** Placeholder until weekly CMV delta exists in data */
  const trendVsWeek = 0;
  const trendPositive = trendVsWeek >= 0;

  return (
    <Link
      href={`/player/${player.id}`}
      className="group block overflow-hidden rounded-2xl border border-white/[0.1] bg-[#0c0e14] shadow-lg transition hover:border-white/[0.18] hover:shadow-xl"
    >
      <div
        className="relative h-[160px] w-full overflow-hidden rounded-t-2xl"
        style={{
          background: `linear-gradient(145deg, ${accent}2e 0%, #080a10 42%, #06070c 100%)`,
        }}
      >
        <span
          className="pointer-events-none absolute inset-0 flex items-center justify-center font-bold tabular-nums leading-none"
          style={{
            color: accent,
            opacity: 0.05,
            fontSize: 120,
          }}
          aria-hidden
        >
          {rank}
        </span>
        <div className="relative flex h-full flex-col px-4 pb-3 pt-3">
          <div className="flex items-start justify-between gap-2">
            <span className="rounded-full bg-black/35 px-2.5 py-1 font-mono text-[11px] font-bold tabular-nums text-white/90 ring-1 ring-white/10">
              #{rank}
            </span>
            <span
              className="rounded-full bg-black/35 px-2.5 py-1 font-mono text-[11px] font-bold tabular-nums"
              style={{ color: accent, border: `1px solid ${accent}` }}
            >
              CMV {formatScore(Number(player.cmv_total))}
            </span>
          </div>
          <div className="flex flex-1 items-center justify-center">
            <div
              className="flex h-[60px] w-[60px] items-center justify-center rounded-full border-2 font-mono text-lg font-bold tabular-nums text-white"
              style={{
                borderColor: accent,
                backgroundColor: `${accent}26`,
              }}
            >
              {playerInitials(player.name)}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3 px-4 pb-4 pt-3">
        <h3 className="text-[15px] font-bold leading-snug text-white group-hover:text-white/95">
          {player.name}
        </h3>
        <p className="text-[11px] leading-relaxed text-zinc-500">
          <span className="text-zinc-400">{player.club}</span>
          <span className="mx-1 text-zinc-600">·</span>
          <span>{posLabel}</span>
          {flag ? (
            <>
              <span className="mx-1 text-zinc-600">·</span>
              <span title={player.nationality ?? undefined}>{flag}</span>
            </>
          ) : null}
        </p>

        <div className="flex flex-nowrap justify-between gap-0.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {GAUGE_META.map(({ key, color, get }) => (
            <MiniArcGauge key={key} label={key} value={get(player)} color={color} />
          ))}
        </div>

        <div
          className={`flex items-center gap-1.5 text-[11px] font-semibold tabular-nums ${
            trendPositive ? "text-emerald-400" : "text-rose-400"
          }`}
        >
          {trendPositive ? (
            <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 12 12" fill="currentColor" aria-hidden>
              <path d="M6 2.5 L10.5 9.5 L1.5 9.5 Z" />
            </svg>
          ) : (
            <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 12 12" fill="currentColor" aria-hidden>
              <path d="M6 9.5 L10.5 2.5 L1.5 2.5 Z" />
            </svg>
          )}
          <span>
            {trendPositive ? "+" : "−"}
            {formatScore(Math.abs(trendVsWeek))} vs last week
          </span>
        </div>
      </div>
    </Link>
  );
}

const sidebarItems = [
  { label: "Ranking", href: "/", icon: "trophy", active: true },
  { label: "Analítica", href: "#", icon: "chart", active: false },
  { label: "Jugadores", href: "#", icon: "users", active: false },
  { label: "Ajustes", href: "#", icon: "settings", active: false },
] as const;

const CMV_GREEN = "#00E5A0";

function SidebarIcon({ name }: { name: (typeof sidebarItems)[number]["icon"] }) {
  const cls = "h-[20px] w-[20px]";
  switch (name) {
    case "trophy":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h2m10 0h2M5 9a7 7 0 0014 0M8 21h8m-4-4v4" />
        </svg>
      );
    case "chart":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      );
    case "users":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      );
    case "settings":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      );
    default:
      return null;
  }
}

function HeroCard({
  player,
  place,
  pillClass,
  cardClass,
}: {
  player: PlayerRow;
  place: "1st" | "2nd" | "3rd";
  pillClass: string;
  cardClass: string;
}) {
  return (
    <Link
      href={`/player/${player.id}`}
      className={`group relative flex min-h-[180px] flex-col overflow-hidden rounded-2xl border p-7 shadow-xl transition hover:brightness-110 sm:p-8 ${cardClass}`}
    >
      <div className="flex items-start justify-between gap-4">
        <span
          className={`inline-flex rounded-full px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider ${pillClass}`}
        >
          {place}
        </span>
        <PlayerAvatar name={player.name} photoUrl={player.photo_url} size="lg" />
      </div>
      <h3 className="mt-5 text-base font-bold leading-snug text-white group-hover:text-accent">
        {player.name}
      </h3>
      <p className="mt-2 truncate text-sm font-medium text-zinc-400">{player.club}</p>
      {player.league ? (
        <p className="mt-1 truncate text-xs text-zinc-500">{player.league}</p>
      ) : null}
      <div className="mt-auto flex items-end justify-between gap-3 border-t border-white/10 pt-5">
        <span className="text-xs font-semibold uppercase tracking-widest text-zinc-500">CMV</span>
        <span className="bg-gradient-to-r from-[#00E5A0] to-[#A78BFA] bg-clip-text font-mono text-[42px] font-bold leading-none tabular-nums text-transparent">
          {formatScore(Number(player.cmv_total))}
        </span>
      </div>
    </Link>
  );
}

export function RankingDashboard({ players, children }: Props) {
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"table" | "cards">("table");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return players;
    return players.filter((p) => p.name.toLowerCase().includes(q));
  }, [players, query]);

  const top3 = players.slice(0, 3);
  const heroPlaces = [
    {
      place: "1st" as const,
      pillClass: "bg-gold/20 text-gold ring-1 ring-gold/40",
      cardClass:
        "border-gold/30 bg-gradient-to-br from-gold/10 via-surface-card to-surface-raised",
    },
    {
      place: "2nd" as const,
      pillClass: "bg-zinc-500/20 text-zinc-200 ring-1 ring-zinc-400/30",
      cardClass:
        "border-white/15 bg-gradient-to-br from-white/[0.08] via-surface-card to-surface-raised",
    },
    {
      place: "3rd" as const,
      pillClass: "bg-bronze/20 text-amber-400 ring-1 ring-bronze/35",
      cardClass:
        "border-bronze/25 bg-gradient-to-br from-bronze/10 via-surface-card to-surface-raised",
    },
  ];

  return (
    <div className="flex min-h-[calc(100vh-8rem)] w-full max-w-none flex-row">
      <aside className="fixed bottom-0 left-0 top-14 z-40 flex min-w-[64px] w-20 shrink-0 flex-col items-center gap-2 border-r border-white/[0.1] bg-surface-raised/95 px-3 py-6 backdrop-blur-md sm:top-16 sm:w-24 lg:static lg:top-auto lg:z-0 lg:min-h-[calc(100vh-8rem)] lg:w-28 lg:bg-surface-raised/80 lg:px-4 lg:py-8">
        <div className="mb-2 hidden font-mono text-sm font-bold text-accent lg:block">SS</div>
        <nav className="flex flex-1 flex-col items-center gap-3" aria-label="Principal">
          {sidebarItems.map((item) => {
            const content = (
              <span
                className={`flex h-14 w-14 items-center justify-center rounded-2xl transition ${
                  item.active
                    ? "bg-accent/15 text-accent shadow-[0_0_20px_-6px_rgba(0,229,160,0.45)]"
                    : "text-zinc-500 hover:bg-white/[0.06] hover:text-zinc-300"
                }`}
                title={item.label}
              >
                <SidebarIcon name={item.icon} />
              </span>
            );
            return item.href === "/" ? (
              <Link key={item.label} href={item.href}>
                {content}
              </Link>
            ) : (
              <span key={item.label} className="cursor-not-allowed opacity-50" title="Próximamente">
                {content}
              </span>
            );
          })}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col pl-20 sm:pl-24 lg:pl-0">
        {children ? (
          <div className="border-b border-white/[0.08] px-5 py-5 sm:px-8 lg:px-12">
            {children}
          </div>
        ) : null}

        <div className="flex-1 space-y-10 px-5 py-10 text-[17px] leading-relaxed sm:px-8 sm:py-12 lg:px-12 lg:py-12 xl:px-16">
          <header>
            <p className="text-base font-semibold uppercase tracking-[0.2em] text-accent-muted">
              Commercial Market Value
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Rankings CMV
            </h1>
            <p className="mt-4 max-w-3xl text-lg text-zinc-400 sm:text-xl">
              Índice 0–100 que agrega rendimiento deportivo, alcance social y señales de marca.
              Top {players.length} jugadores por puntuación actual.
            </p>
          </header>

          {players.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-surface-card px-6 py-16 text-center">
              <p className="text-lg font-medium text-zinc-200">Sin datos en el ranking</p>
              <p className="mx-auto mt-2 max-w-md text-base text-zinc-500">
                Comprueba <span className="font-mono text-zinc-400">cmv_scores</span>,{" "}
                <span className="font-mono text-zinc-400">athletes</span> y{" "}
                <span className="font-mono text-zinc-400">clubs</span> en Supabase.
              </p>
            </div>
          ) : (
            <>
              <section aria-label="Podio top 3">
                <div className="grid gap-6 md:grid-cols-3 lg:gap-8">
                  {heroPlaces.map((meta, i) =>
                    top3[i] ? (
                      <HeroCard key={top3[i].id} player={top3[i]} {...meta} />
                    ) : (
                      <div
                        key={meta.place}
                        className="flex min-h-[180px] items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] text-base text-zinc-600"
                      >
                        Sin datos
                      </div>
                    )
                  )}
                </div>
              </section>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <label className="relative block w-full sm:max-w-lg">
                  <span className="sr-only">Buscar jugador</span>
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Buscar por nombre…"
                    className="w-full rounded-xl border border-white/[0.12] bg-surface-raised py-3.5 pl-12 pr-5 text-lg text-white placeholder:text-zinc-500 outline-none focus:border-accent/40 focus:ring-2 focus:ring-accent/20"
                  />
                  <svg
                    className="pointer-events-none absolute left-4 top-1/2 h-6 w-6 -translate-y-1/2 text-zinc-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </label>

                <div
                  className="inline-flex rounded-xl border border-white/[0.12] bg-surface-raised p-1.5"
                  role="group"
                  aria-label="Vista"
                >
                  <button
                    type="button"
                    onClick={() => setView("table")}
                    className={`rounded-lg px-6 py-3 text-base font-semibold transition sm:px-8 ${
                      view === "table"
                        ? "bg-accent text-surface shadow-glow"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    Table
                  </button>
                  <button
                    type="button"
                    onClick={() => setView("cards")}
                    className={`rounded-lg px-6 py-3 text-base font-semibold transition sm:px-8 ${
                      view === "cards"
                        ? "bg-accent text-surface shadow-glow"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    Cards
                  </button>
                </div>
              </div>

              <p className="text-base text-zinc-500">
                Mostrando <span className="font-mono font-semibold text-zinc-300">{filtered.length}</span>{" "}
                de {players.length}
              </p>

              {view === "table" ? (
                <div className="w-full max-w-none overflow-hidden rounded-2xl border border-white/[0.1] bg-surface-card shadow-panel">
                  <div className="w-full overflow-x-auto">
                    <table className="w-full min-w-[880px] text-left text-[13px] sm:min-w-[960px]">
                      <thead>
                        <tr className="border-b border-white/[0.1] bg-[#0a0c11]">
                          <th className="min-h-[52px] px-6 py-4 pl-7 text-[13px] font-semibold uppercase tracking-wider text-zinc-400 sm:pl-8 lg:px-8">
                            #
                          </th>
                          <th className="px-6 py-4 text-[13px] font-semibold uppercase tracking-wider text-zinc-400 lg:px-8">
                            Jugador
                          </th>
                          <th className="px-6 py-4 text-[13px] font-semibold uppercase tracking-wider text-zinc-400 lg:px-8">
                            Club
                          </th>
                          <th className="px-6 py-4 text-[13px] font-semibold uppercase tracking-wider text-zinc-400 lg:px-8">
                            Pos.
                          </th>
                          <th className="border-l border-white/[0.08] px-6 py-4 text-right text-[13px] font-semibold uppercase tracking-wider text-zinc-400 lg:px-8">
                            Sports<span className="block font-normal text-zinc-600">/100</span>
                          </th>
                          <th className="px-6 py-4 text-right text-[13px] font-semibold uppercase tracking-wider text-zinc-400 lg:px-8">
                            Social<span className="block font-normal text-zinc-600">/100</span>
                          </th>
                          <th className="border-l border-[#00E5A0]/25 bg-[#00E5A0]/[0.06] px-6 py-4 pr-7 text-right text-[13px] font-semibold uppercase tracking-wider text-zinc-300 sm:pr-8 lg:px-8">
                            CMV<span className="block font-normal text-zinc-500">/100</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="text-[13px]">
                        {filtered.map((p, index) => {
                          const rank = players.findIndex((x) => x.id === p.id) + 1;
                          return (
                            <tr
                              key={p.id}
                              className={`min-h-[52px] border-b border-white/[0.06] transition-colors hover:bg-white/[0.04] ${
                                index % 2 === 1 ? "bg-white/[0.02]" : ""
                              }`}
                            >
                              <td className="h-[52px] min-h-[52px] px-6 py-0 pl-7 align-middle font-mono text-[13px] font-bold text-zinc-400 sm:pl-8 lg:px-8">
                                {rank}
                              </td>
                              <td className="h-[52px] min-h-[52px] px-6 py-0 align-middle lg:px-8">
                                <Link
                                  href={`/player/${p.id}`}
                                  className="flex min-h-[52px] items-center gap-3 py-2 transition hover:opacity-90"
                                >
                                  <PlayerAvatar name={p.name} photoUrl={p.photo_url} size="md" />
                                  <span className="text-[13px] font-semibold text-white hover:text-accent">
                                    {p.name}
                                  </span>
                                </Link>
                              </td>
                              <td className="h-[52px] min-h-[52px] px-6 py-0 align-middle lg:px-8">
                                <div className="py-2">
                                  <span className="block text-[13px] font-medium text-zinc-200">{p.club}</span>
                                  {p.league ? (
                                    <span className="mt-0.5 block text-[13px] text-zinc-500">{p.league}</span>
                                  ) : null}
                                </div>
                              </td>
                              <td className="h-[52px] min-h-[52px] px-6 py-0 align-middle lg:px-8">
                                <span className="inline-flex rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 font-mono text-[13px] font-semibold text-zinc-400">
                                  {positionBadge(p.position)}
                                </span>
                              </td>
                              <td className="h-[52px] min-h-[52px] border-l border-white/[0.08] px-6 py-0 text-right align-middle font-mono text-[13px] tabular-nums text-zinc-200 lg:px-8">
                                {formatScore(Number(p.sports_score))}
                              </td>
                              <td className="h-[52px] min-h-[52px] px-6 py-0 text-right align-middle font-mono text-[13px] tabular-nums text-zinc-200 lg:px-8">
                                {formatScore(Number(p.social_score))}
                              </td>
                              <td className="h-[52px] min-h-[52px] border-l border-[#00E5A0]/20 bg-gradient-to-l from-[#00E5A0]/[0.08] to-transparent px-6 py-0 pr-7 text-right align-middle sm:pr-8 lg:px-8">
                                <span
                                  className="font-mono text-[16px] font-bold tabular-nums"
                                  style={{ color: CMV_GREEN }}
                                >
                                  {formatScore(Number(p.cmv_total))}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  {filtered.length === 0 ? (
                    <p className="border-t border-white/10 py-8 text-center text-base text-zinc-500">
                      Ningún jugador coincide con «{query}».
                    </p>
                  ) : null}
                </div>
              ) : (
                <>
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {filtered.map((p) => {
                      const rank = players.findIndex((x) => x.id === p.id) + 1;
                      return <RankingPlayerCard key={p.id} player={p} rank={rank} />;
                    })}
                  </div>
                  {filtered.length === 0 ? (
                    <p className="py-8 text-center text-base text-zinc-500">
                      Ningún jugador coincide con «{query}».
                    </p>
                  ) : null}
                </>
              )}

              <p className="text-lg leading-relaxed text-zinc-500">
                <span className="font-semibold text-zinc-300">CMV</span> — Commercial Market Value.
                Score agregado 0–100; no equivale al valor de fichaje en euros.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
