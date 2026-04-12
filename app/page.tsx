import { ConfigBanner } from "@/components/ConfigBanner";
import { RankingDashboard } from "@/components/ranking/RankingDashboard";
import { getTopPlayersByCmv } from "@/lib/players";
import { getSupabase } from "@/lib/supabase";

/**
 * Rankings: datos reales vía getTopPlayersByCmv (cmv_scores + athletes + clubs).
 * UI: shell con sidebar, podio top 3, tabla / cards y búsqueda (RankingDashboard).
 */
export default async function HomePage() {
  const configured = getSupabase() !== null;
  const players = await getTopPlayersByCmv(30);

  return (
    <RankingDashboard players={players}>
      {!configured ? <ConfigBanner /> : null}
    </RankingDashboard>
  );
}
