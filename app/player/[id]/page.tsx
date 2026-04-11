import Link from "next/link";
import { notFound } from "next/navigation";
import { ConfigBanner } from "@/components/ConfigBanner";
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
        <p className="mt-6 text-sm text-zinc-500">
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

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-8 sm:py-14 lg:max-w-7xl lg:px-12">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-zinc-500 transition hover:text-accent"
      >
        <span aria-hidden>←</span> Ranking CMV
      </Link>

      <article className="mt-8 overflow-hidden rounded-2xl border border-white/[0.07] bg-surface-card shadow-panel">
        <div className="relative border-b border-white/[0.06] bg-gradient-to-br from-surface-raised via-surface-card to-surface px-6 pb-10 pt-10 sm:px-10 sm:pt-12">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(46,228,168,0.1),transparent_55%)]" />
          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-12">
            {profile.photo_url ? (
              <div className="mx-auto shrink-0 lg:mx-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={profile.photo_url}
                  alt=""
                  className="h-36 w-36 rounded-2xl border border-white/[0.1] bg-surface-raised object-cover shadow-xl sm:h-44 sm:w-44"
                  width={176}
                  height={176}
                />
              </div>
            ) : null}
            <div className="min-w-0 flex-1 text-center lg:text-left">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                {profile.club}
              </p>
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                {profile.name}
              </h1>
              <div className="mt-5 flex flex-wrap justify-center gap-2 lg:justify-start">
                <span className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-zinc-300">
                  {profile.position}
                </span>
                {profile.nationality ? (
                  <span className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-1.5 text-sm text-zinc-400">
                    {profile.nationality}
                  </span>
                ) : null}
                {profile.age != null ? (
                  <span className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-1.5 text-sm text-zinc-400">
                    {profile.age} años
                  </span>
                ) : null}
              </div>
            </div>
            <div className="mx-auto w-full max-w-[14rem] shrink-0 rounded-xl border border-accent/30 bg-accent-dim px-6 py-5 text-center shadow-panel-inset ring-1 ring-white/[0.04] lg:mx-0 lg:w-auto lg:text-right">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-muted">
                CMV total
              </p>
              <p className="mt-2 font-mono text-4xl font-bold tabular-nums tracking-tight text-accent sm:text-5xl">
                {formatScore(profile.cmv_total)}
              </p>
              <p className="mt-1 text-xs text-zinc-500">/100</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-10 sm:px-10 sm:py-12">
          <PlayerProfileView profile={profile} />
        </div>
      </article>
    </div>
  );
}
