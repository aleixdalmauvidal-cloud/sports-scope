import { config } from "dotenv";
config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ACTOR_ID = "streamers~youtube-scraper";

function getHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.APIFY_API_TOKEN}`,
  };
}

function isoToday(): string {
  return new Date().toISOString().split("T")[0]!;
}

function mean(nums: number[]): number | null {
  if (!nums.length) return null;
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
}

async function runApifyActor(handles: string[]) {
  const uniqueHandles = [...new Set(handles.map((h) => {
    const clean = h.trim().replace(/^@/, "");
    return `@${clean}`;
  }).filter(Boolean))];
  
  console.log(`🚀 Lanzando Apify YouTube scraper para: ${uniqueHandles.join(", ")}`);

  const runRes = await fetch(`https://api.apify.com/v2/acts/${ACTOR_ID}/runs`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      handles: uniqueHandles,
      maxResults: 1,
    }),
  });

  const run = await runRes.json();
  const runId = run.data?.id;

  if (!runId) {
    console.error("❌ Error lanzando actor YouTube:", run);
    return null;
  }

  console.log(`⏳ Run iniciado: ${runId} — esperando resultados...`);

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
    console.error(`❌ Run YouTube falló con status: ${status}`);
    return null;
  }

  const runInfoRes = await fetch(`https://api.apify.com/v2/actor-runs/${runId}`, {
    headers: getHeaders(),
  });
  const runInfo = await runInfoRes.json();
  const datasetId = runInfo.data.defaultDatasetId;

  const itemsRes = await fetch(
    `https://api.apify.com/v2/datasets/${datasetId}/items`,
    { headers: getHeaders() }
  );
  return await itemsRes.json();
}

async function saveToSupabase(args: {
  athleteId: string;
  ytSubscribers: number | null;
  ytAvgViews: number | null;
}) {
  const today = isoToday();

  const { data: updated, error: updateError } = await supabase
    .from("social_metrics")
    .update({
      yt_subscribers: args.ytSubscribers,
      yt_avg_views: args.ytAvgViews,
    })
    .eq("athlete_id", args.athleteId)
    .eq("date", today)
    .select("athlete_id");

  if (updateError) {
    console.error(`❌ Error actualizando YouTube para ${args.athleteId}:`, updateError.message);
    return;
  }

  if (!updated || updated.length === 0) {
    const { error: insertError } = await supabase.from("social_metrics").insert({
      athlete_id: args.athleteId,
      date: today,
      yt_subscribers: args.ytSubscribers,
      yt_avg_views: args.ytAvgViews,
    });
    if (insertError) {
      console.error(`❌ Error insertando YouTube para ${args.athleteId}:`, insertError.message);
      return;
    }
  }

  console.log(`✅ YouTube guardado — ${args.athleteId} — subscribers: ${args.ytSubscribers} — avg_views: ${args.ytAvgViews}`);
}

async function main() {
  const { data: athletes, error } = await supabase
    .from("athletes")
    .select("id, name, yt_handle")
    .eq("is_active", true)
    .not("yt_handle", "is", null);

  if (error || !athletes?.length) {
    console.log("⚠️  No hay atletas activos con yt_handle.");
    return;
  }

  console.log(`📋 ${athletes.length} atletas activos con YouTube handle`);

  const batchSize = 5;
  for (let i = 0; i < athletes.length; i += batchSize) {
    const batch = athletes.slice(i, i + batchSize) as {
      id: string;
      name: string;
      yt_handle: string;
    }[];
    const handles = batch.map((a) => a.yt_handle);

    const results = await runApifyActor(handles);
    if (!results) continue;

    console.log(`🔎 YouTube results count: ${results?.length}`);

    const byHandle = new Map<string, { subscribers: number | null; avgViews: number | null }>();
    for (const item of results as any[]) {
      const handle =
        item?.channelHandle ?? item?.handle ?? item?.customUrl ?? item?.id;
      if (!handle) continue;
      const key = String(handle).toLowerCase().replace(/^@/, "");

      const subscribers =
        item?.subscriberCount ?? item?.subscribers ?? item?.numberOfSubscribers ?? null;

      const viewCounts = (item?.videos ?? item?.recentVideos ?? [])
        .map((v: any) => v?.viewCount ?? v?.views ?? null)
        .filter((v: any) => typeof v === "number" && Number.isFinite(v));
      const avgViews = mean(viewCounts);

      byHandle.set(key, { subscribers, avgViews });
    }

    for (const athlete of batch) {
      const key = athlete.yt_handle.toLowerCase().replace(/^@/, "");
      const g = byHandle.get(key);
      if (!g) {
        console.log(`⚠️  No YouTube data for ${athlete.name} (@${athlete.yt_handle})`);
        continue;
      }
      await saveToSupabase({
        athleteId: athlete.id,
        ytSubscribers: g.subscribers,
        ytAvgViews: g.avgViews,
      });
    }
  }

  console.log("🎉 YouTube scraping completado");
}

main();
