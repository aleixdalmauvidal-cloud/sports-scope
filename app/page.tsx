import { CmvRankingTable } from "@/components/CmvRankingTable";
import { ConfigBanner } from "@/components/ConfigBanner";
import { getTopPlayersByCmv } from "@/lib/players";
import { getSupabase } from "@/lib/supabase/client";

export default async function HomePage() {
  const configured = getSupabase() !== null;
  const players = await getTopPlayersByCmv(30);

  return (
    <div className="w-full px-4 py-10 sm:px-6 sm:py-14 lg:px-10 lg:py-16 xl:px-14">
      <header className="mb-10 border-l-4 border-accent/50 pl-5 sm:mb-12 sm:pl-7 lg:mb-14">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent-muted">
          Commercial Market Value
        </p>
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:gap-5">
          <h1 className="text-balance text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Ranking CMV
          </h1>
          <span className="inline-flex w-fit items-center rounded-lg border border-white/[0.12] bg-white/[0.05] px-3 py-1.5 font-mono text-sm font-semibold tabular-nums text-zinc-300">
            Top 30
          </span>
        </div>
        <p className="mt-6 max-w-3xl text-lg leading-relaxed text-zinc-300 sm:text-xl">
          El <strong className="font-semibold text-white">CMV</strong> mide el peso
          comercial del jugador en una escala de{" "}
          <span className="font-mono text-zinc-200">0 a 100</span>: combina datos
          deportivos, presencia social y señales de marca. Usa el buscador para localizar
          nombres; entra en cada ficha para ver mercado, redes y desglose del índice.
        </p>
      </header>

      {!configured && (
        <div className="mb-8">
          <ConfigBanner />
        </div>
      )}

      <CmvRankingTable players={players} />
    </div>
  );
}
