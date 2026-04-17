import { config } from "dotenv";
config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ACTOR_ID = "zuzka_lipkova~twitter-profile-scraper";

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
  console.log(`🚀 Lanzando Apify X scraper para: ${uniqueHandles.join(", ")}`);

  const runRes = await fetch(`https://api.apify.com/v2/acts/${ACTOR_ID}/runs`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      handles: uniqueHandles,
      maxProfiles: uniqueHandles.length,
    }),
  });

  const run = await runRes.json();
  const runId = run.data?.id;

  if (!runId) {
    console.error("❌ Error lanzando actor X:", run);
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
    console.error(`❌ Run X falló con status: ${status}`);
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
  xFollowers: number | null;
}) {
  const today = isoToday();

  const { data: updated, error: updateError } = await supabase
    .from("social_metrics")
    .update({ x_followers: args.xFollowers })
    .eq("athlete_id", args.athleteId)
    .eq("date", today)
    .select("athlete_id");

  if (updateError) {
    console.error(`❌ Error actualizando X para ${args.athleteId}:`, updateError.message);
    return;
  }

  if (!updated || updated.length === 0) {
    const { error: insertError } = await supabase.from("social_metrics").insert({
      athlete_id: args.athleteId,
      date: today,
      x_followers: args.xFollowers,
    });
    if (insertError) {
      console.error(`❌ Error insertando X para ${args.athleteId}:`, insertError.message);
      return;
    }
  }

  console.log(`✅ X guardado — ${args.athleteId} — x_followers: ${args.xFollowers}`);
}

async function main() {
  const { data: athletes, error } = await supabase
    .from("athletes")
    .select("id, name, x_handle")
    .eq("is_active", true)
    .not("x_handle", "is", null);

  if (error || !athletes?.length) {
    console.log("⚠️  No hay atletas activos con x_handle.");
    return;
  }

  console.log(`📋 ${athletes.length} atletas activos con X handle`);

  const batchSize = 10;
  for (let i = 0; i < athletes.length; i += batchSize) {
    const batch = athletes.slice(i, i + batchSize) as {
      id: string;
      name: string;
      x_handle: string;
    }[];
    const handles = batch.map((a) => a.x_handle);

    const results = await runApifyActor(handles);
    if (!results) continue;

    console.log(`🔎 X results count: ${results?.length}`);

    const byHandle = new Map<string, { followers: number | null }>();
    for (const item of results as any[]) {
      const handle =
        item?.userName ?? item?.username ?? item?.handle ?? item?.screen_name;
      if (!handle) continue;
      const key = String(handle).toLowerCase();
      const followers =
        item?.followersCount ?? item?.followers_count ?? item?.followers ?? null;
      byHandle.set(key, { followers });
    }

    for (const athlete of batch) {
      const key = athlete.x_handle.toLowerCase();
      const g = byHandle.get(key);
      if (!g) {
        console.log(`⚠️  No data for ${athlete.name} (@${athlete.x_handle})`);
        continue;
      }
      await saveToSupabase({ athleteId: athlete.id, xFollowers: g.followers });
      console.log(`${athlete.name} — x_followers: ${g.followers}`);
    }
  }

  console.log("🎉 X scraping completado");
}

main();
