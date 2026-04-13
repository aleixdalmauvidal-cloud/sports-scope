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
import { ChevronDown } from "lucide-react";
import { ViewToggle } from "@/components/view-toggle";

const labelClass =
  "shrink-0 text-[9px] font-semibold uppercase tracking-[0.12em] text-[#2E3D38] mr-1.5";

function Separator() {
  return (
    <div
      className="h-4 w-px shrink-0 self-center bg-[rgba(56,160,71,0.15)]"
      aria-hidden
    />
  );
}

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
      className={`inline-flex h-[26px] shrink-0 items-center justify-center rounded-[20px] px-[11px] text-[11px] font-medium transition-colors ${
        active
          ? "border-0 bg-[#2D7A3A] text-white"
          : "border border-[rgba(56,160,71,0.15)] bg-transparent text-[#4A5E58] hover:border-[rgba(56,160,71,0.25)] hover:text-[#7A9490]"
      }`}
    >
      {children}
    </button>
  );
}

interface Props {
  view: "table" | "card";
  onViewChange: (view: "table" | "card") => void;
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
  view,
  onViewChange,
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
    <div className="overflow-hidden rounded-[10px] border-x border-t border-border bg-[#0D1110] px-6 py-2 [border-bottom:1px_solid_rgba(56,160,71,0.1)]">
      <div className="flex items-center justify-between gap-4 border-b border-[rgba(56,160,71,0.1)] pb-2">
        <p className="shrink-0 text-sm text-muted-foreground">
          <span className="font-display font-semibold tabular-nums text-foreground">
            {resultCount}
          </span>{" "}
          {resultCount === 1 ? "player" : "players"} found
        </p>
        <ViewToggle view={view} onChange={onViewChange} />
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-2">
        <span className={labelClass}>League</span>
        {LEAGUE_OPTIONS.map((opt) => (
          <Pill key={opt} active={league === opt} onClick={() => onLeagueChange(opt)}>
            {opt}
          </Pill>
        ))}

        <Separator />

        <span className={labelClass}>Pos</span>
        {POSITION_OPTIONS.map((opt) => (
          <Pill key={opt} active={position === opt} onClick={() => onPositionChange(opt)}>
            {opt}
          </Pill>
        ))}

        <Separator />

        <span className={labelClass}>Cmv</span>
        {CMV_RANGE_OPTIONS.map((opt) => (
          <Pill
            key={opt.value}
            active={cmvRange === opt.value}
            onClick={() => onCmvRangeChange(opt.value)}
          >
            {opt.label}
          </Pill>
        ))}

        <Separator />

        <span className={labelClass}>Sort</span>
        <div className="relative w-[130px] shrink-0">
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value as SortOptionValue)}
            className="h-[28px] w-[130px] cursor-pointer appearance-none rounded-[20px] border border-[rgba(56,160,71,0.15)] bg-[#0D1110] py-0 pl-3 pr-8 text-[11px] text-[#4A5E58] outline-none transition-colors hover:border-[rgba(56,160,71,0.25)] hover:text-[#7A9490] focus:border-[rgba(56,160,71,0.25)] focus:ring-1 focus:ring-[#2D7A3A]/40"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#4A5E58]" />
        </div>

        {showReset ? (
          <>
            <Separator />
            <button
              type="button"
              onClick={onReset}
              className="shrink-0 text-[11px] font-medium text-[#4A5E58] underline-offset-2 hover:underline"
            >
              Reset
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}
