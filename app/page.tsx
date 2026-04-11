import { CmvRankingTable } from "@/components/CmvRankingTable";
import { ConfigBanner } from "@/components/ConfigBanner";
import { getTopPlayersByCmv } from "@/lib/players";
import { getSupabase } from "@/lib/supabase/client";

export default async function HomePage() {
  const configured = getSupabase() !== null;
  const players = await getTopPlayersByCmv(30);

  return (
    <div className="mx-auto w-full max-w-[90rem] px-4 py-8 sm:px-8 sm:py-12 lg:px-12">
      <header className="mb-8 border-l-2 border-accent/40 pl-4 sm:mb-10 sm:pl-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
          Commercial Market Value
        </p>
        <div className="mt-2 flex flex-wrap items-end gap-3 gap-y-1">
          <h1 className="text-balance text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Ranking CMV
          </h1>
          <span className="mb-0.5 inline-flex items-center rounded-md border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 font-mono text-[11px] font-medium tabular-nums text-zinc-400">
            Top 30
          </span>
        </div>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-zinc-500">
          Índice 0–100 que sintetiza rendimiento deportivo, alcance en redes y contexto
          comercial. Selecciona un jugador para ver el desglose.
        </p>
      </header>

      {!configured && (
        <div className="mb-6">
          <ConfigBanner />
        </div>
      )}

      <CmvRankingTable players={players} />
    </div>
  );
}
