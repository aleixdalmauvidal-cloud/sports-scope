import { getTopPlayersByCmv, mapPlayerRowsToV0Players } from "@/lib/players";
import { HomeRankingClient } from "@/components/home-ranking-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CMV Rankings | Sports Scope",
  description:
    "Top footballers by Commercial Market Value. Rank, filter and compare elite players.",
};

export default async function RankingsPage() {
  const rows = await getTopPlayersByCmv(30);
  const players = mapPlayerRowsToV0Players(rows);
  return <HomeRankingClient initialPlayers={players} />;
}
