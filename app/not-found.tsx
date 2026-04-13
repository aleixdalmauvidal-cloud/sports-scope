import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center bg-background text-foreground">
      <p className="font-mono text-6xl font-bold text-muted-foreground/30">404</p>
      <h1 className="mt-4 text-2xl font-semibold">Not found</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        That player or page does not exist, or it was removed.
      </p>
      <Link
        href="/rankings"
        className="mt-8 inline-flex items-center rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
      >
        Back to rankings
      </Link>
    </div>
  );
}
