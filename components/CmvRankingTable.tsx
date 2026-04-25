"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { PlayerRow } from "@/types/database";
import { formatScore } from "@/lib/format";
import { PlayerAvatar } from "@/components/PlayerAvatar";

type Props = {
  players: PlayerRow[];
};

const positionLabels: Record<string, string> = {
  GK: "POR",
  DF: "DEF",
  MF: "MED",
  FW: "DEL",
};

const scoreHeaderTooltip =
  "Score de 0 a 100. Escala normalizada; valores más altos indican mayor puntuación en esa dimensión.";

function ScoreColumnHeader({
  label,
  tooltip = scoreHeaderTooltip,
}: {
  label: string;
  tooltip?: string;
}) {
  return (
    <th
      scope="col"
      title={tooltip}
      className="border-l border-white/[0.1] px-3 py-6 text-right font-mono sm:px-5 lg:px-6 lg:py-7"
    >
      <span className="block text-sm font-semibold uppercase tracking-[0.12em] text-zinc-400">
        {label}
      </span>
      <span className="mt-1 block text-xs font-medium tabular-nums tracking-wide text-zinc-500">
        /100
      </span>
    </th>
  );
}

function positionBadge(pos: string) {
  const short = positionLabels[pos] ?? pos.slice(0, 3).toUpperCase();
  return short;
}

function RankCell({ index }: { index: number }) {
  const n = index + 1;
  const base =
    "inline-flex h-10 min-w-[2.5rem] items-center justify-center rounded-lg font-mono text-base font-bold tabular-nums sm:h-11 sm:min-w-[2.75rem] sm:text-lg";
  if (index === 0) {
    return (
      <span
        className={`${base} bg-gold/15 text-gold ring-1 ring-gold/35 shadow-[0_0_28px_-4px_rgba(212,168,83,0.4)]`}
      >
        {n}
      </span>
    );
  }
  if (index === 1) {
    return (
      <span className={`${base} bg-white/[0.08] text-zinc-200 ring-1 ring-white/[0.14]`}>
        {n}
      </span>
    );
  }
  if (index === 2) {
    return (
      <span
        className={`${base} bg-bronze/15 text-amber-400 ring-1 ring-bronze/35`}
      >
        {n}
      </span>
    );
  }
  return (
    <span className={`${base} bg-white/[0.05] text-zinc-400 ring-1 ring-white/[0.08]`}>
      {n}
    </span>
  );
}

export function CmvRankingTable({ players }: Props) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return players;
    return players.filter((p) => p.name.toLowerCase().includes(q));
  }, [players, query]);

  if (players.length === 0) {
    return (
      <div className="w-full rounded-xl border border-white/[0.1] bg-surface-card/90 px-6 py-20 text-center shadow-panel sm:px-10">
        <p className="text-lg font-medium text-zinc-200">Sin datos en el ranking</p>
        <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-zinc-400">
          No hay filas en <span className="font-mono text-zinc-300">cmv_scores</span> con
          datos enlazados a <span className="font-mono text-zinc-300">athletes</span> y{" "}
          <span className="font-mono text-zinc-300">clubs</span>, o la consulta no pudo
          completarse.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative block w-full sm:max-w-md lg:max-w-lg">
          <span className="sr-only">Buscar jugador</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre…"
            className="w-full rounded-xl border border-white/[0.12] bg-surface-raised py-3.5 pl-12 pr-4 text-base text-white placeholder:text-zinc-500 shadow-panel-inset outline-none ring-accent/0 transition focus:border-accent/40 focus:ring-2 focus:ring-accent/20"
          />
          <span
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
            aria-hidden
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </span>
        </label>
        <p className="shrink-0 text-base tabular-nums text-zinc-400">
          Mostrando{" "}
          <span className="font-mono font-semibold text-zinc-200">{filtered.length}</span>{" "}
          de {players.length}
        </p>
      </div>

      <div className="w-full overflow-hidden rounded-xl border border-white/[0.1] bg-surface-card shadow-panel">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.1] bg-surface-raised/80 px-4 py-4 sm:px-6 lg:px-8 lg:py-5">
          <span className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-400">
            Clasificación CMV
          </span>
          <span className="font-mono text-sm tabular-nums text-zinc-500">
            {players.length} en ranking
          </span>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[920px] table-fixed text-left text-base lg:min-w-0 lg:table-auto">
            <colgroup>
              <col className="w-[4.5rem] sm:w-[5rem]" />
              <col />
              <col className="min-w-[10rem]" />
              <col className="w-[5rem] sm:w-[6rem]" />
              <col className="w-[6.5rem]" />
              <col className="w-[6.5rem]" />
              <col className="w-[7.5rem] sm:w-[8.5rem]" />
            </colgroup>
            <thead>
              <tr className="border-b border-white/[0.1] bg-[#0c0e14]">
                <th
                  scope="col"
                  className="px-3 py-6 pl-4 text-left text-sm font-semibold uppercase tracking-[0.12em] text-zinc-400 sm:pl-6 lg:px-6 lg:py-7 lg:pl-8"
                >
                  #
                </th>
                <th
                  scope="col"
                  className="px-3 py-6 text-left text-sm font-semibold uppercase tracking-[0.12em] text-zinc-400 lg:px-6 lg:py-7"
                >
                  Jugador
                </th>
                <th
                  scope="col"
                  className="px-3 py-6 text-left text-sm font-semibold uppercase tracking-[0.12em] text-zinc-400 lg:px-6 lg:py-7"
                >
                  Club
                </th>
                <th
                  scope="col"
                  className="px-3 py-6 text-left text-sm font-semibold uppercase tracking-[0.12em] text-zinc-400 lg:px-6 lg:py-7"
                >
                  Pos.
                </th>
                <ScoreColumnHeader label="Sports" />
                <ScoreColumnHeader label="Social" />
                <th
                  scope="col"
                  title={`${scoreHeaderTooltip} El CMV agrega deporte, redes e historial comercial.`}
                  className="border-l border-accent/35 bg-accent/[0.08] px-3 py-6 pr-4 text-right sm:pr-6 lg:px-6 lg:py-7 lg:pr-8"
                >
                  <span className="block text-sm font-semibold uppercase tracking-[0.12em] text-accent">
                    CMV total
                  </span>
                  <span className="mt-1 block text-xs font-medium tabular-nums tracking-wide text-accent-muted">
                    /100
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, index) => {
                const originalIndex = players.findIndex((x) => x.id === p.id);
                const rank = originalIndex >= 0 ? originalIndex : index;
                return (
                  <tr
                    key={p.id}
                    className={`group border-b border-white/[0.06] transition-colors last:border-b-0 hover:bg-white/[0.04] ${
                      index % 2 === 1 ? "bg-white/[0.02]" : ""
                    }`}
                  >
                    <td className="px-3 py-5 pl-4 align-middle sm:pl-6 lg:px-6 lg:py-6 lg:pl-8">
                      <RankCell index={rank} />
                    </td>
                    <td className="px-3 py-5 align-middle lg:px-6 lg:py-6">
                      <Link
                        href={`/player/${p.id}`}
                        className="flex min-w-0 items-center gap-4 transition hover:opacity-95"
                      >
                        <PlayerAvatar name={p.name} photoUrl={p.photo_url} size="md" />
                        <span className="min-w-0 truncate text-lg font-semibold leading-snug text-white group-hover:text-accent sm:text-xl">
                          {p.name}
                        </span>
                      </Link>
                    </td>
                    <td className="px-3 py-5 align-middle lg:px-6 lg:py-6">
                      <div className="min-w-0 lg:max-w-[20rem]">
                        <span className="block truncate text-base font-medium text-zinc-200 sm:text-lg">
                          {p.club}
                        </span>
                        {p.league ? (
                          <span className="mt-1 block truncate text-sm text-zinc-500">
                            {p.league}
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-3 py-5 align-middle lg:px-6 lg:py-6">
                      <span className="inline-flex rounded-lg border border-white/[0.1] bg-white/[0.04] px-2.5 py-1.5 font-mono text-sm font-semibold uppercase tracking-wide text-zinc-400">
                        {positionBadge(p.position ?? "")}
                      </span>
                    </td>
                    <td className="border-l border-white/[0.08] px-3 py-5 text-right align-middle font-mono text-lg tabular-nums text-zinc-200 sm:text-xl lg:px-5 lg:py-6">
                      {formatScore(Number(p.sports_score))}
                    </td>
                    <td className="px-3 py-5 text-right align-middle font-mono text-lg tabular-nums text-zinc-200 sm:text-xl lg:px-5 lg:py-6">
                      {formatScore(Number(p.social_score))}
                    </td>
                    <td className="border-l border-accent/25 bg-gradient-to-l from-accent/[0.1] via-accent/[0.03] to-transparent px-3 py-5 pr-4 text-right align-middle sm:pr-6 lg:px-5 lg:py-6 lg:pr-8">
                      <span className="inline-block font-mono text-2xl font-bold tabular-nums tracking-tight text-accent sm:text-3xl lg:text-4xl [text-shadow:0_0_32px_rgba(46,228,168,0.28)]">
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
          <p className="border-t border-white/[0.08] px-6 py-10 text-center text-base text-zinc-400">
            Ningún jugador coincide con «{query}».
          </p>
        ) : null}
      </div>

      <div className="flex gap-4 rounded-xl border border-white/[0.1] bg-surface-raised/60 px-5 py-5 shadow-panel-inset sm:items-start sm:px-8 sm:py-5">
        <span
          className="mt-1.5 hidden h-2 w-2 shrink-0 rounded-full bg-accent sm:block"
          aria-hidden
        />
        <p className="text-base leading-relaxed text-zinc-400">
          <span className="font-semibold text-zinc-200">CMV</span> (Commercial Market
          Value) es un índice de <span className="text-zinc-300">0 a 100</span> que resume
          el valor comercial del futbolista: rendimiento deportivo, alcance y engagement
          en redes, y contexto de marca. No es valor de mercado de fichaje; es una puntuación
          comparativa entre jugadores de la base de datos.
        </p>
      </div>
    </div>
  );
}
