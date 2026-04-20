import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/database";

dotenv.config({ path: ".env.local" });

const PAGE_SIZE = 1000;

async function countDistinctSocialAthleteIds(
  supabase: ReturnType<typeof createClient<Database>>
): Promise<number> {
  const ids = new Set<string>();
  let offset = 0;
  for (;;) {
    const { data, error } = await supabase
      .from("social_metrics")
      .select("athlete_id")
      .range(offset, offset + PAGE_SIZE - 1);

    if (error) throw error;
    if (!data?.length) break;

    for (const row of data) {
      if (row.athlete_id) ids.add(row.athlete_id);
    }

    if (data.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }
  return ids.size;
}

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

  const { count: totalCmvScores, error: totalErr } = await supabase
    .from("cmv_scores")
    .select("*", { count: "exact", head: true });

  if (totalErr) throw totalErr;

  const { count: defaultSocialCount, error: defaultErr } = await supabase
    .from("cmv_scores")
    .select("*", { count: "exact", head: true })
    .eq("social_score", 20);

  if (defaultErr) throw defaultErr;

  const { count: socialAbove20Count, error: aboveErr } = await supabase
    .from("cmv_scores")
    .select("*", { count: "exact", head: true })
    .gt("social_score", 20);

  if (aboveErr) throw aboveErr;

  const distinctSocialAthletes = await countDistinctSocialAthleteIds(supabase);

  console.log("cmv_scores — total rows:", totalCmvScores ?? 0);
  console.log(
    "cmv_scores — rows with social_score = 20 (default):",
    defaultSocialCount ?? 0
  );
  console.log("cmv_scores — rows with social_score > 20:", socialAbove20Count ?? 0);
  console.log(
    "social_metrics — distinct athlete_id count:",
    distinctSocialAthletes
  );
}

main().catch(console.error);
