"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import {
  type GetPlayersWithFiltersOptions,
  type PlayerDatabaseStats,
  type PlayerDirectoryRow,
  type PlayersDirectoryCmvRange,
  type PlayersDirectoryPositionAbbrev,
  type PlayersDirectorySort,
  opportunityScoreAccent,
  nationalityToFlagEmoji,
} from "@/lib/players";
import { abbreviatePositionLabel, LEAGUE_OPTIONS } from "@/lib/rankings-filters";

const PAGE_SIZE = 50;

const POSITION_OPTIONS: PlayersDirectoryPositionAbbrev[] = ["All", "FW", "MF", "DF", "GK"];

const CMV_RANGE_OPTIONS: { value: PlayersDirectoryCmvRange; label: string }[] = [
  { value: "all", label: "All" },
  { value: "60plus", label: "60+" },
  { value: "40-60", label: "40–60" },
  { value: "20-40", label: "20–40" },
  { value: "under20", label: "Under 20" },
];

const SORT_OPTIONS: { value: PlayersDirectorySort; label: string }[] = [
  { value: "cmv", label: "CMV Score" },
  { value: "sports", label: "Sports" },
  { value: "social", label: "Social" },
  { value: "momentum", label: "Momentum" },
];

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function scoreRound(n: number): number {
  return Math.round(Number.isFinite(n) ? n : 0);
}

function isHiddenGem(row: PlayerDirectoryRow): boolean {
  return (
    row.cmv_rank > 100 &&
    (scoreRound(row.social_score) > 60 || row.opportunity_score > 65)
  );
}

function OppBadge({ score }: { score: number }) {
  const accent = opportunityScoreAccent(score);
  const muted = score < 60;
  return (
    <span
      className="inline-flex min-w-[2rem] items-center justify-center rounded px-1.5 py-0.5 text-xs font-semibold tabular-nums"
      style={
        muted
          ? {
              color: "rgba(255,255,255,0.55)",
              backgroundColor: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
            }
          : {
              color: accent,
              backgroundColor: `${accent}22`,
              border: `1px solid ${accent}44`,
            }
      }
    >
      {score}
    </span>
  );
}

function WeeklyDelta({ change }: { change: number }) {
  if (change === 0) {
    return (
      <div className="flex items-center gap-0.5 text-muted-foreground">
        <Minus className="h-3 w-3" />
        <span className="text-xs tabular-nums">0.0</span>
      </div>
    );
  }
  const isPositive = change > 0;
  const Icon = isPositive ? TrendingUp : TrendingDown;
  const colorClass = isPositive ? "text-[#2D9E50]" : "text-[#D94F4F]";
  return (
    <div className={`flex items-center gap-0.5 ${colorClass}`}>
      <Icon className="h-3 w-3" />
      <span className="text-xs tabular-nums">
        {isPositive ? "+" : ""}
        {change.toFixed(1)}
      </span>
    </div>
  );
}

function buildQueryString(params: URLSearchParams): string {
  const s = params.toString();
  return s ? `?${s}` : "";
}

export interface PlayersDatabaseClientProps {
  players: PlayerDirectoryRow[];
  totalCount: number;
  page: number;
  stats: PlayerDatabaseStats;
  weeklyDelta: Record<string, number>;
  initial: Pick<
    GetPlayersWithFiltersOptions,
    "search" | "league" | "position" | "cmvRange" | "sort"
  >;
}

export function PlayersDatabaseClient({
  players,
  totalCount,
  page,
  stats,
  weeklyDelta,
  initial,
}: PlayersDatabaseClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const qFromUrl = searchParams.get("q") ?? "";
  const [searchDraft, setSearchDraft] = useState(qFromUrl || initial.search || "");
  useEffect(() => {
    setSearchDraft(qFromUrl || initial.search || "");
  }, [qFromUrl, initial.search]);

  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, []);

  const pushParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const next = new URLSearchParams(searchParams.toString());
      next.delete("page");
      for (const [k, v] of Object.entries(updates)) {
        if (v === undefined || v === "") {
          next.delete(k);
        } else {
          next.set(k, v);
        }
      }
      startTransition(() => {
        router.push(`${pathname}${buildQueryString(next)}`);
      });
    },
    [pathname, router, searchParams]
  );

  const from = totalCount === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, totalCount);
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const prevHref = useMemo(() => {
    const next = new URLSearchParams(searchParams.toString());
    if (page <= 2) next.delete("page");
    else next.set("page", String(page - 1));
    return `${pathname}${buildQueryString(next)}`;
  }, [searchParams, pathname, page]);

  const nextHref = useMemo(() => {
    const next = new URLSearchParams(searchParams.toString());
    next.set("page", String(page + 1));
    return `${pathname}${buildQueryString(next)}`;
  }, [searchParams, pathname, page]);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="ml-20 min-h-screen">
        <div className="p-6 lg:p-8">
          <p className="mb-2 text-[10px] uppercase tracking-[0.18em] text-[#38A047]">
            PLAYER DATABASE
          </p>
          <h1 className="font-display text-[26px] font-bold text-foreground">All Players</h1>
          <p className="mt-1 text-[11px] text-[#4A5E58]">
            1400+ footballers ranked by Commercial Market Value
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-border pb-4 text-xs text-muted-foreground">
            <span>
              <span className="font-medium text-foreground">{stats.playerCount.toLocaleString()}</span>{" "}
              players
            </span>
            <span className="text-border">·</span>
            <span>
              <span className="font-medium text-foreground">{stats.leagueCount}</span> leagues
            </span>
            <span className="text-border">·</span>
            <span>
              <span className="font-medium text-foreground">{stats.clubCount.toLocaleString()}</span>{" "}
              clubs
            </span>
          </div>

          <div
            className={`mt-4 flex flex-wrap items-end gap-2 rounded-lg border border-border bg-card/40 p-3 ${isPending ? "opacity-70" : ""}`}
          >
            <label className="flex min-w-[140px] flex-1 flex-col gap-1">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Search</span>
              <input
                type="search"
                name="q"
                value={searchDraft}
                placeholder="Search by name..."
                className="h-8 w-full rounded-md border border-border bg-background px-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-[#2D7A3A] focus:outline-none focus:ring-1 focus:ring-[#2D7A3A]/50"
                onChange={(e) => {
                  const v = e.target.value;
                  setSearchDraft(v);
                  if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
                  searchDebounceRef.current = setTimeout(() => {
                    pushParams({ q: v.trim() || undefined });
                  }, 320);
                }}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">League</span>
              <select
                className="h-8 min-w-[118px] rounded-md border border-border bg-background px-2 text-xs text-foreground"
                value={initial.league ?? "All"}
                onChange={(e) =>
                  pushParams({ league: e.target.value === "All" ? undefined : e.target.value })
                }
              >
                {LEAGUE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt === "All" ? "All" : opt}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Position</span>
              <select
                className="h-8 min-w-[72px] rounded-md border border-border bg-background px-2 text-xs text-foreground"
                value={initial.position ?? "All"}
                onChange={(e) =>
                  pushParams({
                    position: e.target.value === "All" ? undefined : e.target.value,
                  })
                }
              >
                {POSITION_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">CMV</span>
              <select
                className="h-8 min-w-[88px] rounded-md border border-border bg-background px-2 text-xs text-foreground"
                value={initial.cmvRange ?? "all"}
                onChange={(e) => {
                  const v = e.target.value as PlayersDirectoryCmvRange;
                  pushParams({ range: v === "all" ? undefined : v });
                }}
              >
                {CMV_RANGE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Sort</span>
              <select
                className="h-8 min-w-[112px] rounded-md border border-border bg-background px-2 text-xs text-foreground"
                value={initial.sort ?? "cmv"}
                onChange={(e) => {
                  const v = e.target.value as PlayersDirectorySort;
                  pushParams({ sort: v === "cmv" ? undefined : v });
                }}
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-4 overflow-x-auto rounded-[10px] border border-border bg-card">
            <table className="w-full table-fixed text-left text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/20">
                  <th className="w-10 px-2 py-2 font-medium uppercase tracking-wider text-muted-foreground">
                    Rank
                  </th>
                  <th className="min-w-[200px] px-2 py-2 font-medium uppercase tracking-wider text-muted-foreground">
                    Player
                  </th>
                  <th className="hidden w-24 px-2 py-2 font-medium uppercase tracking-wider text-muted-foreground sm:table-cell">
                    League
                  </th>
                  <th className="w-12 px-2 py-2 font-medium uppercase tracking-wider text-muted-foreground">
                    Pos
                  </th>
                  <th className="w-11 px-2 py-2 font-medium uppercase tracking-wider text-muted-foreground">
                    CMV
                  </th>
                  <th className="hidden w-11 px-2 py-2 font-medium uppercase tracking-wider text-muted-foreground md:table-cell">
                    Sports
                  </th>
                  <th className="hidden w-11 px-2 py-2 font-medium uppercase tracking-wider text-muted-foreground md:table-cell">
                    Social
                  </th>
                  <th className="hidden w-11 px-2 py-2 font-medium uppercase tracking-wider text-muted-foreground lg:table-cell">
                    OPP
                  </th>
                  <th className="w-14 px-2 py-2 font-medium uppercase tracking-wider text-muted-foreground">
                    7D
                  </th>
                </tr>
              </thead>
              <tbody>
                {players.map((row) => {
                  const flag = nationalityToFlagEmoji(row.nationality);
                  const highCmv = scoreRound(row.cmv_total) > 60;
                  const gem = isHiddenGem(row);
                  const delta = weeklyDelta[row.id] ?? 0;
                  return (
                    <tr
                      key={row.id}
                      className={`group border-b border-border transition-colors hover:bg-[rgba(45,122,58,0.06)] ${
                        highCmv ? "border-l-2 border-l-[#38A047]/70" : ""
                      }`}
                    >
                      <td className="px-2 py-1.5 align-middle tabular-nums text-muted-foreground">
                        <Link href={`/player/${row.id}`} className="block">
                          {row.cmv_rank}
                        </Link>
                      </td>
                      <td className="px-2 py-1.5 align-middle">
                        <Link href={`/player/${row.id}`} className="flex min-w-0 items-center gap-2">
                          <div className="flex h-7 w-7 shrink-0 overflow-hidden rounded-md bg-gradient-to-br from-[#2D7A3A]/30 to-[#38A047]/30 text-[10px] font-medium text-foreground">
                            {row.photo_url ? (
                              <img
                                src={row.photo_url}
                                alt=""
                                className="h-full w-full object-cover object-top"
                              />
                            ) : (
                              <span className="flex h-full w-full items-center justify-center">
                                {initials(row.name)}
                              </span>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="truncate font-medium text-foreground group-hover:text-[#38A047]">
                                {row.name}
                              </span>
                              {gem ? (
                                <span className="shrink-0 rounded border border-amber-500/35 bg-amber-500/10 px-1 py-px text-[9px] font-semibold uppercase tracking-wide text-amber-400">
                                  Hidden Gem
                                </span>
                              ) : null}
                            </div>
                            <div className="truncate text-[10px] text-muted-foreground">
                              {row.club} · {flag}
                            </div>
                          </div>
                        </Link>
                      </td>
                      <td className="hidden px-2 py-1.5 align-middle text-muted-foreground sm:table-cell">
                        <Link href={`/player/${row.id}`} className="block truncate">
                          {row.league ?? "—"}
                        </Link>
                      </td>
                      <td className="px-2 py-1.5 align-middle text-muted-foreground">
                        <Link href={`/player/${row.id}`} className="block">
                          {abbreviatePositionLabel(row.position)}
                        </Link>
                      </td>
                      <td className="px-2 py-1.5 align-middle font-display font-semibold tabular-nums text-[#38A047]">
                        <Link href={`/player/${row.id}`} className="block">
                          {scoreRound(row.cmv_total)}
                        </Link>
                      </td>
                      <td className="hidden px-2 py-1.5 align-middle tabular-nums md:table-cell">
                        <Link href={`/player/${row.id}`} className="block">
                          {scoreRound(row.sports_score)}
                        </Link>
                      </td>
                      <td className="hidden px-2 py-1.5 align-middle tabular-nums md:table-cell">
                        <Link href={`/player/${row.id}`} className="block">
                          {scoreRound(row.social_score)}
                        </Link>
                      </td>
                      <td className="hidden px-2 py-1.5 align-middle lg:table-cell">
                        <Link href={`/player/${row.id}`} className="block">
                          <OppBadge score={row.opportunity_score} />
                        </Link>
                      </td>
                      <td className="px-2 py-1.5 align-middle">
                        <Link href={`/player/${row.id}`} className="block">
                          <WeeklyDelta change={delta} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {players.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                No players match your filters.
              </div>
            ) : null}
          </div>

          <div className="mt-4 flex flex-col items-center justify-between gap-3 border-t border-border pt-4 text-xs text-muted-foreground sm:flex-row">
            <p>
              Showing{" "}
              <span className="font-medium text-foreground">
                {from}-{to}
              </span>{" "}
              of{" "}
              <span className="font-medium text-foreground">{totalCount.toLocaleString()}</span>
            </p>
            <div className="flex items-center gap-2">
              <Link
                href={prevHref}
                aria-disabled={page <= 1}
                className={`inline-flex h-8 items-center gap-1 rounded-md border border-border px-3 font-medium ${
                  page <= 1
                    ? "pointer-events-none opacity-40"
                    : "hover:bg-muted/50 text-foreground"
                }`}
              >
                <ChevronLeft className="h-4 w-4" />
                Prev
              </Link>
              <span className="tabular-nums text-muted-foreground">
                Page {page} / {totalPages}
              </span>
              <Link
                href={nextHref}
                aria-disabled={page >= totalPages}
                className={`inline-flex h-8 items-center gap-1 rounded-md border border-border px-3 font-medium ${
                  page >= totalPages
                    ? "pointer-events-none opacity-40"
                    : "hover:bg-muted/50 text-foreground"
                }`}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
