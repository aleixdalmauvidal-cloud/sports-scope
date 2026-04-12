"use client";

import type { ReactNode } from "react";
import {
  CMV_RANGE_OPTIONS,
  LEAGUE_OPTIONS,
  POSITION_OPTIONS,
  SORT_OPTIONS,
  type CmvRangeValue,
  type LeagueFilterValue,
  type PositionFilterValue,
  type SortOptionValue,
} from "@/lib/rankings-filters";
import { ChevronDown, RotateCcw } from "lucide-react";

function Pill({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-all sm:text-sm ${
        active
          ? "bg-[#7C6FFF] text-white shadow-[0_0_12px_-4px_rgba(124,111,255,0.5)]"
          : "bg-background/80 text-muted-foreground hover:bg-muted hover:text-foreground border border-border"
      }`}
    >
      {children}
    </button>
  );
}

interface Props {
  league: LeagueFilterValue;
  onLeagueChange: (v: LeagueFilterValue) => void;
  position: PositionFilterValue;
  onPositionChange: (v: PositionFilterValue) => void;
  cmvRange: CmvRangeValue;
  onCmvRangeChange: (v: CmvRangeValue) => void;
  sort: SortOptionValue;
  onSortChange: (v: SortOptionValue) => void;
  resultCount: number;
  showReset: boolean;
  onReset: () => void;
}

export function RankingsFilterBar({
  league,
  onLeagueChange,
  position,
  onPositionChange,
  cmvRange,
  onCmvRangeChange,
  sort,
  onSortChange,
  resultCount,
  showReset,
  onReset,
}: Props) {
  return (
    <div className="rounded-[10px] border border-border bg-card/80 p-4 space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          <span className="font-mono font-semibold tabular-nums text-foreground">{resultCount}</span>{" "}
          {resultCount === 1 ? "player" : "players"} found
        </p>
        {showReset ? (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium text-muted-foreground hover:border-[#7C6FFF]/40 hover:text-foreground transition-colors self-start sm:self-auto"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset filters
          </button>
        ) : null}
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            League
          </p>
          <div className="flex flex-wrap gap-1.5">
            {LEAGUE_OPTIONS.map((opt) => (
              <Pill key={opt} active={league === opt} onClick={() => onLeagueChange(opt)}>
                {opt}
              </Pill>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Position
          </p>
          <div className="flex flex-wrap gap-1.5">
            {POSITION_OPTIONS.map((opt) => (
              <Pill key={opt} active={position === opt} onClick={() => onPositionChange(opt)}>
                {opt}
              </Pill>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            CMV range
          </p>
          <div className="flex flex-wrap gap-1.5">
            {CMV_RANGE_OPTIONS.map((opt) => (
              <Pill
                key={opt.value}
                active={cmvRange === opt.value}
                onClick={() => onCmvRangeChange(opt.value)}
              >
                {opt.label}
              </Pill>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground shrink-0">
            Sort by
          </p>
          <div className="relative min-w-[200px] max-w-sm flex-1">
            <select
              value={sort}
              onChange={(e) => onSortChange(e.target.value as SortOptionValue)}
              className="w-full appearance-none rounded-lg border border-border bg-background py-2.5 pl-3 pr-10 text-sm text-foreground outline-none focus:ring-2 focus:ring-[#7C6FFF]/30 cursor-pointer"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>
      </div>
    </div>
  );
}
