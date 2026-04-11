"use client";

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const sizeClass = {
  sm: "h-10 w-10 min-h-10 min-w-10 text-[11px]",
  md: "h-12 w-12 min-h-12 min-w-12 text-xs",
  lg: "h-16 w-16 min-h-16 min-w-16 text-sm",
  xl: "h-24 w-24 min-h-24 min-w-24 text-lg sm:h-28 sm:w-28",
} as const;

type Size = keyof typeof sizeClass;

type Props = {
  name: string;
  photoUrl?: string | null;
  size?: Size;
  className?: string;
};

export function PlayerAvatar({ name, photoUrl, size = "md", className = "" }: Props) {
  const base = `${sizeClass[size]} shrink-0 overflow-hidden rounded-full border border-white/[0.12] bg-surface-raised shadow-inner`;
  if (photoUrl) {
    return (
      <span className={`relative inline-flex ${base} ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photoUrl} alt="" className="h-full w-full object-cover" />
      </span>
    );
  }
  return (
    <span
      className={`inline-flex items-center justify-center font-mono font-bold uppercase tracking-tight text-zinc-200 ring-1 ring-white/[0.08] ${base} ${className}`}
      aria-hidden
    >
      {initialsFromName(name)}
    </span>
  );
}
