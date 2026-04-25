"use client";

import { useCallback, useMemo, useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { SearchInput } from "@/components/search-input";
import { HeroCards } from "@/components/hero-cards";
import { RankingTable } from "@/components/ranking-table";
import { PlayerCardsGrid } from "@/components/player-cards-grid";
import { RankingsFilterBar } from "@/components/rankings-filter-bar";
import { WeeklyMovers } from "@/components/weekly-movers";
import type { Player } from "@/lib/players";
import {
  applyRankingFilters,
  hasNonDefaultRankingFilters,
  sortRankingPlayers,
  type CmvRangeValue,
  type LeagueFilterValue,
  type PositionFilterValue,
  type SortOptionValue,
} from "@/lib/rankings-filters";

interface Props {
  initialPlayers: Player[];
}

export function HomeRankingClient({ initialPlayers }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [league, setLeague] = useState<LeagueFilterValue>("All");
  const [position, setPosition] = useState<PositionFilterValue>("All");
  const [cmvRange, setCmvRange] = useState<CmvRangeValue>("all");
  const [sort, setSort] = useState<SortOptionValue>("cmv");
  const [viewMode, setViewMode] = useState<"table" | "card">("table");

  const filteredSorted = useMemo(() => {
    const filtered = applyRankingFilters(initialPlayers, {
      search: searchQuery,
      league,
      position,
      cmvRange,
    });
    return sortRankingPlayers(filtered, sort);
  }, [initialPlayers, searchQuery, league, position, cmvRange, sort]);

  const resetFilters = useCallback(() => {
    setSearchQuery("");
    setLeague("All");
    setPosition("All");
    setCmvRange("all");
    setSort("cmv");
  }, []);

  const showReset = hasNonDefaultRankingFilters({
    search: searchQuery,
    league,
    position,
    cmvRange,
    sort,
  });

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <main className="ml-20 min-h-screen">
        <div className="p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <p className="mb-2 text-[10px] uppercase tracking-[0.18em] text-[#38A047]">
                CMV Intelligence · Football 2026
              </p>
              <h1 className="font-display text-[26px] font-bold text-foreground">Rankings CMV</h1>
              <p className="mt-1 text-[11px] text-[#4A5E58]">
                Top 15 · Commercial Market Value
              </p>
            </div>

            <div className="flex w-full flex-col items-stretch gap-3 sm:flex-row sm:items-center lg:w-auto">
              <SearchInput value={searchQuery} onChange={setSearchQuery} />
            </div>
          </div>

          {viewMode === "table" ? (
            <>
              {filteredSorted.length > 0 ? (
                <div className="mb-6">
                  <HeroCards players={filteredSorted.slice(0, 3)} />
                </div>
              ) : null}
            </>
          ) : null}

          <WeeklyMovers risers={[]} fallers={[]} />

          <div className="mb-6">
            <RankingsFilterBar
              view={viewMode}
              onViewChange={setViewMode}
              league={league}
              onLeagueChange={setLeague}
              position={position}
              onPositionChange={setPosition}
              cmvRange={cmvRange}
              onCmvRangeChange={setCmvRange}
              sort={sort}
              onSortChange={setSort}
              resultCount={filteredSorted.length}
              showReset={showReset}
              onReset={resetFilters}
            />
          </div>

          {viewMode === "table" ? (
            <div className="bg-card rounded-[10px] border border-border overflow-hidden">
              <RankingTable players={filteredSorted} />
            </div>
          ) : (
            <PlayerCardsGrid players={filteredSorted} />
          )}
        </div>
      </main>
    </div>
  );
}
