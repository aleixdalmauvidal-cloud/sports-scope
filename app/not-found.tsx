import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <p className="font-mono text-6xl font-bold text-white/[0.08]">404</p>
      <h1 className="mt-4 text-2xl font-semibold text-white">Jugador no encontrado</h1>
      <p className="mt-3 text-base text-zinc-400">
        Ese ID no existe en la base de datos o fue eliminado.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center rounded-xl bg-accent px-6 py-3 text-base font-semibold text-surface transition hover:bg-accent-muted"
      >
        Volver al ranking
      </Link>
    </div>
  );
}
