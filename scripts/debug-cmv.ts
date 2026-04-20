import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/database";

dotenv.config({ path: ".env.local" });

const ATHLETE_ID = "a1000000-0000-0000-0000-000000000001";

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

  const { data: latestSocial, error: socialErr } = await supabase
    .from("social_metrics")
    .select("*")
    .eq("athlete_id", ATHLETE_ID)
    .order("date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (socialErr) throw socialErr;

  const { data: latestSports, error: sportsErr } = await supabase
    .from("sports_metrics")
    .select("*")
    .eq("athlete_id", ATHLETE_ID)
    .order("date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (sportsErr) throw sportsErr;

  const { data: latestCmv, error: cmvErr } = await supabase
    .from("cmv_scores")
    .select("*")
    .eq("athlete_id", ATHLETE_ID)
    .order("date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (cmvErr) throw cmvErr;

  console.log(
    "latest social_metrics:",
    JSON.stringify(latestSocial, null, 2)
  );
  console.log(
    "latest sports_metrics:",
    JSON.stringify(latestSports, null, 2)
  );
  console.log("latest cmv_scores:", JSON.stringify(latestCmv, null, 2));
}

main().catch(console.error);
