"use client";

import { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { SearchInput } from "@/components/search-input";
import { LeagueFilter } from "@/components/league-filter";
import { HeroCards } from "@/components/hero-cards";
import { RankingTable } from "@/components/ranking-table";
import { PlayerCardsGrid } from "@/components/player-cards-grid";
import { ViewToggle } from "@/components/view-toggle";
import type { Player } from "@/lib/players";

interface Props {
  initialPlayers: Player[];
}

export function HomeRankingClient({ initialPlayers }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLeague, setSelectedLeague] = useState("All");
  const [viewMode, setViewMode] = useState<"table" | "card">("table");

  const players = initialPlayers;

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <main className="ml-20 min-h-screen">
        <div className="p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground">CMV Rankings</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Commercial Market Value · Football · 2026
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <ViewToggle view={viewMode} onChange={setViewMode} />
              <LeagueFilter selected={selectedLeague} onChange={setSelectedLeague} />
              <SearchInput value={searchQuery} onChange={setSearchQuery} />
            </div>
          </div>

          {viewMode === "table" ? (
            <>
              <div className="mb-8">
                <HeroCards players={players.slice(0, 3)} />
              </div>

              <div className="bg-card rounded-[10px] border border-border overflow-hidden">
                <RankingTable players={players} searchQuery={searchQuery} />
              </div>
            </>
          ) : (
            <PlayerCardsGrid players={players} searchQuery={searchQuery} />
          )}
        </div>
      </main>
    </div>
  );
}
