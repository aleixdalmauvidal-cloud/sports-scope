// Downloads real photos of each footballer from Wikipedia's REST API.
// The /page/summary endpoint returns the main infobox image as `originalimage.source`.
// Saves them to /public/players/rank-{N}.jpg, matching getPlayerPhoto() in lib/mock-data.ts.

import fs from "node:fs/promises"
import path from "node:path"

// Map each rank (1-15) to the exact Wikipedia article title for that player.
const PLAYERS = [
  { rank: 1, title: "Lamine_Yamal" },
  { rank: 2, title: "Vin%C3%ADcius_J%C3%BAnior" }, // Vinícius Júnior
  { rank: 3, title: "Mohamed_Salah" },
  { rank: 4, title: "Raphinha" },
  { rank: 5, title: "Erling_Haaland" },
  { rank: 6, title: "Pedri" },
  { rank: 7, title: "Nico_Williams_(footballer,_born_2002)" },
  { rank: 8, title: "Robert_Lewandowski" },
  { rank: 9, title: "Phil_Foden" },
  { rank: 10, title: "Federico_Valverde" },
  { rank: 11, title: "Antoine_Griezmann" },
  { rank: 12, title: "Jude_Bellingham" },
  { rank: 13, title: "Viktor_Gy%C3%B6keres" }, // Viktor Gyökeres
  { rank: 14, title: "Kylian_Mbapp%C3%A9" }, // Kylian Mbappé
  { rank: 15, title: "Bryan_Mbeumo" },
]

const OUT_DIR = path.resolve(process.cwd(), "public", "players")

async function getImageUrl(title) {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${title}`
  const res = await fetch(url, {
    headers: {
      accept: "application/json",
      "user-agent": "SportsScope/1.0 (player photo downloader)",
    },
  })
  if (!res.ok) {
    throw new Error(`summary ${title}: ${res.status}`)
  }
  const data = await res.json()
  const src = data.originalimage?.source || data.thumbnail?.source
  if (!src) throw new Error(`No image for ${title}`)
  return src
}

async function downloadImage(url, outPath) {
  const res = await fetch(url, {
    headers: {
      "user-agent": "SportsScope/1.0 (player photo downloader)",
    },
  })
  if (!res.ok) throw new Error(`download ${url}: ${res.status}`)
  const buf = Buffer.from(await res.arrayBuffer())
  await fs.writeFile(outPath, buf)
  return buf.length
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true })
  for (const p of PLAYERS) {
    const outPath = path.join(OUT_DIR, `rank-${p.rank}.jpg`)
    try {
      const src = await getImageUrl(p.title)
      const bytes = await downloadImage(src, outPath)
      console.log(`[v0] rank-${p.rank} ${decodeURIComponent(p.title)} -> ${src} (${bytes} bytes)`)
    } catch (err) {
      console.log(`[v0] rank-${p.rank} ${p.title} FAILED: ${err.message}`)
    }
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
