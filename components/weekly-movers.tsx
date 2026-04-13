"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, TrendingDown, TrendingUp } from "lucide-react";
import type { Player } from "@/lib/players";
import { formatScore } from "@/lib/format";

const CARD_BG = "#1C2420";
const BORDER = "rgba(56,160,71,0.10)";

type MoverRow = {
  id: string;
  name: string;
  club: string;
  cmvScore: number;
  weeklyChange: number;
  accentColor: string;
  /** No player page link */
  isDemo?: boolean;
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function playerToRow(p: Player): MoverRow {
  return {
    id: p.id,
    name: p.name,
    club: p.club,
    cmvScore: p.cmvScore,
    weeklyChange: p.weeklyChange,
    accentColor: p.accentColor,
  };
}

const DEMO_RISERS: MoverRow[] = [
  {
    id: "demo-riser-1",
    name: "Lamine Yamal",
    club: "Barcelona",
    cmvScore: 86,
    weeklyChange: 3.4,
    accentColor: "#38A047",
    isDemo: true,
  },
  {
    id: "demo-riser-2",
    name: "Jude Bellingham",
    club: "Real Madrid",
    cmvScore: 88,
    weeklyChange: 1.2,
    accentColor: "#2D7A3A",
    isDemo: true,
  },
  {
    id: "demo-riser-3",
    name: "Bukayo Saka",
    club: "Arsenal",
    cmvScore: 84,
    weeklyChange: 0.8,
    accentColor: "#C8D8D4",
    isDemo: true,
  },
];

const DEMO_FALLERS: MoverRow[] = [
  {
    id: "demo-faller-1",
    name: "Mohamed Salah",
    club: "Liverpool",
    cmvScore: 87,
    weeklyChange: -1.1,
    accentColor: "#38A047",
    isDemo: true,
  },
  {
    id: "demo-faller-2",
    name: "Erling Haaland",
    club: "Manchester City",
    cmvScore: 91,
    weeklyChange: -0.5,
    accentColor: "#7A9490",
    isDemo: true,
  },
  {
    id: "demo-faller-3",
    name: "Rodri",
    club: "Manchester City",
    cmvScore: 82,
    weeklyChange: -0.3,
    accentColor: "#D94F4F",
    isDemo: true,
  },
];

function hasNonZeroWeeklyChange(players: Player[]): boolean {
  return players.some((p) => Number.isFinite(p.weeklyChange) && p.weeklyChange !== 0);
}

interface Props {
  players: Player[];
}

export function WeeklyMovers({ players }: Props) {
  const [expanded, setExpanded] = useState(true);

  const { risers, fallers, usingDemo } = useMemo(() => {
    if (!hasNonZeroWeeklyChange(players)) {
      return { risers: DEMO_RISERS, fallers: DEMO_FALLERS, usingDemo: true };
    }
    const up = players
      .filter((p) => p.weeklyChange > 0)
      .sort((a, b) => b.weeklyChange - a.weeklyChange)
      .slice(0, 3)
      .map(playerToRow);
    const down = players
      .filter((p) => p.weeklyChange < 0)
      .sort((a, b) => a.weeklyChange - b.weeklyChange)
      .slice(0, 3)
      .map(playerToRow);
    return { risers: up, fallers: down, usingDemo: false };
  }, [players]);

  return (
    <section
      className="rounded-[10px] border overflow-hidden mb-6"
      style={{ backgroundColor: CARD_BG, borderColor: BORDER }}
    >
      <div className="flex flex-col gap-3 border-b border-[#38A047]/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-bold text-foreground">Weekly Movers</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Biggest CMV changes in the last 7 days
            {usingDemo ? (
              <span className="ml-2 text-[#7A9490]">· sample data</span>
            ) : null}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="inline-flex items-center gap-1.5 self-start sm:self-auto text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          {expanded ? (
            <>
              Hide
              <ChevronUp className="h-4 w-4" />
            </>
          ) : (
            <>
              Show
              <ChevronDown className="h-4 w-4" />
            </>
          )}
        </button>
      </div>

      {expanded ? (
        <div className="grid grid-cols-1 gap-0 divide-[#38A047]/10 md:grid-cols-2 md:divide-x">
          <MoverColumn
            title="📈 Risers"
            rows={risers}
            direction="up"
            borderAccent="#2D9E50"
          />
          <MoverColumn
            title="📉 Fallers"
            rows={fallers}
            direction="down"
            borderAccent="#D94F4F"
          />
        </div>
      ) : null}
    </section>
  );
}

function MoverColumn({
  title,
  rows,
  direction,
  borderAccent,
}: {
  title: string;
  rows: MoverRow[];
  direction: "up" | "down";
  borderAccent: string;
}) {
  const Icon = direction === "up" ? TrendingUp : TrendingDown;
  const colorClass = direction === "up" ? "text-[#2D9E50]" : "text-[#D94F4F]";

  return (
    <div className="p-3 sm:p-4" style={{ borderLeftWidth: 3, borderLeftStyle: "solid", borderLeftColor: borderAccent }}>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</p>
      <div className="space-y-0">
        {rows.length === 0 ? (
          <p className="text-xs text-muted-foreground py-3">No data this week.</p>
        ) : (
          rows.map((row, i) => {
            const inner = (
              <div className="flex items-center gap-2.5 border-b border-[#38A047]/10 py-2 last:border-0">
                <span className="w-6 shrink-0 text-center text-[10px] font-bold tabular-nums text-muted-foreground">
                  #{i + 1}
                </span>
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold"
                  style={{
                    borderColor: row.accentColor,
                    backgroundColor: `${row.accentColor}22`,
                    color: row.accentColor,
                  }}
                >
                  {initials(row.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-foreground truncate leading-tight">{row.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate leading-tight">{row.club}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs font-mono font-semibold tabular-nums text-foreground">
                    {formatScore(row.cmvScore)}
                  </p>
                  <div className={`flex items-center justify-end gap-0.5 text-[10px] font-semibold tabular-nums ${colorClass}`}>
                    <Icon className="h-3 w-3" />
                    <span>
                      {row.weeklyChange > 0 ? "+" : ""}
                      {row.weeklyChange.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            );

            if (row.isDemo) {
              return <div key={row.id}>{inner}</div>;
            }
            return (
              <Link key={row.id} href={`/player/${row.id}`} className="-mx-1 block rounded-md px-1 transition-colors hover:bg-[rgba(45,122,58,0.04)]">
                {inner}
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
