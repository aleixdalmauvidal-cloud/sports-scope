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
  const attempts = [
    `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(name + " footballer")}&format=json&origin=*`,
    `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(name + " football player")}&format=json&origin=*`,
    `https://es.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(name + " futbolista")}&format=json&origin=*`,
    `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(name)}&format=json&origin=*`,
  ];

  for (const searchUrl of attempts) {
    try {
      const searchRes = await fetch(searchUrl);
      const searchData = await searchRes.json();
      const pageTitle = searchData?.query?.search?.[0]?.title;
      if (!pageTitle) continue;

      const isSpanish = searchUrl.includes("es.wikipedia");
      const baseUrl = isSpanish ? "https://es.wikipedia.org" : "https://en.wikipedia.org";
      const contentUrl = `${baseUrl}/w/api.php?action=query&prop=extracts&exintro=false&explaintext=true&titles=${encodeURIComponent(pageTitle)}&format=json&origin=*`;
      const contentRes = await fetch(contentUrl);
      const contentData = await contentRes.json();
      const pages = contentData?.query?.pages ?? {};
      const page = Object.values(pages)[0] as any;
      const text = page?.extract ?? null;
      if (text && text.length > 500) return text;
    } catch {
      continue;
    }
  }
  return null;
}

function extractSponsorsFromText(text: string): string[] {
  const brandPatterns = [
    { pattern: /\bNike\b/gi, name: "Nike" },
    { pattern: /\bAdidas\b/gi, name: "Adidas" },
    { pattern: /\bPuma\b/gi, name: "Puma" },
    { pattern: /\bNew Balance\b/gi, name: "New Balance" },
    { pattern: /\bUnder Armour\b/gi, name: "Under Armour" },
    { pattern: /\bReebok\b/gi, name: "Reebok" },
    { pattern: /\bPepsi\b/gi, name: "Pepsi" },
    { pattern: /\bCoca.Cola\b/gi, name: "Coca-Cola" },
    { pattern: /\bGatorade\b/gi, name: "Gatorade" },
    { pattern: /\bRed Bull\b/gi, name: "Red Bull" },
    { pattern: /\bMonster Energy\b/gi, name: "Monster Energy" },
    { pattern: /\bLucozade\b/gi, name: "Lucozade" },
    { pattern: /\bEA Sports\b/gi, name: "EA Sports" },
    { pattern: /\bPlayStation\b/gi, name: "PlayStation" },
    { pattern: /\bXbox\b/gi, name: "Xbox" },
    { pattern: /\bKonami\b/gi, name: "Konami" },
    { pattern: /\bApple\b/gi, name: "Apple" },
    { pattern: /\bSamsung\b/gi, name: "Samsung" },
    { pattern: /\bHuawei\b/gi, name: "Huawei" },
    { pattern: /\bOppo\b/gi, name: "Oppo" },
    { pattern: /\bBeats\b/gi, name: "Beats" },
    { pattern: /\bBMW\b/gi, name: "BMW" },
    { pattern: /\bMercedes\b/gi, name: "Mercedes" },
    { pattern: /\bAudi\b/gi, name: "Audi" },
    { pattern: /\bVolkswagen\b/gi, name: "Volkswagen" },
    { pattern: /\bSeat\b/gi, name: "Seat" },
    { pattern: /\bHublot\b/gi, name: "Hublot" },
    { pattern: /\bRolex\b/gi, name: "Rolex" },
    { pattern: /\bTag Heuer\b/gi, name: "Tag Heuer" },
    { pattern: /\bArmani\b/gi, name: "Armani" },
    { pattern: /\bHugo Boss\b/gi, name: "Hugo Boss" },
    { pattern: /\bLouis Vuitton\b/gi, name: "Louis Vuitton" },
    { pattern: /\bGucci\b/gi, name: "Gucci" },
    { pattern: /\bBalenciaga\b/gi, name: "Balenciaga" },
    { pattern: /\bDior\b/gi, name: "Dior" },
    { pattern: /\bMastercard\b/gi, name: "Mastercard" },
    { pattern: /\bVisa\b/gi, name: "Visa" },
    { pattern: /\bSpotify\b/gi, name: "Spotify" },
    { pattern: /\bAmazon\b/gi, name: "Amazon" },
    { pattern: /\bGoogle\b/gi, name: "Google" },
    { pattern: /\bTikTok\b/gi, name: "TikTok" },
    { pattern: /\bLay.s\b/gi, name: "Lay's" },
    { pattern: /\bDoritos\b/gi, name: "Doritos" },
    { pattern: /\bMcDonald.s\b/gi, name: "McDonald's" },
    { pattern: /\bGillette\b/gi, name: "Gillette" },
    { pattern: /\bClear\b/gi, name: "Clear" },
    { pattern: /\bHead.*Shoulders\b/gi, name: "Head & Shoulders" },
    { pattern: /\bTopps\b/gi, name: "Topps" },
    { pattern: /\bPanini\b/gi, name: "Panini" },
    { pattern: /\bRakuten\b/gi, name: "Rakuten" },
    { pattern: /\bSocios\b/gi, name: "Socios" },
    { pattern: /\bBet365\b/gi, name: "Bet365" },
    { pattern: /\bWilliamHill\b/gi, name: "William Hill" },
    { pattern: /\bNike Football\b/gi, name: "Nike" },
    { pattern: /\bStandard Chartered\b/gi, name: "Standard Chartered" },
    { pattern: /\bFlydubai\b/gi, name: "Flydubai" },
    { pattern: /\bOreo\b/gi, name: "Oreo" },
    { pattern: /\bJacob.s Creek\b/gi, name: "Jacob's Creek" },
    { pattern: /\bVolvo\b/gi, name: "Volvo" },
    { pattern: /\bHelios\b/gi, name: "Helios" },
  ];

  const found: string[] = [];
  for (const { pattern, name } of brandPatterns) {
    pattern.lastIndex = 0;
    if (pattern.test(text)) {
      found.push(name);
    }
  }
  return [...new Set(found)];
}

async function saveToSupabase(athleteId: string, sponsors: string[]) {
  if (!sponsors.length) return;
  const today = isoToday();

  await supabase
    .from("campaign_signals")
    .upsert(
      {
        athlete_id: athleteId,
        date: today,
        wikipedia_sponsors: sponsors,
        brands_detected: sponsors.slice(0, 15),
        data_sources: ["wikipedia"],
      },
      { onConflict: "athlete_id,date" }
    );

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
