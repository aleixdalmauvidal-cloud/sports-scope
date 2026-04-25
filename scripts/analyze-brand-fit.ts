import { config } from "dotenv";
config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/database";

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
  latest_post_captions?: string[] | null;
};
type CampaignSignalsRow = Database["public"]["Tables"]["campaign_signals"]["Row"];
type CampaignSignalsInsert = Database["public"]["Tables"]["campaign_signals"]["Insert"];
type BrandFitInsert = Database["public"]["Tables"]["brand_fit"]["Insert"];
type CampaignSignalsLookup = {
  athlete_id: string;
  news_headlines: CampaignSignalsRow["news_headlines"];
  wikipedia_sponsors: CampaignSignalsRow["wikipedia_sponsors"];
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

async function callAnthropicBatch(requests: { id: string; prompt: string }[]): Promise<Map<string, any>> {
  const apiKey = requiredEnv("ANTHROPIC_API_KEY");

  const batchRes = await fetch("https://api.anthropic.com/v1/messages/batches", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-beta": "message-batches-2024-09-24",
    },
    body: JSON.stringify({
      requests: requests.map(r => ({
        custom_id: r.id,
        params: {
          model: "claude-sonnet-4-20250514",
          max_tokens: 500,
          temperature: 0.2,
          messages: [{ role: "user", content: r.prompt }],
        },
      })),
    }),
  });

  const batch: any = await batchRes.json();
  if (!batchRes.ok) throw new Error(`Batch create error: ${JSON.stringify(batch).slice(0, 300)}`);

  const batchId = batch.id;
  console.log(`[analyze:brands] Batch created: ${batchId}`);

  let status = batch.processing_status;
  while (status !== "ended") {
    await new Promise(r => setTimeout(r, 10000));
    const pollRes = await fetch(`https://api.anthropic.com/v1/messages/batches/${batchId}`, {
      headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01", "anthropic-beta": "message-batches-2024-09-24" },
    });
    const pollData: any = await pollRes.json();
    status = pollData.processing_status;
    console.log(`[analyze:brands] Batch status: ${status} — succeeded: ${pollData.request_counts?.succeeded ?? "?"}`);
  }

  const resultsRes = await fetch(`https://api.anthropic.com/v1/messages/batches/${batchId}/results`, {
    headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01", "anthropic-beta": "message-batches-2024-09-24" },
  });

  const resultsText = await resultsRes.text();
  const results = new Map<string, any>();

  for (const line of resultsText.split("\n").filter(Boolean)) {
    try {
      const item = JSON.parse(line);
      const customId = item.custom_id;
      const text = item.result?.message?.content?.find((c: any) => c.type === "text")?.text ?? "";
      if (text) {
        try {
          results.set(customId, extractJsonObject(text));
        } catch {
          console.error(`[analyze:brands] JSON parse failed for ${customId}`);
        }
      }
    } catch {
      continue;
    }
  }

  return results;
}

function buildPrompt(args: {
  name: string;
  club: string | null;
  league: string | null;
  ig_followers: number | null;
  engagement_rate: number | null;
  captions: string[];
  newsHeadlines: string[];
  wikipediaSponsors: string[];
}): string {
  const {
    name,
    club,
    league,
    ig_followers,
    engagement_rate,
    captions,
    newsHeadlines,
    wikipediaSponsors,
  } = args;
  const captionsList =
    captions.length > 0 ? captions.map((c, i) => `- (${i + 1}) ${c}`).join("\n") : "—";
  const newsList =
    newsHeadlines.length > 0 ? newsHeadlines.map((h, i) => `- (${i + 1}) ${h}`).join("\n") : "—";
  const wikiList =
    wikipediaSponsors.length > 0 ? wikipediaSponsors.join(", ") : "—";
  return `You are a sports marketing analyst specialized in brand detection.

Athlete: ${name}
Club: ${club ?? "—"}
League: ${league ?? "—"}
Instagram followers: ${ig_followers ?? "—"}
Engagement rate: ${engagement_rate ?? "—"}%

Recent Instagram post captions:
${captionsList}

Recent news headlines about this athlete's brand deals:
${newsList}

Known sponsors from Wikipedia:
${wikiList}

Based on ALL the sources above (captions, news headlines, Wikipedia data) AND your knowledge of this athlete's sponsorships, identify:

Return ONLY valid JSON:
{
  'branded_posts_count': number (0-20),
  'brands_detected': string[] (list 3-8 SPECIFIC real brand names this athlete is known to work with or likely works with based on their profile. Use actual brand names like:
    "Adidas", "Nike", "Puma", "New Balance" for sportswear;
    "Pepsi", "Coca-Cola", "Gatorade", "Red Bull" for beverages;
    "EA Sports", "PlayStation", "Xbox" for gaming;
    "BMW", "Mercedes", "Audi" for automotive;
    "Beats", "Apple", "Samsung" for tech;
    "Armani", "Hugo Boss", "Louis Vuitton" for luxury.
    NEVER return empty array - always estimate based on athlete profile.
    For top footballers always include at least their kit sponsor.),
  'brand_verticals': string[] (categories: sportswear, betting, luxury, tech, lifestyle, nutrition, automotive, gaming),
  'sponsorship_density': number (0-1),
  'lifestyle_score': number (0-100),
  'fit_sportswear': number (0-100),
  'fit_betting': number (0-100),
  'brand_safety_score': number (0-100),
  'campaign_types': string[] (types of campaigns detected: ambassador, product_launch, social_activation, event, charity)
}

IMPORTANT: brands_detected and brand_verticals must NEVER be empty arrays. Always provide at least 2-3 estimated brands and 2-3 verticals based on the athlete's profile and typical endorsement patterns for players of their caliber.`;
}

async function main(): Promise<void> {
  const supabaseUrl = requiredEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceKey = requiredEnv("SUPABASE_SERVICE_ROLE_KEY");

  const supabase = createClient<Database>(supabaseUrl, serviceKey);
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
      ig_followers: safeNumber(r.ig_followers),
      engagement_rate: safeNumber(r.engagement_rate),
      avg_views_per_post: safeNumber(r.avg_views_per_post),
      avg_views: safeNumber(r.avg_views),
      avg_likes: safeNumber(r.avg_likes),
      latest_post_captions: Array.isArray(r.latest_post_captions)
        ? r.latest_post_captions
        : null,
    });
  }

  console.log("[analyze:brands] Loading latest campaign_signals for those athletes…");
  const { data: signalsData, error: signalsErr } = await supabase
    .from("campaign_signals")
    .select("athlete_id, news_headlines, wikipedia_sponsors, date")
    .in("athlete_id", athleteIds)
    .order("date", { ascending: false });

  if (signalsErr) {
    console.error("[analyze:brands] campaign_signals:", signalsErr.message);
    process.exit(1);
  }

  const latestSignalsByAthlete = new Map<string, CampaignSignalsLookup>();
  for (const row of (signalsData ?? []) as Record<string, unknown>[]) {
    const athlete_id = String(row.athlete_id ?? "");
    if (!athlete_id || latestSignalsByAthlete.has(athlete_id)) continue;
    latestSignalsByAthlete.set(athlete_id, {
      athlete_id,
      news_headlines: (row.news_headlines as CampaignSignalsRow["news_headlines"]) ?? [],
      wikipedia_sponsors:
        (row.wikipedia_sponsors as CampaignSignalsRow["wikipedia_sponsors"]) ?? [],
    });
  }

  let ok = 0;
  let fail = 0;

  console.log("[analyze:brands] Building prompts for all athletes…");
  const batchRequests: {
    id: string;
    prompt: string;
    athlete: typeof athletes[0];
    captions: string[];
    newsHeadlines: string[];
    wikipediaSponsors: string[];
  }[] = [];

  for (const athlete of athletes) {
    const social = latestSocial.get(athlete.id);
    const igFollowers = social?.ig_followers ?? null;
    const engagementRate = social?.engagement_rate ?? null;
    const captions = normalizeStringArray(social?.latest_post_captions ?? []).slice(0, 5);
    const latestSignals = latestSignalsByAthlete.get(athlete.id) ?? null;
    const newsHeadlines = normalizeStringArray(latestSignals?.news_headlines ?? []).slice(0, 8);
    const wikipediaSponsors = normalizeStringArray(latestSignals?.wikipedia_sponsors ?? []).slice(0, 10);

    const prompt = buildPrompt({
      name: athlete.name,
      club: athlete.clubs?.name ?? null,
      league: athlete.clubs?.league ?? null,
      ig_followers: igFollowers,
      engagement_rate: engagementRate,
      captions,
      newsHeadlines,
      wikipediaSponsors,
    });

    batchRequests.push({
      id: athlete.id,
      prompt,
      athlete,
      captions,
      newsHeadlines,
      wikipediaSponsors,
    });
  }

  console.log(`[analyze:brands] Submitting batch of ${batchRequests.length} requests…`);
  const batchResults = await callAnthropicBatch(batchRequests.map(r => ({ id: r.id, prompt: r.prompt })));
  console.log(`[analyze:brands] Batch complete. Processing ${batchResults.size} results…`);

  for (const { athlete, captions, newsHeadlines, wikipediaSponsors } of batchRequests) {
    process.stdout.write(`[analyze:brands] ${athlete.name}… `);
    try {
      const estimate = batchResults.get(athlete.id);
      if (!estimate) throw new Error("No result in batch");

      const brandsDetected = normalizeStringArray(estimate?.brands_detected);
      const brandVerticals = normalizeStringArray(estimate?.brand_verticals);
      const campaignTypes = normalizeStringArray(estimate?.campaign_types);
      const brandSafetyScore = safeNumber(estimate?.brand_safety_score);

      const campaignSignalsPayload: CampaignSignalsInsert = {
        athlete_id: athlete.id,
        date,
        branded_posts_count: safeNumber(estimate?.branded_posts_count),
        brands_detected: brandsDetected,
        brand_verticals: brandVerticals,
        sponsorship_density: safeNumber(estimate?.sponsorship_density),
        brand_safety_score: brandSafetyScore,
        unique_brands_count: uniqueCount(brandsDetected),
        campaign_types: campaignTypes,
        data_sources: [
          ...(captions.length > 0 ? ["instagram"] : []),
          ...(newsHeadlines.length > 0 ? ["news"] : []),
          ...(wikipediaSponsors.length > 0 ? ["wikipedia"] : []),
        ],
      };

      const { error: csErr } = await supabase
        .from("campaign_signals")
        .upsert(campaignSignalsPayload, { onConflict: "athlete_id,date" });
      if (csErr) throw new Error(`campaign_signals: ${csErr.message}`);

      const brandFitPayload: BrandFitInsert = {
        athlete_id: athlete.id,
        date,
        lifestyle_score: safeNumber(estimate?.lifestyle_score),
        fit_sportswear: safeNumber(estimate?.fit_sportswear),
        fit_betting: safeNumber(estimate?.fit_betting),
        brand_safety_score: brandSafetyScore,
      };

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

