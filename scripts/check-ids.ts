import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/database";

dotenv.config({ path: ".env.local" });

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) {
    console.error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local"
    );
    process.exit(1);
  }

  const supabase = createClient<Database>(url, key);

  const { data: sportsSample, error: sportsErr } = await supabase
    .from("sports_metrics")
    .select("athlete_id")
    .limit(3);

  if (sportsErr) throw sportsErr;

  const { data: socialSample, error: socialErr } = await supabase
    .from("social_metrics")
    .select("athlete_id, ig_followers")
    .limit(3);

  if (socialErr) throw socialErr;

  console.log("sports_metrics sample (athlete_id):", sportsSample);
  console.log("social_metrics sample (athlete_id, ig_followers):", socialSample);

  const athleteIds = (sportsSample ?? [])
    .map((r) => r.athlete_id)
    .filter((id): id is string => Boolean(id));

  if (athleteIds.length === 0) {
    console.log("Match count: 0 (no sports athlete_ids in sample)");
    console.log("Matching social_metrics rows:", []);
    return;
  }

  const { data: matchingRows, error: matchErr } = await supabase
    .from("social_metrics")
    .select("athlete_id, ig_followers")
    .in("athlete_id", athleteIds);

  if (matchErr) throw matchErr;

  console.log("Match count:", matchingRows?.length ?? 0);
  console.log("Matching social_metrics rows:", matchingRows);
}

main().catch(console.error);
