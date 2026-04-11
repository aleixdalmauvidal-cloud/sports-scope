export function ConfigBanner() {
  return (
    <div className="rounded-lg border border-amber-500/20 bg-amber-500/[0.08] px-4 py-3 text-sm text-amber-100/90 shadow-panel-inset">
      <p className="font-medium text-amber-200">Supabase sin configurar</p>
      <p className="mt-1 text-amber-100/70">
        Copia{" "}
        <code className="rounded bg-black/30 px-1.5 py-0.5 font-mono text-xs">
          .env.local.example
        </code>{" "}
        a{" "}
        <code className="rounded bg-black/30 px-1.5 py-0.5 font-mono text-xs">
          .env.local
        </code>{" "}
        y sustituye{" "}
        <code className="rounded bg-black/30 px-1.5 py-0.5 font-mono text-xs">
          SUPABASE_ANON_KEY
        </code>{" "}
        por tu clave anónima real. Ejecuta el SQL de{" "}
        <code className="rounded bg-black/30 px-1.5 py-0.5 font-mono text-xs">
          supabase/players.sql
        </code>{" "}
        en el editor SQL del proyecto.
      </p>
    </div>
  );
}
