import { getTopPlayersByCmv, mapPlayerRowsToV0Players } from "@/lib/players";
import { HomeRankingClient } from "@/components/home-ranking-client";

export default async function HomePage() {
  const rows = await getTopPlayersByCmv(30);
  const players = mapPlayerRowsToV0Players(rows);
  return <HomeRankingClient initialPlayers={players} />;
}
