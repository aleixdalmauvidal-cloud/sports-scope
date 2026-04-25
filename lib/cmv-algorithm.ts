/** Pure helpers shared by `scripts/calculate-cmv.ts` and unit tests. */

export function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

export function logistic100(k: number, delta: number): number {
  return 100 / (1 + Math.exp(-k * delta));
}

export function confidenceScore(args: {
  ig_followers: number | null | undefined;
  engagement_rate: number | null | undefined;
  rating: number | null | undefined;
  goals: number | null | undefined;
  minutes_played: number | null | undefined;
}): number {
  const signals: boolean[] = [
    args.ig_followers != null &&
      Number.isFinite(Number(args.ig_followers)) &&
      Number(args.ig_followers) > 0,
    args.engagement_rate != null && Number.isFinite(Number(args.engagement_rate)),
    args.rating != null && Number.isFinite(Number(args.rating)),
    args.goals != null && Number.isFinite(Number(args.goals)),
    args.minutes_played != null && Number.isFinite(Number(args.minutes_played)),
  ];
  const present = signals.filter((x) => x).length;
  return clamp(0.6 + (present / 5) * 0.4, 0.6, 1.0);
}

export type SocialForBrandSafety = {
  ig_followers?: number | null;
  tt_followers?: number | null;
  x_followers?: number | null;
  yt_subscribers?: number | null;
  engagement_rate?: number | null;
};

function platformConcentration(ig: number, tt: number, yt: number, xf: number): number {
  const sum = ig + tt + yt + xf;
  if (sum <= 0) return 0;
  return Math.max(ig, tt, yt, xf) / sum;
}

export function brandSafetyMultiplier(s: SocialForBrandSafety | undefined): number {
  let m = 1.0;
  if (!s) return clamp(m, 0, 1);

  const ig = s.ig_followers != null && Number.isFinite(Number(s.ig_followers)) ? Number(s.ig_followers) : null;
  const tt = s.tt_followers != null && Number.isFinite(Number(s.tt_followers)) ? Number(s.tt_followers) : null;
  const xf = s.x_followers != null && Number.isFinite(Number(s.x_followers)) ? Number(s.x_followers) : null;
  const er =
    s.engagement_rate != null && Number.isFinite(Number(s.engagement_rate))
      ? Number(s.engagement_rate)
      : null;

  if (er != null && er < 0.3 && ig != null && ig > 1_000_000) m -= 0.15;
  if (tt == null && ig == null && xf == null) m -= 0.1;

  const igN = ig ?? 0;
  const ttN = tt ?? 0;
  const ytN =
    s.yt_subscribers != null && Number.isFinite(Number(s.yt_subscribers))
      ? Number(s.yt_subscribers)
      : 0;
  const xfN = xf ?? 0;
  if (platformConcentration(igN, ttN, ytN, xfN) > 0.85) m -= 0.05;

  return clamp(m, 0, 1);
}
