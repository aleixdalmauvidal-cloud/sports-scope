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

async function discoverSponsors(athlete: { id: string; name: string; club: string | null; league: string | null }): Promise<any> {
  const apiKey = requiredEnv("ANTHROPIC_API_KEY");

  const systemPrompt = `You are a sports sponsorship intelligence analyst. Your job is to find ALL real, confirmed sponsors and brand deals for football players using web search.

Search strategy:
1. Search for "[player name] sponsor deal 2024 2025"
2. Search for "[player name] brand ambassador endorsement"
3. Search for "[player name] kit sponsor boots deal"
4. Search for "[player name] commercial campaign"
5. Check recent news about the player's commercial activities

Be thorough. Always search multiple times with different queries to find as many sponsors as possible.
Only include CONFIRMED or HIGHLY LIKELY sponsors based on evidence found.
Rate your confidence for each sponsor: high (confirmed deal), medium (strong evidence), low (likely based on context).`;

  const userPrompt = `Find all sponsors and brand deals for this football player:

Name: ${athlete.name}
Club: ${athlete.club ?? "Unknown"}
League: ${athlete.league ?? "Unknown"}

Search the web thoroughly and return ONLY valid JSON:
{
  "sponsors": [
    {
      "brand": "brand name",
      "category": "sportswear|tech|automotive|luxury|nutrition|betting|gaming|lifestyle|finance",
      "deal_type": "boots|kit|ambassador|social|event|product",
      "confidence": "high|medium|low",
      "evidence": "brief description of what you found"
    }
  ],
  "total_found": number,
  "confidence_score": number (0-100, overall confidence in findings),
  "primary_kit_sponsor": "brand name or null",
  "main_boot_deal": "brand name or null"
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
      max_tokens: 2000,
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

  const sponsors = result?.sponsors ?? [];
  const brandNames = sponsors.map((s: any) => s.brand).filter(Boolean);
  const verticals = [...new Set(sponsors.map((s: any) => s.category).filter(Boolean))] as string[];
  const confidence = result?.confidence_score ?? 50;

  const { error } = await supabase
    .from("campaign_signals")
    .upsert({
      athlete_id: athleteId,
      date: today,
      brands_detected: brandNames,
      brand_verticals: verticals,
      unique_brands_count: brandNames.length,
      discovered_sponsors: result,
      sponsor_discovery_ran_at: new Date().toISOString(),
      discovery_confidence: confidence / 100,
      data_sources: ["web_search", "ai_agent"],
    }, { onConflict: "athlete_id,date" });

  if (error) throw new Error(`Supabase error: ${error.message}`);
}

async function main() {
  const { data: athletes, error } = await supabase
    .from("athletes")
    .select("id, name, clubs(name, league)")
    .eq("is_active", true);

  if (error || !athletes?.length) {
    console.log("⚠️  No active athletes found.");
    return;
  }

  console.log(`📋 Running Sponsor Discovery Agent for ${athletes.length} athletes`);

  let ok = 0;
  let fail = 0;

  for (const athlete of athletes as any[]) {
    process.stdout.write(`[sponsor-discovery] ${athlete.name}… `);
    try {
      await new Promise(r => setTimeout(r, 15000));

      let result = null;
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          result = await discoverSponsors({
            id: athlete.id,
            name: athlete.name,
            club: athlete.clubs?.name ?? null,
            league: athlete.clubs?.league ?? null,
          });
          break;
        } catch (e: any) {
          if (attempt < 3 && e?.message?.includes("rate_limit")) {
            console.log(`⏳ rate limit, waiting 30s before retry ${attempt + 1}/3…`);
            await new Promise(r => setTimeout(r, 30000));
          } else {
            throw e;
          }
        }
      }
      if (!result) throw new Error("All retries failed");

      await saveToSupabase(athlete.id, result);

      const found = result?.total_found ?? result?.sponsors?.length ?? 0;
      const confidence = result?.confidence_score ?? "?";
      console.log(`✅ ${found} sponsors found (confidence: ${confidence}%)`);
      ok++;
    } catch (e: any) {
      console.log(`❌ failed: ${e?.message?.slice(0, 80)}`);
      fail++;
    }
  }

  console.log(`\n🎉 Sponsor Discovery Agent done. ok=${ok} fail=${fail}`);
}

main().catch(e => {
  console.error("Fatal:", e);
  process.exit(1);
});
