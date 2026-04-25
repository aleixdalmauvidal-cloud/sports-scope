import { notFound } from "next/navigation";
import { getPlayerProfile } from "@/lib/players";
import { PlayerProfileClient } from "./player-profile-client";

export default async function PlayerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await getPlayerProfile(id);
  if (!profile) notFound();
  return <PlayerProfileClient profile={profile} />;
}
