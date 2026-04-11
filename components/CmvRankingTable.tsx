import Link from "next/link";
import type { PlayerRow } from "@/types/database";
import { formatScore } from "@/lib/format";

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
      className="border-l border-white/[0.06] px-4 py-5 text-right font-mono lg:px-6 lg:py-6"
    >
      <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
        {label}
      </span>
      <span className="mt-1 block text-[11px] font-medium tabular-nums tracking-wide text-zinc-600">
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
    "inline-flex h-9 min-w-[2.25rem] items-center justify-center rounded-lg font-mono text-sm font-bold tabular-nums sm:h-10 sm:min-w-[2.5rem] sm:text-base";
  if (index === 0) {
    return (
      <span
        className={`${base} bg-gold/12 text-gold ring-1 ring-gold/25 shadow-[0_0_24px_-4px_rgba(212,168,83,0.35)]`}
      >
        {n}
      </span>
    );
  }
  if (index === 1) {
    return (
      <span className={`${base} bg-white/[0.06] text-silver ring-1 ring-white/[0.1]`}>
        {n}
      </span>
    );
  }
  if (index === 2) {
    return (
      <span
        className={`${base} bg-bronze/12 text-amber-500/95 ring-1 ring-bronze/30`}
      >
        {n}
      </span>
    );
  }
  return (
    <span className={`${base} bg-white/[0.03] text-zinc-500 ring-1 ring-white/[0.05]`}>
      {n}
    </span>
  );
}

export function CmvRankingTable({ players }: Props) {
  if (players.length === 0) {
    return (
      <div className="rounded-xl border border-white/[0.07] bg-surface-card/80 px-8 py-20 text-center shadow-panel">
        <p className="text-lg font-medium text-zinc-300">Sin datos en el ranking</p>
        <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-zinc-500">
          No hay filas en <span className="font-mono text-zinc-400">cmv_scores</span> con
          datos enlazados a <span className="font-mono text-zinc-400">athletes</span> y{" "}
          <span className="font-mono text-zinc-400">clubs</span>, o la consulta no pudo
          completarse.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-xl border border-white/[0.07] bg-surface-card shadow-panel">
        <div className="flex items-center justify-between border-b border-white/[0.06] bg-surface-raised/50 px-5 py-3.5 sm:px-8 sm:py-4">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
            Clasificación
          </span>
          <span className="font-mono text-xs tabular-nums text-zinc-600 sm:text-sm">
            {players.length} registros
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-base lg:min-w-[960px]">
            <thead>
              <tr className="border-b border-white/[0.06] bg-[#0f1118]">
                <th
                  scope="col"
                  className="px-4 py-5 pl-5 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500 sm:pl-8 lg:px-6 lg:py-6 lg:pl-10"
                >
                  #
                </th>
                <th
                  scope="col"
                  className="px-4 py-5 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500 lg:px-6 lg:py-6"
                >
                  Jugador
                </th>
                <th
                  scope="col"
                  className="px-4 py-5 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500 lg:px-6 lg:py-6"
                >
                  Club
                </th>
                <th
                  scope="col"
                  className="px-4 py-5 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500 lg:px-6 lg:py-6"
                >
                  Pos.
                </th>
                <ScoreColumnHeader label="Sports" />
                <ScoreColumnHeader label="Social" />
                <th
                  scope="col"
                  title={`${scoreHeaderTooltip} El CMV agrega deporte, redes e historial comercial.`}
                  className="border-l border-accent/25 bg-accent/[0.06] px-4 py-5 pr-5 text-right sm:pr-8 lg:px-6 lg:py-6 lg:pr-10"
                >
                  <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-accent">
                    CMV total
                  </span>
                  <span className="mt-1 block text-[11px] font-medium tabular-nums tracking-wide text-accent-muted">
                    /100
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {players.map((p, index) => (
                <tr
                  key={p.id}
                  className={`group border-b border-white/[0.04] transition-colors last:border-b-0 hover:bg-white/[0.03] ${
                    index % 2 === 1 ? "bg-white/[0.012]" : ""
                  }`}
                >
                  <td className="px-4 py-4 pl-5 align-middle sm:pl-8 lg:px-6 lg:py-5 lg:pl-10">
                    <RankCell index={index} />
                  </td>
                  <td className="max-w-[12rem] px-4 py-4 align-middle lg:max-w-none lg:px-6 lg:py-5">
                    <Link
                      href={`/player/${p.id}`}
                      className="block truncate text-lg font-semibold text-zinc-100 transition group-hover:text-accent lg:text-xl lg:leading-snug"
                    >
                      {p.name}
                    </Link>
                  </td>
                  <td className="px-4 py-4 align-middle lg:px-6 lg:py-5">
                    <span className="block truncate text-base text-zinc-400 lg:max-w-[18rem] lg:text-lg">
                      {p.club}
                    </span>
                  </td>
                  <td className="px-4 py-4 align-middle lg:px-6 lg:py-5">
                    <span className="inline-flex rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 font-mono text-xs font-semibold uppercase tracking-wide text-zinc-500 sm:text-sm">
                      {positionBadge(p.position)}
                    </span>
                  </td>
                  <td className="border-l border-white/[0.06] px-4 py-4 text-right align-middle font-mono text-lg tabular-nums text-zinc-300 lg:px-6 lg:py-5 lg:text-xl">
                    {formatScore(Number(p.sports_score))}
                  </td>
                  <td className="px-4 py-4 text-right align-middle font-mono text-lg tabular-nums text-zinc-300 lg:px-6 lg:py-5 lg:text-xl">
                    {formatScore(Number(p.social_score))}
                  </td>
                  <td className="border-l border-accent/20 bg-gradient-to-l from-accent/[0.08] via-accent/[0.02] to-transparent px-4 py-4 pr-5 align-middle text-right sm:pr-8 lg:px-6 lg:py-5 lg:pr-10">
                    <span className="inline-block font-mono text-2xl font-bold tabular-nums tracking-tight text-accent sm:text-3xl lg:text-4xl [text-shadow:0_0_28px_rgba(46,228,168,0.22)]">
                      {formatScore(Number(p.cmv_total))}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex gap-3 rounded-lg border border-white/[0.06] bg-surface-raised/40 px-5 py-4 shadow-panel-inset sm:items-start sm:px-6 sm:py-4">
        <span
          className="mt-2 hidden h-1.5 w-1.5 shrink-0 rounded-full bg-accent sm:block"
          aria-hidden
        />
        <p className="text-sm leading-relaxed text-zinc-500">
          <span className="font-semibold text-zinc-400">CMV</span> = Commercial Market
          Value. Score 0–100 que combina valor deportivo, presencia en redes sociales e
          historial comercial.
        </p>
      </div>
    </div>
  );
}
