export function ConfigBanner() {
  return (
    <div className="rounded-xl border border-amber-500/25 bg-amber-500/[0.1] px-5 py-4 text-base text-amber-100/95 shadow-panel-inset">
      <p className="font-semibold text-amber-200">Supabase sin configurar</p>
      <p className="mt-2 leading-relaxed text-amber-100/80">
        Copia{" "}
        <code className="rounded bg-black/30 px-1.5 py-0.5 font-mono text-sm">
          .env.local.example
        </code>{" "}
        a{" "}
        <code className="rounded bg-black/30 px-1.5 py-0.5 font-mono text-sm">
          .env.local
        </code>{" "}
        y sustituye{" "}
        <code className="rounded bg-black/30 px-1.5 py-0.5 font-mono text-sm">
          SUPABASE_ANON_KEY
        </code>{" "}
        por tu clave anónima real. Ejecuta el SQL de{" "}
        <code className="rounded bg-black/30 px-1.5 py-0.5 font-mono text-sm">
          supabase/players.sql
        </code>{" "}
        en el editor SQL del proyecto.
      </p>
    </div>
  );
}
