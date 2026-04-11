import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

function isConfigured(url: string | undefined, key: string | undefined) {
  if (!url || !key) return false;
  if (key === "SUPABASE_ANON_KEY" || key.trim() === "") return false;
  return true;
}

export function getSupabase(): SupabaseClient<Database> | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!isConfigured(url, anonKey)) return null;
  return createClient<Database>(url!, anonKey!);
}
