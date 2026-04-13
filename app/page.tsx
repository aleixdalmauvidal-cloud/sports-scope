import Link from "next/link";
import type { Metadata } from "next";
import { LandingNav } from "@/components/landing-nav";
import { LandingStatTicker } from "@/components/landing-stat-ticker";
import { BarChart3, Building2, Minus, TrendingDown, TrendingUp, Trophy, Users } from "lucide-react";
import { getTopPlayersByCmv, mapPlayerRowsToV0Players } from "@/lib/players";
import { formatScore } from "@/lib/format";
import type { Player } from "@/lib/players";

export const metadata: Metadata = {
  title: "SportScope | CMV Intelligence for Football",
  description:
    "The commercial value standard for footballers. Rankings, comparisons and tracking for brands, agencies and clubs.",
};

const GRID_BG = {
  backgroundImage: `linear-gradient(rgba(56,160,71,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(56,160,71,0.04) 1px, transparent 1px)`,
  backgroundSize: "20px 20px",
} as const;

const HERO_DEMO_ROWS = [
  { rank: 1, name: "Kylian Mbappé", club: "Real Madrid", cmv: "94.2" },
  { rank: 2, name: "Lamine Yamal", club: "Barcelona", cmv: "91.5" },
  { rank: 3, name: "Vinícius Júnior", club: "Real Madrid", cmv: "90.8" },
] as const;

const SECTION_PAD = "py-10 px-5 lg:px-8";

const CMV_DIMENSIONS = [
  { n: "01", name: "Sports", desc: "On-pitch output, minutes and form weighted into a live sports subscore." },
  { n: "02", name: "Social", desc: "Reach, engagement and growth across major platforms." },
  { n: "03", name: "Commercial", desc: "Deal-relevant signals and sponsorship market context." },
  { n: "04", name: "Brand fit", desc: "How well an athlete aligns with brand categories and campaigns." },
  { n: "05", name: "Momentum", desc: "Buzz, trajectory and short-term commercial velocity." },
  { n: "06", name: "Adjustments", desc: "Fine-tuning factors that keep scores comparable across leagues." },
] as const;

function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 44 44" fill="none" aria-hidden className={className}>
      <circle cx="22" cy="22" r="18" stroke="#2D7A3A" strokeWidth={1.5} />
      <circle cx="22" cy="22" r="10" stroke="#38A047" strokeWidth={1.5} />
      <circle cx="22" cy="22" r="3" fill="#38A047" />
      <line x1="4" y1="22" x2="12" y2="22" stroke="#2D7A3A" strokeWidth={1.5} strokeLinecap="round" />
      <line x1="32" y1="22" x2="40" y2="22" stroke="#2D7A3A" strokeWidth={1.5} strokeLinecap="round" />
      <line x1="22" y1="4" x2="22" y2="12" stroke="#2D7A3A" strokeWidth={1.5} strokeLinecap="round" />
      <line x1="22" y1="32" x2="22" y2="40" stroke="#2D7A3A" strokeWidth={1.5} strokeLinecap="round" />
    </svg>
  );
}

function playerInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0] + parts[parts.length - 1]![0]).toUpperCase();
}

function WeeklyTrend({ change }: { change: number }) {
  if (change === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-[#7A9490]">
        <Minus className="h-3.5 w-3.5" />
        <span className="tabular-nums">0.0</span>
      </span>
    );
  }
  const up = change > 0;
  const Icon = up ? TrendingUp : TrendingDown;
  const color = up ? "text-[#2D9E50]" : "text-[#D94F4F]";
  return (
    <span className={`inline-flex items-center gap-1 tabular-nums ${color}`}>
      <Icon className="h-3.5 w-3.5" />
      {up ? "+" : ""}
      {change.toFixed(1)}
    </span>
  );
}

function RankingsPreviewTable({ players }: { players: Player[] }) {
  if (players.length === 0) {
    return (
      <p className="rounded-lg border border-[rgba(56,160,71,0.1)] bg-[#1C2420] px-4 py-8 text-center text-sm text-[#7A9490]">
        Rankings will appear here once data is connected.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-[rgba(56,160,71,0.1)] bg-[#1C2420]">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-[rgba(56,160,71,0.1)] text-[10px] uppercase tracking-wider text-[#7A9490]">
            <th className="px-4 py-3 font-medium">Rank</th>
            <th className="px-4 py-3 font-medium">Player</th>
            <th className="hidden px-4 py-3 font-medium sm:table-cell">Club</th>
            <th className="px-4 py-3 font-medium">CMV</th>
            <th className="px-4 py-3 font-medium">7d</th>
          </tr>
        </thead>
        <tbody>
          {players.map((p, i) => (
            <tr
              key={p.id}
              className={i % 2 === 1 ? "bg-[rgba(56,160,71,0.03)]" : undefined}
            >
              <td className="px-4 py-3 tabular-nums text-[#7A9490]">{i + 1}</td>
              <td className="px-4 py-3 font-medium text-white">
                <Link
                  href={`/player/${p.id}`}
                  className="flex items-center gap-3 transition hover:text-[#38A047]"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[rgba(56,160,71,0.2)] bg-[rgba(45,122,58,0.12)] text-[10px] font-bold text-[#E8F5EA]">
                    {playerInitials(p.name)}
                  </span>
                  <span>{p.name}</span>
                </Link>
              </td>
              <td className="hidden max-w-[140px] truncate px-4 py-3 text-[#7A9490] sm:table-cell">
                {p.club}
              </td>
              <td className="px-4 py-3 font-display text-base font-bold tabular-nums text-[#38A047]">
                {formatScore(p.cmvScore)}
              </td>
              <td className="px-4 py-3">
                <WeeklyTrend change={p.weeklyChange} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function LandingPage() {
  const rows = await getTopPlayersByCmv(5);
  const topFive = mapPlayerRowsToV0Players(rows);

  return (
    <div className="min-h-screen bg-[#0D1110] text-white">
      {/* HERO */}
      <section className="relative flex min-h-screen flex-col">
        <div className="pointer-events-none absolute inset-0" style={GRID_BG} aria-hidden />

        <LandingNav />

        <div className="relative z-10 flex min-h-0 flex-1 flex-col justify-center">
          <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-10 px-5 lg:flex-row lg:items-center lg:justify-between lg:gap-14 lg:px-8">
            <div className="max-w-xl flex-1 text-center lg:text-left">
              <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.18em] text-[#38A047]">
                CMV Intelligence · Football
              </p>
              <h1
                className="font-display text-[clamp(2.25rem,6vw,4rem)] font-bold leading-[1.05] tracking-[-0.03em] text-white lg:text-[64px]"
                style={{ maxWidth: "720px" }}
              >
                The commercial value standard for footballers
              </h1>
              <p
                className="mx-auto mt-5 text-base leading-relaxed text-[#7A9490] lg:mx-0"
                style={{ maxWidth: "500px" }}
              >
                SportScope ranks, compares and tracks the commercial market value of football
                players. The intelligence layer for brands, agencies and clubs.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
                <Link
                  href="/rankings"
                  className="inline-flex items-center justify-center rounded-lg bg-[#2D7A3A] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#256d33]"
                >
                  Explore Rankings →
                </Link>
                <Link
                  href="#what-is-cmv"
                  className="inline-flex items-center justify-center rounded-lg border border-[rgba(56,160,71,0.35)] px-6 py-3 text-sm font-semibold text-[#C8D8D4] transition hover:border-[#38A047]/50 hover:bg-white/[0.03]"
                >
                  How it works
                </Link>
              </div>
              <LandingStatTicker />
            </div>

            <div className="w-full max-w-md shrink-0 lg:max-w-[420px]">
              <div
                className="rounded-xl border border-[rgba(56,160,71,0.15)] bg-[#1C2420]/90 p-4 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.65)] backdrop-blur-sm"
                style={{ boxShadow: "0 24px 80px -20px rgba(0,0,0,0.5), 0 0 0 1px rgba(56,160,71,0.06) inset" }}
              >
                <div className="mb-3 flex items-center justify-between border-b border-[rgba(56,160,71,0.1)] pb-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#7A9490]">
                    CMV snapshot
                  </span>
                  <Trophy className="h-4 w-4 text-[#38A047]/70" />
                </div>
                <table className="w-full text-left text-sm">
                  <tbody>
                    {HERO_DEMO_ROWS.map((row) => (
                      <tr key={row.rank} className="border-b border-[rgba(56,160,71,0.06)] last:border-0">
                        <td className="py-2.5 pr-2 tabular-nums text-[#7A9490]">{row.rank}</td>
                        <td className="py-2.5 font-medium text-white">{row.name}</td>
                        <td className="hidden py-2.5 text-xs text-[#7A9490] sm:table-cell">{row.club}</td>
                        <td className="py-2.5 text-right font-display font-semibold tabular-nums text-[#38A047]">
                          {row.cmv}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHAT IS CMV */}
      <section id="what-is-cmv" className={`scroll-mt-20 border-t border-[rgba(56,160,71,0.08)] ${SECTION_PAD}`}>
        <div className="mx-auto max-w-6xl">
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#38A047]">Methodology</p>
          <h2 className="mt-3 font-display text-[36px] font-bold tracking-tight text-white">What is CMV Score?</h2>

          <div className="mt-10 flex flex-col gap-12 lg:flex-row lg:gap-16">
            <div className="relative min-h-[280px] flex-1 lg:w-[60%] lg:max-w-[60%] lg:flex-none">
              <span
                className="pointer-events-none absolute -left-2 -top-4 select-none font-display text-[120px] font-extrabold leading-none lg:-left-4 lg:-top-8"
                style={{ color: "rgba(56,160,71,0.08)" }}
                aria-hidden
              >
                6
              </span>
              <div className="relative pt-16 lg:pt-20">
                <h3 className="font-display text-[32px] font-bold tracking-tight text-white">
                  Six dimensions of commercial value
                </h3>
                <p className="mt-4 max-w-lg text-base leading-relaxed text-[#7A9490]">
                  CMV (Commercial Market Value) is a single score built from six sub-dimensions — each
                  capturing a distinct signal brands and clubs care about when evaluating athletes.
                </p>
              </div>
            </div>

            <div className="flex-1 lg:w-[40%] lg:max-w-[40%] lg:flex-none">
              <ul className="divide-y divide-[rgba(56,160,71,0.12)]">
                {CMV_DIMENSIONS.map((d) => (
                  <li key={d.n} className="py-4 first:pt-0">
                    <div className="flex gap-4">
                      <span className="w-8 shrink-0 pt-0.5 font-mono text-xs font-semibold text-[#38A047]">
                        {d.n}
                      </span>
                      <div>
                        <p className="text-[13px] font-bold text-white">{d.name}</p>
                        <p className="mt-1 text-sm leading-snug text-[#7A9490]">{d.desc}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FOR WHO */}
      <section className={`border-t border-[rgba(56,160,71,0.08)] ${SECTION_PAD}`}>
        <div className="mx-auto max-w-6xl">
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#38A047]">Audience</p>
          <h2 className="mt-3 font-display text-[36px] font-bold tracking-tight text-white">
            Built for sports business
          </h2>

          <div className="mt-6">
            {/* Row 1 */}
            <div className="flex flex-col gap-8 border-b border-[rgba(56,160,71,0.08)] py-12 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
              <div className="max-w-xl flex-1">
                <Building2 className="mb-4 h-8 w-8 text-[#38A047]" strokeWidth={1.5} />
                <h3 className="font-display text-xl font-semibold text-white">Brands &amp; Sponsors</h3>
                <ul className="mt-4 space-y-2 text-sm leading-relaxed text-[#7A9490]">
                  <li>Shortlist athletes by CMV, league and audience fit</li>
                  <li>Compare roster options before negotiations</li>
                  <li>Track value movement after campaigns</li>
                </ul>
              </div>
              <span
                className="pointer-events-none shrink-0 font-display text-[clamp(4rem,12vw,8rem)] font-extrabold leading-none text-white/[0.05] lg:text-[120px]"
                aria-hidden
              >
                01
              </span>
            </div>

            {/* Row 2 */}
            <div className="flex flex-col gap-8 border-b border-[rgba(56,160,71,0.08)] py-12 lg:flex-row-reverse lg:items-center lg:justify-between lg:gap-12">
              <div className="max-w-xl flex-1">
                <Users className="mb-4 h-8 w-8 text-[#38A047]" strokeWidth={1.5} />
                <h3 className="font-display text-xl font-semibold text-white">Agencies</h3>
                <ul className="mt-4 space-y-2 text-sm leading-relaxed text-[#7A9490]">
                  <li>Pitch with a defensible value narrative</li>
                  <li>Monitor client momentum vs peers</li>
                  <li>Export-ready rankings for decks</li>
                </ul>
              </div>
              <span
                className="pointer-events-none shrink-0 font-display text-[clamp(4rem,12vw,8rem)] font-extrabold leading-none text-white/[0.05] lg:text-[120px]"
                aria-hidden
              >
                02
              </span>
            </div>

            {/* Row 3 */}
            <div className="flex flex-col gap-8 border-b border-[rgba(56,160,71,0.08)] py-12 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
              <div className="max-w-xl flex-1">
                <BarChart3 className="mb-4 h-8 w-8 text-[#38A047]" strokeWidth={1.5} />
                <h3 className="font-display text-xl font-semibold text-white">Analysts &amp; Creators</h3>
                <ul className="mt-4 space-y-2 text-sm leading-relaxed text-[#7A9490]">
                  <li>Consistent CMV methodology across the market</li>
                  <li>Deep links to player profiles and trends</li>
                  <li>Foundation for commentary and research</li>
                </ul>
              </div>
              <span
                className="pointer-events-none shrink-0 font-display text-[clamp(4rem,12vw,8rem)] font-extrabold leading-none text-white/[0.05] lg:text-[120px]"
                aria-hidden
              >
                03
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* RANKINGS PREVIEW */}
      <section
        id="rankings-preview"
        className={`scroll-mt-20 border-t border-[rgba(56,160,71,0.08)] ${SECTION_PAD}`}
      >
        <div className="mx-auto max-w-3xl">
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[#38A047]">Data</p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <h2 className="font-display text-[36px] font-bold tracking-tight text-white">
              Top CMV Rankings
            </h2>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#38A047]/35 bg-[#38A047]/12 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-[#38A047]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#38A047] opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#38A047]" />
              </span>
              Live
            </span>
          </div>
          <p className="mt-2 text-sm text-[#7A9490]">
            Pulled from the latest Supabase snapshot — same data as the full rankings view.
          </p>
          <div className="mt-8">
            <RankingsPreviewTable players={topFive} />
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/rankings"
              className="inline-flex items-center text-sm font-semibold text-[#38A047] transition hover:text-[#2D9E50]"
            >
              See full rankings →
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[rgba(56,160,71,0.1)] py-10 px-5 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 text-center md:flex-row md:items-start md:justify-between md:text-left">
          <div>
            <div className="flex items-center justify-center gap-3 md:justify-start">
              <LogoMark className="h-9 w-9 shrink-0" />
              <span className="font-display text-lg font-semibold text-white">Sports Scope</span>
            </div>
            <p className="mt-3 max-w-xs text-sm text-[#7A9490]">
              The commercial value standard for footballers
            </p>
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-[#7A9490]">
            <Link href="/rankings" className="transition hover:text-white">
              Rankings
            </Link>
            <span className="text-[rgba(56,160,71,0.3)]">·</span>
            <Link href="/compare" className="transition hover:text-white">
              Compare
            </Link>
            <span className="text-[rgba(56,160,71,0.3)]">·</span>
            <Link href="#" className="transition hover:text-white">
              About
            </Link>
          </nav>
        </div>
        <p className="mx-auto mt-8 max-w-6xl text-center text-xs text-[#4A5E58] md:text-left">
          © 2026 SportScope · CMV Intelligence
        </p>
      </footer>
    </div>
  );
}
