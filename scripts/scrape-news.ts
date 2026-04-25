import { config } from "dotenv";
config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ACTOR_ID = "apify~google-news-scraper";

function getHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.APIFY_API_TOKEN}`,
  };
}

function isoToday(): string {
  return new Date().toISOString().split("T")[0]!;
}

async function runApifyActor(queries: string[]) {
  const runRes = await fetch(`https://api.apify.com/v2/acts/${ACTOR_ID}/runs`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      queries: queries.map(q => ({ query: q, maxResults: 5 })),
    }),
  });

  const run = await runRes.json();
  const runId = run.data?.id;
  if (!runId) {
    console.error("❌ Error lanzando actor Google News:", run);
    return null;
  }

  console.log(`⏳ Run iniciado: ${runId}`);

  let status = "RUNNING";
  while (status === "RUNNING" || status === "READY") {
    await new Promise((r) => setTimeout(r, 5000));
    const statusRes = await fetch(`https://api.apify.com/v2/actor-runs/${runId}`, {
      headers: getHeaders(),
    });
    const statusData = await statusRes.json();
    status = statusData.data?.status;
    console.log(`   status: ${status}`);
  }

  if (status !== "SUCCEEDED") {
    console.error(`❌ Run News falló: ${status}`);
    return null;
  }

  const runInfoRes = await fetch(`https://api.apify.com/v2/actor-runs/${runId}`, { headers: getHeaders() });
  const runInfo = await runInfoRes.json();
  const datasetId = runInfo.data.defaultDatasetId;

  const itemsRes = await fetch(`https://api.apify.com/v2/datasets/${datasetId}/items`, { headers: getHeaders() });
  return await itemsRes.json();
}

async function saveToSupabase(athleteId: string, headlines: string[]) {
  if (!headlines.length) return;
  const today = isoToday();

  await supabase
    .from("campaign_signals")
    .upsert(
      {
        athlete_id: athleteId,
        date: today,
        news_headlines: headlines.slice(0, 20),
      },
      { onConflict: "athlete_id,date" }
    );

  console.log(`✅ News guardado — ${athleteId} — ${headlines.length} headlines`);
}

async function main() {
  const { data: athletes, error } = await supabase
    .from("athletes")
    .select("id, name")
    .eq("is_active", true);

  if (error || !athletes?.length) {
    console.log("⚠️  No hay atletas activos.");
    return;
  }

  console.log(`📋 ${athletes.length} atletas activos`);

  const batchSize = 5;
  for (let i = 0; i < athletes.length; i += batchSize) {
    const batch = athletes.slice(i, i + batchSize) as { id: string; name: string }[];

    const queries = batch.flatMap(a => [
      `"${a.name}" sponsor deal 2024 2025`,
      `"${a.name}" brand ambassador endorsement`,
    ]);

    const results = await runApifyActor(queries);
    if (!results) continue;

    for (const athlete of batch) {
      const relevantHeadlines = (results as any[])
        .filter(item => {
          const title = (item?.title ?? "").toLowerCase();
          const desc = (item?.description ?? "").toLowerCase();
          const nameLower = athlete.name.toLowerCase();
          return (title.includes(nameLower) || desc.includes(nameLower));
        })
        .map(item => item?.title ?? "")
        .filter(Boolean)
        .slice(0, 10);

      if (relevantHeadlines.length > 0) {
        await saveToSupabase(athlete.id, relevantHeadlines);
        console.log(`${athlete.name} — ${relevantHeadlines.length} headlines`);
      } else {
        console.log(`⚠️  No news for ${athlete.name}`);
      }
    }

    await new Promise(r => setTimeout(r, 3000));
  }

  console.log("🎉 News scraping completado");
}

main();
