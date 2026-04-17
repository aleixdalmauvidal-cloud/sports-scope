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

async function fetchWikipediaText(name: string): Promise<string | null> {
  try {
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(name + " footballer")}&format=json&origin=*`;
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();
    const pageTitle = searchData?.query?.search?.[0]?.title;
    if (!pageTitle) return null;

    const contentUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro=false&explaintext=true&titles=${encodeURIComponent(pageTitle)}&format=json&origin=*`;
    const contentRes = await fetch(contentUrl);
    const contentData = await contentRes.json();
    const pages = contentData?.query?.pages ?? {};
    const page = Object.values(pages)[0] as any;
    return page?.extract ?? null;
  } catch (e) {
    return null;
  }
}

function extractSponsorsFromText(text: string): string[] {
  const sponsors: string[] = [];

  const brandPatterns = [
    /Nike/gi, /Adidas/gi, /Puma/gi, /New Balance/gi, /Under Armour/gi,
    /Pepsi/gi, /Coca-Cola/gi, /Gatorade/gi, /Red Bull/gi, /Monster/gi,
    /EA Sports/gi, /PlayStation/gi, /Xbox/gi, /Apple/gi, /Samsung/gi,
    /BMW/gi, /Mercedes/gi, /Audi/gi, /Volkswagen/gi,
    /Beats/gi, /Hublot/gi, /Rolex/gi, /Armani/gi, /Hugo Boss/gi,
    /Louis Vuitton/gi, /Gucci/gi, /Balenciaga/gi,
    /Lay's/gi, /Doritos/gi, /McDonald's/gi, /KFC/gi,
    /Mastercard/gi, /Visa/gi, /American Express/gi,
    /Spotify/gi, /Amazon/gi, /Google/gi, /Huawei/gi,
    /Clear/gi, /Head & Shoulders/gi, /Gillette/gi,
    /Konami/gi, /Topps/gi, /Panini/gi,
    /Standard Chartered/gi, /Rakuten/gi, /Socios/gi,
  ];

  const endorsementSections = [
    /endorsement[s]?.*?(?=\n\n|\n==)/gis,
    /sponsor[s]?.*?(?=\n\n|\n==)/gis,
    /commercial.*?(?=\n\n|\n==)/gis,
    /personal life.*?(?=\n\n|\n==)/gis,
    /off.?pitch.*?(?=\n\n|\n==)/gis,
  ];

  let relevantText = text;
  for (const sectionPattern of endorsementSections) {
    const matches = text.match(sectionPattern);
    if (matches?.length) {
      relevantText = matches.join(" ");
      break;
    }
  }

  for (const pattern of brandPatterns) {
    if (pattern.test(relevantText)) {
      const brandName = pattern.source.replace(/\\/g, "");
      sponsors.push(brandName);
    }
  }

  return [...new Set(sponsors)];
}

async function saveToSupabase(athleteId: string, sponsors: string[]) {
  if (!sponsors.length) return;
  const today = isoToday();

  const { data: existing } = await supabase
    .from("campaign_signals")
    .select("id, wikipedia_sponsors, brands_detected")
    .eq("athlete_id", athleteId)
    .eq("date", today)
    .single();

  if (existing) {
    const mergedWiki = Array.from(new Set([
      ...((existing.wikipedia_sponsors as string[]) ?? []),
      ...sponsors,
    ]));

    const mergedBrands = Array.from(new Set([
      ...((existing.brands_detected as string[]) ?? []),
      ...sponsors,
    ])).slice(0, 15);

    await supabase
      .from("campaign_signals")
      .update({
        wikipedia_sponsors: mergedWiki,
        brands_detected: mergedBrands,
        data_sources: ["instagram", "wikipedia"],
      })
      .eq("athlete_id", athleteId)
      .eq("date", today);
  } else {
    await supabase
      .from("campaign_signals")
      .insert({
        athlete_id: athleteId,
        date: today,
        wikipedia_sponsors: sponsors,
        brands_detected: sponsors,
        data_sources: ["wikipedia"],
      });
  }

  console.log(`✅ Wikipedia guardado — ${athleteId} — ${sponsors.length} sponsors`);
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

  for (const athlete of athletes as { id: string; name: string }[]) {
    process.stdout.write(`[wikipedia] ${athlete.name}… `);

    const text = await fetchWikipediaText(athlete.name);
    if (!text) {
      console.log("no Wikipedia page found");
      await new Promise(r => setTimeout(r, 1000));
      continue;
    }

    const sponsors = extractSponsorsFromText(text);
    if (sponsors.length > 0) {
      await saveToSupabase(athlete.id, sponsors);
      console.log(`${sponsors.length} sponsors: ${sponsors.join(", ")}`);
    } else {
      console.log("no sponsors found in text");
    }

    await new Promise(r => setTimeout(r, 1500));
  }

  console.log("🎉 Wikipedia scraping completado");
}

main();
