import { config } from "dotenv";
config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Apify actor: https://apify.com/clockworks/tiktok-scraper
const ACTOR_ID = "clockworks~tiktok-scraper";

function getHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.APIFY_API_TOKEN}`,
  };
}

function isoToday(): string {
  return new Date().toISOString().split("T")[0]!;
}

async function runApifyActor(handles: string[]) {
  const uniqueHandles = [...new Set(handles.map((h) => h.trim()).filter(Boolean))];
  console.log(`🚀 Lanzando Apify TikTok para: ${uniqueHandles.join(", ")}`);

  const runRes = await fetch(`https://api.apify.com/v2/acts/${ACTOR_ID}/runs`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      profiles: uniqueHandles,
      resultsPerPage: 10,
    }),
  });

  const run = await runRes.json();
  const runId = run.data?.id;

  if (!runId) {
    console.error("❌ Error lanzando actor:", run);
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
    console.error(`❌ Run falló con status: ${status}`);
    return null;
  }

  const runInfoRes = await fetch(`https://api.apify.com/v2/actor-runs/${runId}`, {
    headers: getHeaders(),
  });
  const runInfo = await runInfoRes.json();
  const datasetId = runInfo.data.defaultDatasetId;

  const itemsRes = await fetch(`https://api.apify.com/v2/datasets/${datasetId}/items`, {
    headers: getHeaders(),
  });
  return await itemsRes.json();
}

function mean(nums: number[]): number | null {
  if (!nums.length) return null;
  const sum = nums.reduce((a, b) => a + b, 0);
  return Math.round(sum / nums.length);
}

async function saveToSupabase(args: {
  athleteId: string;
  ttFollowers: number | null;
  ttAvgViews: number | null;
}) {
  const today = isoToday();
  // UPDATE primero para no tocar otros campos (Instagram, etc).
  const { data: updated, error: updateError } = await supabase
    .from("social_metrics")
    .update({
      tt_followers: args.ttFollowers,
      tt_avg_views: args.ttAvgViews,
    })
    .eq("athlete_id", args.athleteId)
    .eq("date", today)
    .select("athlete_id");

  if (updateError) {
    console.error(`❌ Error actualizando ${args.athleteId}:`, updateError.message);
    return;
  }

  // Si no había fila hoy, insertamos solo los campos de TikTok (sin sobrescribir otros).
  if (!updated || updated.length === 0) {
    const { error: insertError } = await supabase.from("social_metrics").insert({
      athlete_id: args.athleteId,
      date: today,
      tt_followers: args.ttFollowers,
      tt_avg_views: args.ttAvgViews,
    });
    if (insertError) {
      console.error(`❌ Error insertando ${args.athleteId}:`, insertError.message);
      return;
    }
  }
}

async function main() {
  const { data: athletes, error } = await supabase
    .from("athletes")
    .select("id, name, instagram_handle, tiktok_handle")
    .eq("is_active", true);

  if (error || !athletes?.length) {
    console.log("⚠️  No hay atletas activos.");
    return;
  }

  const withHandle = athletes
    .map((a: any) => {
      const handle = (a.tiktok_handle ?? a.instagram_handle ?? "").trim();
      return handle
        ? {
            id: a.id as string,
            name: a.name as string,
            handle,
          }
        : null;
    })
    .filter(Boolean) as { id: string; name: string; handle: string }[];

  if (withHandle.length === 0) {
    console.log("⚠️  No hay atletas activos con tiktok_handle ni instagram_handle (fallback).");
    return;
  }

  console.log(`📋 ${withHandle.length} atletas activos con handle TikTok (o fallback Instagram)`);

  const batchSize = 10;
  for (let i = 0; i < withHandle.length; i += batchSize) {
    const rawBatch = withHandle.slice(i, i + batchSize);
    const uniqueBatchByHandle = new Map<string, (typeof rawBatch)[number]>();
    for (const a of rawBatch) {
      const key = a.handle.toLowerCase();
      if (!uniqueBatchByHandle.has(key)) uniqueBatchByHandle.set(key, a);
    }
    const batch = [...uniqueBatchByHandle.values()];
    const handles = batch.map((a) => a.handle);

    const results = await runApifyActor(handles);
    if (!results) continue;

    console.log("🔎 TikTok results count:", results?.length);
    if (results?.length > 0) {
      console.log("🔎 authorMeta keys:", Object.keys(results[0].authorMeta ?? {}));
      console.log(
        "🔎 authorMeta sample:",
        JSON.stringify(results[0].authorMeta ?? {}).slice(0, 800)
      );
      console.log(
        "🔎 top level keys besides authorMeta:",
        Object.keys(results[0]).filter((k) => k !== "authorMeta")
      );
      if (results[0].input) console.log("🔎 input:", JSON.stringify(results[0].input));
      if (results[0].note) console.log("🔎 note:", JSON.stringify(results[0].note));

      // También muestra si hay playCount en el item
      console.log("🔎 playCount fields:", {
        playCount: results[0].playCount,
        plays: results[0].plays,
        diggCount: results[0].diggCount,
        shareCount: results[0].shareCount,
        commentCount: results[0].commentCount,
      });
    }

    // Este actor devuelve datos por perfil (followersCount y posts con playCount).
    const byHandle = new Map<string, { plays: number[]; followers: number | null }>();
    for (const item of results as any[]) {
      const handle = item?.authorMeta?.name ?? item?.input;
      if (!handle) continue;
      const key = String(handle).toLowerCase();

      const followers = item?.authorMeta?.fans ?? null;
      const note = item?.note ?? "";
      const noteLc = String(note).toLowerCase();
      if (
        noteLc.includes("private") ||
        noteLc.includes("no videos") ||
        noteLc.includes("login wall")
      ) {
        console.warn(`⚠️  TikTok warning for ${handle}: ${note}`);
      }

      // Este actor nos devuelve perfiles; no hay playCount de posts aquí.
      byHandle.set(key, { plays: [], followers });
    }

    for (const athlete of batch) {
      const key = athlete.handle.toLowerCase();
      const g = byHandle.get(key);
      if (!g) continue;
      const ttAvgViews = null;
      await saveToSupabase({
        athleteId: athlete.id,
        ttFollowers: g.followers,
        ttAvgViews,
      });
      console.log(`${athlete.name} — tt_followers: ${g.followers} — tt_avg_views: ${ttAvgViews}`);
    }
  }

  console.log("🎉 TikTok scraping completado");
}

main();

