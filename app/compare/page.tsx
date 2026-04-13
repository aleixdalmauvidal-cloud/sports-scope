import type { Metadata } from "next";
import { getTopPlayersByCmv, mapPlayerRowsToV0Players } from "@/lib/players";
import { ComparePageClient } from "@/components/compare-page-client";

export const metadata: Metadata = {
  title: "Compare Players | Sports Scope",
  description: "Compare CMV profiles side by side for up to four players.",
};

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ with?: string }>;
}) {
  const rows = await getTopPlayersByCmv(100);
  const players = mapPlayerRowsToV0Players(rows);
  const { with: withId } = await searchParams;
  return <ComparePageClient initialPlayers={players} preselectId={withId} />;
}
