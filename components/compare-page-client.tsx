"use client";

import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { ArcGauge, subscoreColors } from "@/components/arc-gauge";
import type { Player } from "@/lib/players";
import { formatScore } from "@/lib/format";
import { Search, X } from "lucide-react";

const BG = "#080810";
const CARD = "#10101C";

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
  { key: "sportsScore" as const, label: "Sports Value", abbr: "SPT", color: subscoreColors.sports },
  { key: "socialScore" as const, label: "Social & Marketing", abbr: "SOC", color: subscoreColors.social },
  { key: "commercialScore" as const, label: "Commercial History", abbr: "COM", color: subscoreColors.commercial },
  { key: "brandFitScore" as const, label: "Brand Fit", abbr: "BRD", color: subscoreColors.brandFit },
  { key: "momentumScore" as const, label: "Momentum", abbr: "MOM", color: subscoreColors.momentum },
  { key: "adjustmentsScore" as const, label: "Adjustments", abbr: "ADJ", color: subscoreColors.adjustments },
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

  const cmvMax = maxIndexSet(selected.map((p) => p.cmvScore));
  const oppMax = maxIndexSet(selected.map((p) => p.opportunityScore));
  const numericHighlights = SUB_ROWS.map((row) =>
    maxIndexSet(selected.map((p) => p[row.key] as number))
  );

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
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Compare Players</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Compare CMV profiles side by side
            </p>
          </header>

          {/* Selector */}
          <section
            className="rounded-[10px] border border-border p-4 lg:p-5 mb-8"
            style={{ backgroundColor: CARD }}
          >
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
              Add players (2–4)
            </p>
            <div className="relative max-w-xl" ref={searchWrapRef}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setOpen(true);
                  }}
                  onFocus={() => setOpen(true)}
                  placeholder="Search by name, club, or CMV…"
                  className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-[#7C6FFF]/30"
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
                        className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-sm hover:bg-white/[0.06] transition-colors"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => addPlayer(p.id)}
                      >
                        <span className="font-medium text-foreground truncate">{p.name}</span>
                        <span className="text-muted-foreground truncate text-xs shrink-0 max-w-[40%]">
                          {p.club}
                        </span>
                        <span className="font-mono text-xs font-semibold text-[#00E5A0] shrink-0">
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

            <div className="mt-4 flex flex-wrap gap-2">
              {selected.map((p) => (
                <span
                  key={p.id}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 pl-3 pr-1 py-1 text-sm"
                >
                  <span className="font-medium text-foreground max-w-[140px] truncate">{p.name}</span>
                  <span className="text-muted-foreground text-xs font-mono">{formatScore(p.cmvScore)}</span>
                  <button
                    type="button"
                    aria-label={`Remove ${p.name}`}
                    className="rounded-full p-1 text-muted-foreground hover:bg-white/10 hover:text-foreground"
                    onClick={() => removePlayer(p.id)}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))}
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
                className="grid min-w-[720px]"
                style={{
                  gridTemplateColumns: `minmax(160px, 200px) repeat(${selected.length}, minmax(140px, 1fr))`,
                }}
              >
                {/* Header row: empty corner + player cards */}
                <div className="p-3 border-b border-border bg-background/30" />
                {selected.map((p) => (
                  <div
                    key={`h-${p.id}`}
                    className="border-b border-l border-border p-4"
                    style={{
                      background: `linear-gradient(180deg, ${p.accentColor}22 0%, ${CARD} 55%)`,
                    }}
                  >
                    <div className="flex flex-col items-center text-center gap-2">
                      <div
                        className="flex h-14 w-14 items-center justify-center rounded-full border-2 text-lg font-bold text-foreground"
                        style={{
                          borderColor: p.accentColor,
                          backgroundColor: `${p.accentColor}26`,
                        }}
                      >
                        {playerInitials(p.name)}
                      </div>
                      <h2 className="text-sm font-bold text-foreground leading-tight line-clamp-2">{p.name}</h2>
                      <p className="text-[11px] text-muted-foreground line-clamp-1">{p.club}</p>
                      <span
                        className="rounded-full px-2.5 py-1 font-mono text-xs font-bold"
                        style={{
                          color: p.accentColor,
                          border: `1px solid ${p.accentColor}`,
                          backgroundColor: "rgba(0,0,0,0.35)",
                        }}
                      >
                        CMV {formatScore(p.cmvScore)}
                      </span>
                    </div>
                  </div>
                ))}

                {/* Gauges row label */}
                <div className="px-3 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border flex items-end">
                  Subscores
                </div>
                {selected.map((p) => (
                  <div
                    key={`g-${p.id}`}
                    className="border-b border-l border-border px-2 py-3 flex flex-wrap justify-center gap-1"
                  >
                    {SUB_ROWS.map((row) => (
                      <ArcGauge
                        key={row.key}
                        value={p[row.key]}
                        size={36}
                        strokeWidth={3}
                        color={row.color}
                        label={row.abbr}
                        showLabel
                      />
                    ))}
                  </div>
                ))}

                {/* CMV row */}
                <div className="px-3 py-4 text-sm font-semibold text-foreground border-b border-border bg-background/20">
                  CMV Score
                </div>
                {selected.map((p, i) => (
                  <div
                    key={`cmv-${p.id}`}
                    className={`border-b border-l border-border px-3 py-4 text-center ${
                      cmvMax.has(i) ? "font-bold" : ""
                    }`}
                    style={{
                      color: cmvMax.has(i) ? p.accentColor : undefined,
                    }}
                  >
                    <span
                      className="text-2xl lg:text-3xl font-bold tabular-nums"
                      style={{ color: cmvMax.has(i) ? p.accentColor : "#7C6FFF" }}
                    >
                      {formatScore(p.cmvScore)}
                    </span>
                  </div>
                ))}

                {/* Opportunity Score */}
                <div className="px-3 py-3 text-sm font-semibold text-foreground border-b border-border bg-background/20">
                  Opportunity Score
                </div>
                {selected.map((p, i) => (
                  <div
                    key={`opp-${p.id}`}
                    className={`border-b border-l border-border px-3 py-4 text-center ${
                      oppMax.has(i) ? "font-bold" : ""
                    }`}
                  >
                    <span
                      className="text-xl lg:text-2xl font-bold tabular-nums"
                      style={{ color: oppMax.has(i) ? "#00E5A0" : "rgba(255,255,255,0.85)" }}
                    >
                      {formatScore(p.opportunityScore)}
                    </span>
                  </div>
                ))}

                {SUB_ROWS.map((row, ri) => (
                  <Fragment key={row.key}>
                    <div className="px-3 py-3 text-sm text-muted-foreground border-b border-border flex items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-full shrink-0"
                        style={{ backgroundColor: row.color }}
                      />
                      {row.label}
                    </div>
                    {selected.map((p, ci) => {
                      const val = p[row.key];
                      const hi = numericHighlights[ri]?.has(ci);
                      return (
                        <div
                          key={`c-${p.id}-${row.key}`}
                          className={`border-b border-l border-border px-3 py-3 text-center text-sm tabular-nums ${
                            hi ? "font-bold" : "text-foreground"
                          }`}
                          style={{ color: hi ? row.color : undefined }}
                        >
                          {formatScore(val)}
                        </div>
                      );
                    })}
                  </Fragment>
                ))}

                {/* Position */}
                <div className="px-3 py-3 text-sm text-muted-foreground border-b border-border">Position</div>
                {selected.map((p) => (
                  <div
                    key={`pos-${p.id}`}
                    className="border-b border-l border-border px-3 py-3 text-center text-sm text-foreground"
                  >
                    {p.position}
                  </div>
                ))}

                {/* Club */}
                <div className="px-3 py-3 text-sm text-muted-foreground border-b border-border">Club</div>
                {selected.map((p) => (
                  <div
                    key={`club-${p.id}`}
                    className="border-b border-l border-border px-3 py-3 text-center text-sm text-foreground line-clamp-2"
                  >
                    {p.club}
                  </div>
                ))}

                {/* League */}
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
        </div>
      </main>
    </div>
  );
}
