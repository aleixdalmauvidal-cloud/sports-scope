import { RankingDashboard } from "@/components/ranking/RankingDashboard";
import { getTopPlayersByCmv } from "@/lib/players";

export default async function RankingsPage() {
  const players = await getTopPlayersByCmv(150);
  return <RankingDashboard players={players.slice(0, 100)} />;
}
