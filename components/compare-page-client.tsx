"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Sidebar } from "@/components/sidebar";
import type { Player } from "@/lib/players";
import { formatScore } from "@/lib/format";
import { Search, X } from "lucide-react";

const BG = "#0D1110";
const CARD = "#1C2420";

function playerInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function maxIndexSet(nums: number[]): Set<number> {
  if (nums.length === 0) return new Set();
  const m = Math.max(...nums);
  const s = new Set<number>();
  nums.forEach((v, i) => {
    if (v === m) s.add(i);
  });
  return s;
}

const SUB_ROWS = [
  { key: "sportsScore" as const, label: "Sports Value", color: "#38A047" },
  { key: "socialScore" as const, label: "Social & Marketing", color: "#7A9490" },
  { key: "commercialScore" as const, label: "Commercial History", color: "#C8D8D4" },
  { key: "brandFitScore" as const, label: "Brand Fit", color: "#4A5E58" },
  { key: "momentumScore" as const, label: "Momentum", color: "#2D9E50" },
  { key: "adjustmentsScore" as const, label: "Adjustments", color: "#2D7A3A" },
] as const;

interface Props {
  initialPlayers: Player[];
  preselectId?: string;
}

export function ComparePageClient({ initialPlayers, preselectId }: Props) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    if (preselectId && initialPlayers.some((p) => p.id === preselectId)) {
      return [preselectId];
    }
    return [];
  });

  const byId = useMemo(() => new Map(initialPlayers.map((p) => [p.id, p])), [initialPlayers]);

  const selected = useMemo(
    () => selectedIds.map((id) => byId.get(id)).filter(Boolean) as Player[],
    [selectedIds, byId]
  );

  const filteredPool = useMemo(() => {
    const q = search.trim().toLowerCase();
    return initialPlayers.filter((p) => {
      if (selectedIds.includes(p.id)) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.club.toLowerCase().includes(q) ||
        String(p.cmvScore).includes(q)
      );
    });
  }, [initialPlayers, selectedIds, search]);

  const addPlayer = useCallback(
    (id: string) => {
      setSelectedIds((prev) => {
        if (prev.includes(id) || prev.length >= 4) return prev;
        return [...prev, id];
      });
      setSearch("");
      setOpen(false);
    },
    []
  );

  const removePlayer = useCallback((id: string) => {
    setSelectedIds((prev) => prev.filter((x) => x !== id));
  }, []);

  const cmvMax = maxIndexSet(selected.map((p) => p.cmvScore))
  const oppMax = maxIndexSet(selected.map((p) => p.opportunityScore))
  const numericHighlights = SUB_ROWS.map((row) => maxIndexSet(selected.map((p) => p[row.key] as number)))
  const scoreWins = selected.map((_, idx) => {
    let wins = 0
    if (cmvMax.has(idx)) wins += 1
    if (oppMax.has(idx)) wins += 1
    numericHighlights.forEach((set) => {
      if (set.has(idx)) wins += 1
    })
    return wins
  })
  const bestScore = scoreWins.length > 0 ? Math.max(...scoreWins) : 0
  const bestIndexes = scoreWins.map((wins, idx) => (wins === bestScore ? idx : -1)).filter((idx) => idx !== -1)
  const verdictText =
    bestIndexes.length === 1 && selected[bestIndexes[0]]
      ? `${selected[bestIndexes[0]].name} leads the comparison by winning ${bestScore} categories and is the strongest current brand-fit recommendation.`
      : "The comparison is balanced. Use campaign objective and regional fit as tie-breakers before selecting a lead athlete."

  const searchWrapRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (!open) return;
      const el = searchWrapRef.current;
      if (el && !el.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: BG }}>
      <Sidebar />

      <main className="ml-20 min-h-screen">
        <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
          <header className="mb-8">
            <h1 className="font-display text-2xl font-bold text-foreground lg:text-3xl">Compare Players</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Compare CMV profiles side by side
            </p>
          </header>

          {/* Selector */}
          <section
            className="mb-8 rounded-[10px] border border-border p-4 lg:p-5"
            style={{ backgroundColor: CARD }}
          >
            <p className="section-title mb-3">Player Selector</p>
            <div className="flex flex-wrap items-center gap-2">
              {selected.map((p, idx) => (
                <span key={p.id} className="inline-flex items-center gap-2 rounded-lg border border-[rgba(56,160,71,0.22)] bg-card px-3 py-2 text-sm">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[rgba(56,160,71,0.22)] bg-[rgba(45,122,58,0.15)] text-[11px] font-semibold text-[#E8F5EA]">
                    {playerInitials(p.name)}
                  </span>
                  <span className="font-medium text-foreground">{p.name}</span>
                  <span className="font-display text-xs text-[#38A047]">{formatScore(p.cmvScore)}</span>
                  <button
                    type="button"
                    aria-label={`Remove ${p.name}`}
                    className="rounded p-0.5 text-muted-foreground hover:bg-[rgba(45,122,58,0.04)] hover:text-foreground"
                    onClick={() => removePlayer(p.id)}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                  {idx < selected.length - 1 ? <span className="ml-1 text-xs text-[#2E3D38]">VS</span> : null}
                </span>
              ))}
              <div className="relative min-w-[260px] flex-1" ref={searchWrapRef}>
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setOpen(true);
                  }}
                  onFocus={() => setOpen(true)}
                  placeholder="Add player"
                  className="w-full rounded-lg border border-dashed border-[rgba(56,160,71,0.22)] bg-background py-2.5 pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-[#2D7A3A]/50"
                />
              </div>
              {open && filteredPool.length > 0 && (
                <ul
                  className="absolute z-30 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-border py-1 shadow-lg"
                  style={{ backgroundColor: CARD }}
                  role="listbox"
                >
                  {filteredPool.map((p) => (
                    <li key={p.id}>
                      <button
                        type="button"
                        role="option"
                        className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-sm transition-colors hover:bg-[rgba(45,122,58,0.04)]"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => addPlayer(p.id)}
                      >
                        <span className="font-medium text-foreground truncate">{p.name}</span>
                        <span className="text-muted-foreground truncate text-xs shrink-0 max-w-[40%]">
                          {p.club}
                        </span>
                        <span className="font-display text-xs font-semibold text-[#38A047] shrink-0">
                          {formatScore(p.cmvScore)}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {open && search.trim() && filteredPool.length === 0 && (
                <p
                  className="absolute z-30 mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground"
                  style={{ backgroundColor: CARD }}
                >
                  No matches (or all matching players are already selected).
                </p>
              )}
            </div>

            {selected.length >= 4 && (
              <p className="text-xs text-muted-foreground mt-2">Maximum 4 players selected.</p>
            )}
          </section>

          {selected.length < 2 ? (
            <div
              className="rounded-[10px] border border-dashed border-border py-16 text-center text-muted-foreground text-sm"
              style={{ backgroundColor: CARD }}
            >
              Select at least two players to see the comparison table.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-[10px] border border-border" style={{ backgroundColor: CARD }}>
              <div
                className="grid min-w-[860px]"
                style={{
                  gridTemplateColumns: `180px repeat(${selected.length}, minmax(170px, 1fr))`,
                }}
              >
                <div className="border-b border-border bg-background/30 p-3" />
                {selected.map((p) => (
                  <div
                    key={`h-${p.id}`}
                    className="relative border-b border-l border-border p-4"
                    style={{
                      background: "linear-gradient(145deg, #0D2B18 0%, #1A4A2A 60%, #0D1110 100%)",
                    }}
                  >
                    <span className="absolute right-2 top-2 font-display text-[46px] font-extrabold leading-none text-white/5">
                      {p.rank}
                    </span>
                    <div className={`flex min-h-[90px] flex-col items-center justify-center gap-2 rounded-lg border p-2 text-center ${bestIndexes.includes(selected.findIndex((s) => s.id === p.id)) ? "border-[rgba(56,160,71,0.22)]" : "border-border"}`}>
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-full border-2 text-base font-bold text-foreground"
                        style={{
                          borderColor: "rgba(56,160,71,0.22)",
                          backgroundColor: "rgba(45,122,58,0.15)",
                        }}
                      >
                        {playerInitials(p.name)}
                      </div>
                      <h2 className="line-clamp-2 text-sm font-bold leading-tight text-foreground">{p.name}</h2>
                      <span className="rounded-full border border-[rgba(56,160,71,0.22)] px-2 py-0.5 font-display text-xs text-[#38A047]">
                        CMV {formatScore(p.cmvScore)}
                      </span>
                    </div>
                  </div>
                ))}

                <div className="section-title flex items-end border-b border-border px-3 py-3">
                  Core Scores
                </div>
                <div className="border-b border-l border-border px-3 py-2.5 text-center text-xs text-[#7A9490]">CMV + OPP + Breakdown</div>
                {selected.slice(1).map((_, i) => (
                  <div key={`core-${i}`} className="border-b border-l border-border px-3 py-2.5 text-center text-xs text-[#7A9490]">
                    Weighted winners highlighted
                  </div>
                ))}

                <div className="border-b border-border bg-background/20 px-3 py-4 text-sm font-semibold text-foreground">
                  CMV Score
                </div>
                {selected.map((p, i) => (
                  <div
                    key={`cmv-${p.id}`}
                    className={`border-b border-l border-border px-3 py-3 ${cmvMax.has(i) ? "bg-[rgba(45,122,58,0.1)]" : ""}`}
                    style={cmvMax.has(i) ? { borderColor: "rgba(56,160,71,0.22)" } : undefined}
                  >
                    <CompareCell value={p.cmvScore} max={100} winner={cmvMax.has(i)} />
                  </div>
                ))}

                <div className="border-b border-border bg-background/20 px-3 py-3 text-sm font-semibold text-foreground">
                  Opportunity Score
                </div>
                {selected.map((p, i) => (
                  <div
                    key={`opp-${p.id}`}
                    className={`border-b border-l border-border px-3 py-3 ${oppMax.has(i) ? "bg-[rgba(45,122,58,0.1)]" : ""}`}
                    style={oppMax.has(i) ? { borderColor: "rgba(56,160,71,0.22)" } : undefined}
                  >
                    <CompareCell value={p.opportunityScore} max={100} winner={oppMax.has(i)} />
                  </div>
                ))}

                {SUB_ROWS.map((row, ri) => (
                  <div key={row.key} className="contents">
                    <div className="flex items-center gap-2 border-b border-border px-3 py-3 text-sm text-muted-foreground">
                      <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: row.color }} />
                      {row.label}
                    </div>
                    {selected.map((p, ci) => {
                      const val = p[row.key];
                      const hi = numericHighlights[ri]?.has(ci);
                      return (
                        <div
                          key={`c-${p.id}-${row.key}`}
                          className={`border-b border-l border-border px-3 py-3 ${hi ? "bg-[rgba(45,122,58,0.1)]" : ""}`}
                          style={hi ? { borderColor: "rgba(56,160,71,0.22)" } : undefined}
                        >
                          <CompareCell value={val} max={100} winner={!!hi} />
                        </div>
                      );
                    })}
                  </div>
                ))}

                <div className="border-b border-border px-3 py-3 text-sm text-muted-foreground">Position</div>
                {selected.map((p) => (
                  <div
                    key={`pos-${p.id}`}
                    className="border-b border-l border-border px-3 py-3 text-center text-sm text-foreground"
                  >
                    {p.position}
                  </div>
                ))}

                <div className="border-b border-border px-3 py-3 text-sm text-muted-foreground">Club</div>
                {selected.map((p) => (
                  <div
                    key={`club-${p.id}`}
                    className="border-b border-l border-border px-3 py-3 text-center text-sm text-foreground line-clamp-2"
                  >
                    {p.club}
                  </div>
                ))}

                <div className="px-3 py-3 text-sm text-muted-foreground">League</div>
                {selected.map((p) => (
                  <div
                    key={`lg-${p.id}`}
                    className="border-l border-border px-3 py-3 text-center text-sm text-foreground line-clamp-2"
                  >
                    {p.league ?? "—"}
                  </div>
                ))}
              </div>
            </div>
          )}

          {selected.length >= 2 ? (
            <section className="mt-6 rounded-[10px] border border-[rgba(56,160,71,0.22)] bg-card p-5">
              <p className="section-title mb-2">Analysis · Brand recommendation</p>
              <p className="text-sm text-[#C8D8D4]">{verdictText}</p>
            </section>
          ) : null}
        </div>
      </main>
    </div>
  );
}

function CompareCell({ value, max, winner }: { value: number; max: number; winner: boolean }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  return (
    <div className="space-y-1">
      <p className={`font-display text-center text-lg font-semibold tabular-nums ${winner ? "text-[#38A047]" : "text-foreground"}`}>
        {formatScore(value)}
      </p>
      <div className="h-[3px] overflow-hidden rounded-full bg-[#2E3D38]">
        <div className={`h-full rounded-full ${winner ? "bg-[#38A047]" : "bg-[#2E3D38]"}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
