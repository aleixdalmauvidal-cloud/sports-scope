import Link from "next/link";
import { notFound } from "next/navigation";
import { ConfigBanner } from "@/components/ConfigBanner";
import { PlayerAvatar } from "@/components/PlayerAvatar";
import { PlayerProfileView } from "@/components/PlayerProfileView";
import { formatScore } from "@/lib/format";
import { getPlayerById, getPlayerProfile } from "@/lib/players";
import { getSupabase } from "@/lib/supabase/client";

type Props = {
  params: { id: string };
};

export async function generateMetadata({ params }: Props) {
  const { id } = params;
  const player = await getPlayerById(id);
  if (!player) {
    return { title: "Jugador no encontrado · Sports Scope" };
  }
  return {
    title: `${player.name} · CMV · Sports Scope`,
    description: `${player.name} — ${player.club}. CMV ${formatScore(Number(player.cmv_total))}/100.`,
  };
}

export default async function PlayerPage({ params }: Props) {
  const { id } = params;
  const configured = getSupabase() !== null;
  const profile = await getPlayerProfile(id);

  if (configured && !profile) {
    notFound();
  }

  if (!configured) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <ConfigBanner />
        <p className="mt-6 text-base text-zinc-400">
          <Link href="/" className="text-accent hover:underline">
            Volver al ranking
          </Link>
        </p>
      </div>
    );
  }

  if (!profile) {
    notFound();
  }

  const rankLabel =
    profile.cmv_rank != null ? `#${profile.cmv_rank}` : "Sin posición en top 500";

  return (
    <div className="w-full px-4 py-10 sm:px-6 sm:py-14 lg:px-10 lg:py-16 xl:px-14">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/"
          className="inline-flex w-fit items-center gap-2 text-base font-medium text-zinc-400 transition hover:text-accent"
        >
          <span aria-hidden className="text-lg">
            ←
          </span>
          Volver al ranking
        </Link>
        <button
          type="button"
          title="Próximamente"
          className="w-full rounded-xl border border-white/[0.14] bg-white/[0.06] px-6 py-3.5 text-center text-base font-semibold text-zinc-200 transition hover:border-accent/35 hover:bg-white/[0.1] hover:text-white sm:w-auto"
        >
          Comparar
        </button>
      </div>

      <article className="overflow-hidden rounded-2xl border border-white/[0.1] bg-surface-card shadow-panel">
        <div className="relative border-b border-white/[0.1] bg-gradient-to-br from-surface-raised via-surface-card to-[#08090c] px-6 pb-12 pt-12 sm:px-10 sm:pb-14 sm:pt-14 lg:px-14 lg:pb-16 lg:pt-16">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_70%_0%,rgba(46,228,168,0.12),transparent_50%)]" />
          <div className="relative flex flex-col items-center gap-10 lg:flex-row lg:items-start lg:gap-14">
            <PlayerAvatar
              name={profile.name}
              photoUrl={profile.photo_url}
              size="xl"
              className="ring-2 ring-white/[0.06]"
            />
            <div className="min-w-0 flex-1 text-center lg:pt-2 lg:text-left">
              <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                <span className="rounded-full border border-accent/35 bg-accent/[0.12] px-4 py-1.5 font-mono text-sm font-bold tabular-nums text-accent sm:text-base">
                  Ranking CMV {rankLabel}
                </span>
                {profile.league ? (
                  <span className="text-sm font-medium uppercase tracking-wider text-zinc-500">
                    {profile.league}
                  </span>
                ) : null}
              </div>
              <p className="mt-5 text-base font-semibold uppercase tracking-[0.18em] text-zinc-400 sm:text-lg">
                {profile.club}
              </p>
              <h1 className="mt-3 text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl">
                {profile.name}
              </h1>
              <div className="mt-6 flex flex-wrap justify-center gap-2 lg:justify-start">
                <span className="rounded-lg border border-white/[0.12] bg-white/[0.06] px-4 py-2 text-sm font-semibold uppercase tracking-wide text-zinc-200">
                  {profile.position}
                </span>
                {profile.nationality ? (
                  <span className="rounded-lg border border-white/[0.1] bg-white/[0.04] px-4 py-2 text-base text-zinc-300">
                    {profile.nationality}
                  </span>
                ) : null}
                {profile.age != null ? (
                  <span className="rounded-lg border border-white/[0.1] bg-white/[0.04] px-4 py-2 text-base text-zinc-300">
                    {profile.age} años
                  </span>
                ) : null}
              </div>
            </div>
            <div className="w-full max-w-[16rem] shrink-0 rounded-2xl border border-accent/35 bg-accent/[0.1] px-8 py-8 text-center shadow-panel-inset ring-1 ring-white/[0.06] lg:max-w-[15rem] lg:text-right">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent-muted">
                CMV total
              </p>
              <p className="mt-3 font-mono text-5xl font-bold tabular-nums tracking-tight text-accent sm:text-6xl">
                {formatScore(profile.cmv_total)}
              </p>
              <p className="mt-2 text-base text-zinc-400">/100</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-12 sm:px-10 sm:py-14 lg:px-14 lg:py-16">
          <PlayerProfileView profile={profile} />
        </div>
      </article>
    </div>
  );
}
