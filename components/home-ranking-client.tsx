"use client";

import { useCallback, useMemo, useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { SearchInput } from "@/components/search-input";
import { HeroCards } from "@/components/hero-cards";
import { RankingTable } from "@/components/ranking-table";
import { PlayerCardsGrid } from "@/components/player-cards-grid";
import { ViewToggle } from "@/components/view-toggle";
import { RankingsFilterBar } from "@/components/rankings-filter-bar";
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
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground">CMV Rankings</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Commercial Market Value · Football · 2026
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
              <ViewToggle view={viewMode} onChange={setViewMode} />
              <SearchInput value={searchQuery} onChange={setSearchQuery} />
            </div>
          </div>

          <div className="mb-6">
            <RankingsFilterBar
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
            <>
              {filteredSorted.length > 0 ? (
                <div className="mb-8">
                  <HeroCards players={filteredSorted.slice(0, 3)} />
                </div>
              ) : null}

              <div className="bg-card rounded-[10px] border border-border overflow-hidden">
                <RankingTable players={filteredSorted} />
              </div>
            </>
          ) : (
            <PlayerCardsGrid players={filteredSorted} />
          )}
        </div>
      </main>
    </div>
  );
}
