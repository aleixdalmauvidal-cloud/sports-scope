// Downloads real photos of each footballer from Wikipedia REST API.
// Uses delays + exponential backoff to handle 429 rate limits.

import { mkdir, writeFile } from "node:fs/promises"
import { resolve, join } from "node:path"

const PLAYERS = [
  { rank: 1, title: "Lamine_Yamal" },
  { rank: 2, title: "Vin%C3%ADcius_J%C3%BAnior" },
  { rank: 3, title: "Mohamed_Salah" },
  { rank: 4, title: "Raphinha" },
  { rank: 5, title: "Erling_Haaland" },
  { rank: 6, title: "Pedri" },
  {
    rank: 7,
    title: "Nico_Williams_(footballer,_born_2002)",
    fallback: "https://upload.wikimedia.org/wikipedia/commons/6/6d/Nico_Williams_2023.jpg",
  },
  { rank: 8, title: "Robert_Lewandowski" },
  { rank: 9, title: "Phil_Foden" },
  { rank: 10, title: "Federico_Valverde" },
  { rank: 11, title: "Antoine_Griezmann" },
  { rank: 12, title: "Jude_Bellingham" },
  { rank: 13, title: "Viktor_Gy%C3%B6keres" },
  { rank: 14, title: "Kylian_Mbapp%C3%A9" },
  { rank: 15, title: "Bryan_Mbeumo" },
]

const OUT_DIR = resolve(process.cwd(), "public", "players")
const UA = "SportsScope/1.0 player-photo-downloader"

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function fetchWithRetry(url, label, maxRetries = 5) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { "user-agent": UA, accept: "application/json,image/*,*/*" },
      })
      if (res.ok) return res
      if (res.status === 429 || res.status === 503) {
        const wait = 4000 * Math.pow(2, attempt)
        console.log(`[v0] ${res.status} on ${label} — retry ${attempt + 1}/${maxRetries} in ${Math.round(wait / 1000)}s`)
        await sleep(wait)
        continue
      }
      throw new Error(`${label}: HTTP ${res.status}`)
    } catch (err) {
      if (attempt === maxRetries - 1) throw err
      await sleep(2000)
    }
  }
  throw new Error(`${label}: retries exhausted`)
}

async function getImageUrl(title) {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${title}`
  const res = await fetchWithRetry(url, `summary ${title}`)
  const data = await res.json()
  const src = data.originalimage?.source || data.thumbnail?.source
  if (!src) throw new Error(`No image field for ${title}`)
  return src
}

async function downloadImage(url, outPath) {
  const res = await fetchWithRetry(url, `image ${url.split("/").pop()}`)
  const buf = Buffer.from(await res.arrayBuffer())
  await writeFile(outPath, buf)
  return buf.length
}

async function processPlayer(p) {
  const outPath = join(OUT_DIR, `rank-${p.rank}.jpg`)
  let src
  try {
    src = await getImageUrl(p.title)
  } catch (err) {
    if (p.fallback) {
      console.log(`[v0] rank-${p.rank} summary failed, using fallback`)
      src = p.fallback
    } else {
      throw err
    }
  }
  const bytes = await downloadImage(src, outPath)
  return { src, bytes }
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true })
  const failed = []

  for (const p of PLAYERS) {
    try {
      const { src, bytes } = await processPlayer(p)
      console.log(`[v0] rank-${p.rank} ${decodeURIComponent(p.title)} OK (${bytes} bytes) ${src}`)
    } catch (err) {
      console.log(`[v0] rank-${p.rank} ${decodeURIComponent(p.title)} FAILED: ${err.message}`)
      failed.push(p)
    }
    await sleep(2000)
  }

  if (failed.length > 0) {
    console.log(`\n[v0] Retrying ${failed.length} failed players after 15s pause...`)
    await sleep(15000)
    for (const p of failed) {
      try {
        const { bytes } = await processPlayer(p)
        console.log(`[v0] RETRY rank-${p.rank} OK (${bytes} bytes)`)
      } catch (err) {
        console.log(`[v0] RETRY rank-${p.rank} STILL FAILED: ${err.message}`)
      }
      await sleep(3000)
    }
  }
}

main().catch((e) => {
  console.error("[v0] fatal error:", e.message)
  process.exit(1)
})
