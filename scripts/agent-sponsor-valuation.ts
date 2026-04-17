import { config } from "dotenv";
config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function isoToday(): string {
  return new Date().toISOString().split("T")[0]!;
}

function requiredEnv(name: string): string {
  const v = process.env[name]?.trim();
  if (!v) { console.error(`Missing ${name}`); process.exit(1); }
  return v;
}

function extractJsonObject(text: string): any {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON found");
  return JSON.parse(text.slice(start, end + 1));
}

async function valuateAthlete(athlete: {
  id: string;
  name: string;
  club: string | null;
  league: string | null;
  ig_followers: number | null;
  tt_followers: number | null;
  engagement_rate: number | null;
  cmv_total: number | null;
  sports_score: number | null;
  social_score: number | null;
  brands_detected: string[] | null;
}): Promise<any> {
  const apiKey = requiredEnv("ANTHROPIC_API_KEY");

  const systemPrompt = `You are a sports sponsorship valuation expert with deep knowledge of the market. You know the going rates for athlete sponsorship deals across all tiers.

Your job is to estimate realistic sponsorship values for football players based on:
- Their social media reach and engagement
- Their sporting performance and club prestige  
- Their existing brand portfolio
- Comparable deals in the market
- Current market rates for similar athletes

Always search for comparable athlete deals to ground your estimates in real market data.
Be specific and realistic — not every player is worth millions. Base estimates on actual market evidence.`;

  const userPrompt = `Estimate the sponsorship value for this football player:

Name: ${athlete.name}
Club: ${athlete.club ?? "Unknown"}
League: ${athlete.league ?? "Unknown"}
Instagram followers: ${athlete.ig_followers ? (athlete.ig_followers / 1_000_000).toFixed(1) + "M" : "Unknown"}
TikTok followers: ${athlete.tt_followers ? (athlete.tt_followers / 1_000_000).toFixed(1) + "M" : "Unknown"}
Engagement rate: ${athlete.engagement_rate ?? "Unknown"}%
CMV Score: ${athlete.cmv_total ?? "Unknown"}/100
Sports Score: ${athlete.sports_score ?? "Unknown"}/100
Social Score: ${athlete.social_score ?? "Unknown"}/100
Known brands: ${athlete.brands_detected?.join(", ") ?? "Unknown"}

Search the web for:
1. Comparable athlete sponsorship deal values
2. Current market rates for players at this level
3. Recent deals for similar profile athletes
4. Industry benchmarks for social media sponsorships

Return ONLY valid JSON:
{
  "valuation_per_post_min": number (euros, single sponsored Instagram post minimum),
  "valuation_per_post_max": number (euros, single sponsored Instagram post maximum),
  "valuation_annual_min": number (euros, total annual sponsorship portfolio minimum),
  "valuation_annual_max": number (euros, total annual sponsorship portfolio maximum),
  "valuation_ambassador_min": number (euros, annual brand ambassador deal minimum),
  "valuation_ambassador_max": number (euros, annual brand ambassador deal maximum),
  "valuation_event_min": number (euros, single event appearance minimum),
  "valuation_event_max": number (euros, single event appearance maximum),
  "reasoning": "detailed explanation of how you arrived at these numbers, what comparables you found, what factors drove the valuation up or down",
  "key_factors": {
    "positive": ["factor1", "factor2"],
    "negative": ["factor1", "factor2"]
  },
  "comparable_athletes": [
    {
      "name": "athlete name",
      "similarity": "why comparable",
      "known_deal_value": "deal value if found"
    }
  ],
  "market_tier": "micro|rising|established|elite|superstar",
  "best_vertical_fit": "the single best brand category for this athlete"
}`;

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 3000,
      tools: [
        {
          type: "web_search_20250305",
          name: "web_search",
        }
      ],
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(`API error: ${JSON.stringify(data).slice(0, 300)}`);

  const textBlock = data.content
    ?.filter((c: any) => c.type === "text")
    ?.map((c: any) => c.text)
    ?.join("") ?? "";

  if (!textBlock) throw new Error("No text in response");
  return extractJsonObject(textBlock);
}

async function saveToSupabase(athleteId: string, result: any) {
  const today = isoToday();

  const { error } = await supabase
    .from("sponsor_valuations")
    .upsert({
      athlete_id: athleteId,
      date: today,
      valuation_per_post_min: result?.valuation_per_post_min ?? null,
      valuation_per_post_max: result?.valuation_per_post_max ?? null,
      valuation_annual_min: result?.valuation_annual_min ?? null,
      valuation_annual_max: result?.valuation_annual_max ?? null,
      valuation_ambassador_min: result?.valuation_ambassador_min ?? null,
      valuation_ambassador_max: result?.valuation_ambassador_max ?? null,
      valuation_event_min: result?.valuation_event_min ?? null,
      valuation_event_max: result?.valuation_event_max ?? null,
      reasoning: result?.reasoning ?? null,
      key_factors: result?.key_factors ?? null,
      comparable_athletes: result?.comparable_athletes ?? null,
    }, { onConflict: "athlete_id,date" });

  if (error) throw new Error(`Supabase error: ${error.message}`);
}

async function main() {
  const { data: athletes, error } = await supabase
    .from("athletes")
    .select(`
      id, name,
      clubs(name, league)
    `)
    .eq("is_active", true);

  if (error || !athletes?.length) {
    console.log("⚠️  No active athletes found.");
    return;
  }

  const athleteIds = (athletes as any[]).map(a => a.id);

  const { data: cmvData } = await supabase
    .from("cmv_scores")
    .select("athlete_id, cmv_total, sports_score, social_score")
    .in("athlete_id", athleteIds)
    .order("date", { ascending: false });

  const latestCmv = new Map<string, any>();
  for (const row of (cmvData ?? []) as any[]) {
    if (!latestCmv.has(row.athlete_id)) latestCmv.set(row.athlete_id, row);
  }

  const { data: socialData } = await supabase
    .from("social_metrics")
    .select("athlete_id, ig_followers, tt_followers, engagement_rate")
    .in("athlete_id", athleteIds)
    .order("date", { ascending: false });

  const latestSocial = new Map<string, any>();
  for (const row of (socialData ?? []) as any[]) {
    if (!latestSocial.has(row.athlete_id)) latestSocial.set(row.athlete_id, row);
  }

  const { data: campaignData } = await supabase
    .from("campaign_signals")
    .select("athlete_id, brands_detected")
    .in("athlete_id", athleteIds)
    .order("date", { ascending: false });

  const latestCampaign = new Map<string, any>();
  for (const row of (campaignData ?? []) as any[]) {
    if (!latestCampaign.has(row.athlete_id)) latestCampaign.set(row.athlete_id, row);
  }

  console.log(`📋 Running Sponsor Valuation Agent for ${athletes.length} athletes`);

  let ok = 0;
  let fail = 0;

  for (const athlete of athletes as any[]) {
    process.stdout.write(`[sponsor-valuation] ${athlete.name}… `);
    try {
      await new Promise(r => setTimeout(r, 8000));

      const cmv = latestCmv.get(athlete.id);
      const social = latestSocial.get(athlete.id);
      const campaign = latestCampaign.get(athlete.id);

      const result = await valuateAthlete({
        id: athlete.id,
        name: athlete.name,
        club: athlete.clubs?.name ?? null,
        league: athlete.clubs?.league ?? null,
        ig_followers: social?.ig_followers ?? null,
        tt_followers: social?.tt_followers ?? null,
        engagement_rate: social?.engagement_rate ?? null,
        cmv_total: cmv?.cmv_total ?? null,
        sports_score: cmv?.sports_score ?? null,
        social_score: cmv?.social_score ?? null,
        brands_detected: campaign?.brands_detected ?? null,
      });

      await saveToSupabase(athlete.id, result);

      const annualMin = result?.valuation_annual_min
        ? `€${(result.valuation_annual_min / 1000).toFixed(0)}K`
        : "?";
      const annualMax = result?.valuation_annual_max
        ? `€${(result.valuation_annual_max / 1000).toFixed(0)}K`
        : "?";
      const tier = result?.market_tier ?? "?";
      console.log(`✅ ${annualMin}–${annualMax}/year | tier: ${tier}`);
      ok++;
    } catch (e: any) {
      console.log(`❌ failed: ${e?.message?.slice(0, 80)}`);
      fail++;
    }
  }

  console.log(`\n🎉 Sponsor Valuation Agent done. ok=${ok} fail=${fail}`);
}

main().catch(e => {
  console.error("Fatal:", e);
  process.exit(1);
});
