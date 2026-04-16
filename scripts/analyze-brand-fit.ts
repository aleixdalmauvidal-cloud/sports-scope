import { config } from "dotenv";
config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";

type Athlete = {
  id: string;
  name: string;
  clubs: { name: string | null; league: string | null } | null;
};

type SocialMetrics = {
  athlete_id: string;
  date: string | null;
  ig_followers?: number | null;
  engagement_rate?: number | null;
  avg_views_per_post?: number | null;
  avg_views?: number | null;
  avg_likes?: number | null;
};

function requiredEnv(name: string): string {
  const v = process.env[name]?.trim();
  if (!v) {
    console.error(`[analyze:brands] Missing ${name} in .env.local`);
    process.exit(1);
  }
  return v;
}

function todayIsoDate(): string {
  return new Date().toISOString().split("T")[0]!;
}

function safeNumber(v: unknown): number | null {
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function normalizeStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  const out: string[] = [];
  for (const x of v) {
    if (typeof x === "string") {
      const s = x.trim();
      if (s) out.push(s);
    }
  }
  return out;
}

function uniqueCount(arr: string[]): number {
  return new Set(arr.map((s) => s.trim().toLowerCase()).filter(Boolean)).size;
}

function extractJsonObject(text: string): any {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("No JSON object found in model output");
  }
  const slice = text.slice(start, end + 1);
  return JSON.parse(slice);
}

async function callAnthropic(prompt: string): Promise<any> {
  const apiKey = requiredEnv("ANTHROPIC_API_KEY");
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 700,
      temperature: 0.2,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const data: any = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(
      `Anthropic error ${res.status}: ${JSON.stringify(data)?.slice(0, 500)}`
    );
  }

  const text =
    data?.content?.find((c: any) => c?.type === "text")?.text ??
    data?.content?.[0]?.text ??
    "";
  if (typeof text !== "string" || !text.trim()) {
    throw new Error("Anthropic response missing text");
  }
  return extractJsonObject(text);
}

function buildPrompt(args: {
  name: string;
  club: string | null;
  league: string | null;
  ig_followers: number | null;
  engagement_rate: number | null;
  avg_views: number | null;
}): string {
  const {
    name,
    club,
    league,
    ig_followers,
    engagement_rate,
    avg_views,
  } = args;
  return `You are a sports marketing intelligence analyst. Analyze this athlete's
Instagram profile and return ONLY a JSON object with no other text:

Athlete: ${name}
Club: ${club ?? "—"}
League: ${league ?? "—"}  
Instagram followers: ${ig_followers ?? "—"}
Engagement rate: ${engagement_rate ?? "—"}%
Average views: ${avg_views ?? "—"}

Based on this public profile data, estimate:
{
  'branded_posts_count': number (0-20, estimated branded/sponsored posts per month),
  'brands_detected': string[] (list of likely brand categories this athlete promotes),
  'brand_verticals': string[] (verticals: sportswear, betting, luxury, tech, lifestyle, nutrition, automotive),
  'sponsorship_density': number (0-1, ratio of branded content),
  'lifestyle_score': number (0-100, lifestyle appeal and aspirational value),
  'fit_sportswear': number (0-100, fit for sportswear brands),
  'fit_betting': number (0-100, fit for betting brands),
  'brand_safety_score': number (0-100, brand safety, 100=very safe)
}`;
}

async function main(): Promise<void> {
  const supabaseUrl = requiredEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceKey = requiredEnv("SUPABASE_SERVICE_ROLE_KEY");

  const supabase = createClient(supabaseUrl, serviceKey);
  const date = todayIsoDate();

  console.log("[analyze:brands] Loading 30 active athletes…");
  const { data: athletesData, error: athletesErr } = await supabase
    .from("athletes")
    .select("id, name, clubs ( name, league )")
    .eq("is_active", true)
    .limit(30);

  if (athletesErr) {
    console.error("[analyze:brands] athletes:", athletesErr.message);
    process.exit(1);
  }

  const athletes = (athletesData ?? []) as Athlete[];
  const athleteIds = athletes.map((a) => a.id);
  console.log(`[analyze:brands] Active athletes loaded: ${athletes.length}`);

  console.log("[analyze:brands] Loading latest social_metrics for those athletes…");
  const { data: socialData, error: socialErr } = await supabase
    .from("social_metrics")
    .select("*")
    .in("athlete_id", athleteIds)
    .order("date", { ascending: false });

  if (socialErr) {
    console.error("[analyze:brands] social_metrics:", socialErr.message);
    process.exit(1);
  }

  const socialRows = (socialData ?? []) as Record<string, unknown>[];
  const latestSocial = new Map<string, SocialMetrics>();
  for (const r of socialRows) {
    const athlete_id = String(r.athlete_id ?? "");
    if (!athlete_id) continue;
    if (latestSocial.has(athlete_id)) continue;
    latestSocial.set(athlete_id, {
      athlete_id,
      date: r.date != null ? String(r.date) : null,
      ig_followers: safeNumber((r as any).ig_followers),
      engagement_rate: safeNumber((r as any).engagement_rate),
      avg_views_per_post: safeNumber((r as any).avg_views_per_post),
      avg_views: safeNumber((r as any).avg_views),
      avg_likes: safeNumber((r as any).avg_likes),
    });
  }

  let ok = 0;
  let fail = 0;

  for (const athlete of athletes) {
    const social = latestSocial.get(athlete.id);
    const igFollowers = social?.ig_followers ?? null;
    const engagementRate = social?.engagement_rate ?? null;
    const avgViews = social?.avg_views_per_post ?? social?.avg_views ?? null;

    const prompt = buildPrompt({
      name: athlete.name,
      club: athlete.clubs?.name ?? null,
      league: athlete.clubs?.league ?? null,
      ig_followers: igFollowers,
      engagement_rate: engagementRate,
      avg_views: avgViews,
    });

    process.stdout.write(`[analyze:brands] ${athlete.name}… `);
    try {
      const estimate = await callAnthropic(prompt);

      const brandsDetected = normalizeStringArray(estimate?.brands_detected);
      const brandVerticals = normalizeStringArray(estimate?.brand_verticals);
      const brandSafetyScore = safeNumber(estimate?.brand_safety_score);

      const campaignSignalsPayload = {
        athlete_id: athlete.id,
        date,
        branded_posts_count: safeNumber(estimate?.branded_posts_count),
        brands_detected: brandsDetected,
        brand_verticals: brandVerticals,
        sponsorship_density: safeNumber(estimate?.sponsorship_density),
        brand_safety_score: brandSafetyScore,
        unique_brands_count: uniqueCount(brandsDetected),
      } as any;

      const { error: csErr } = await supabase
        .from("campaign_signals")
        .upsert(campaignSignalsPayload, { onConflict: "athlete_id,date" });
      if (csErr) throw new Error(`campaign_signals: ${csErr.message}`);

      const brandFitPayload = {
        athlete_id: athlete.id,
        date,
        lifestyle_score: safeNumber(estimate?.lifestyle_score),
        fit_sportswear: safeNumber(estimate?.fit_sportswear),
        fit_betting: safeNumber(estimate?.fit_betting),
        brand_safety_score: brandSafetyScore,
      } as any;

      const { error: bfErr } = await supabase
        .from("brand_fit")
        .upsert(brandFitPayload, { onConflict: "athlete_id,date" });
      if (bfErr) throw new Error(`brand_fit: ${bfErr.message}`);

      ok++;
      console.log("ok");
    } catch (e: any) {
      fail++;
      console.log("fail");
      console.error(
        `[analyze:brands] Failed for ${athlete.name}:`,
        e?.message ?? e
      );
    }
  }

  console.log(`[analyze:brands] Done. ok=${ok} fail=${fail}`);
}

main().catch((e) => {
  console.error("[analyze:brands] Fatal:", e);
  process.exit(1);
});

