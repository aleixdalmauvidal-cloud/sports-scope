import Link from "next/link";
import { Lock } from "lucide-react";

export function PlayerAnalysisLocked() {
  return (
    <div className="relative mb-8 overflow-hidden rounded-[14px] border border-[rgba(56,160,71,0.12)]">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage: `repeating-linear-gradient(
            -12deg,
            transparent,
            transparent 8px,
            rgba(56,160,71,0.03) 8px,
            rgba(56,160,71,0.03) 9px
          )`,
        }}
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-0 backdrop-blur-[2px] bg-[#0D1110]/35" aria-hidden />
      <div className="relative flex min-h-[280px] flex-col items-center justify-center px-6 py-16 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-[rgba(56,160,71,0.25)] bg-[rgba(45,122,58,0.12)] text-[#38A047]">
          <Lock className="h-5 w-5" strokeWidth={1.75} />
        </div>
        <div className="max-w-md rounded-xl border border-[rgba(56,160,71,0.15)] bg-[#1C2420]/95 p-8 shadow-lg backdrop-blur-sm">
          <h2 className="font-display text-xl font-bold text-white">Unlock full player analysis</h2>
          <p className="mt-3 text-sm leading-relaxed text-[#7A9490]">
            Sign in to access CMV breakdown, social signals, historical data and brand fit analysis.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-[#2D7A3A] py-3 text-sm font-semibold text-white transition hover:bg-[#256d33]"
          >
            Sign in free →
          </Link>
          <p className="mt-4 text-xs text-[#4A5E58]">Free account · No credit card required</p>
        </div>
      </div>
    </div>
  );
}
