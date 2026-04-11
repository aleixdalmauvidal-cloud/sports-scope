import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <p className="font-mono text-6xl font-bold text-white/[0.08]">404</p>
      <h1 className="mt-4 text-xl font-semibold text-white">Jugador no encontrado</h1>
      <p className="mt-2 text-sm text-zinc-500">
        Ese ID no existe en la base de datos o fue eliminado.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-surface transition hover:bg-accent-muted"
      >
        Volver al ranking
      </Link>
    </div>
  );
}
