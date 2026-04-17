// Download real player photos from Wikipedia Commons in parallel with a
// small stagger so the sandbox finishes within its time budget.
import { writeFile, mkdir } from "node:fs/promises"
import { resolve, join } from "node:path"

const PLAYERS = [
  { rank: 1, name: "Lamine Yamal", url: "https://upload.wikimedia.org/wikipedia/commons/e/e3/Lamine_Yamal_in_2025.jpg" },
  { rank: 2, name: "Vinicius Junior", url: "https://upload.wikimedia.org/wikipedia/commons/c/c6/2023_05_06_Final_de_la_Copa_del_Rey_-_52879242230_%28cropped%29.jpg" },
  { rank: 3, name: "Mohamed Salah", url: "https://upload.wikimedia.org/wikipedia/commons/4/4a/Mohamed_Salah_2018.jpg" },
  { rank: 4, name: "Raphinha", url: "https://upload.wikimedia.org/wikipedia/commons/5/5e/Raphael_Dias_Belloli_2023.jpg" },
  { rank: 5, name: "Erling Haaland", url: "https://upload.wikimedia.org/wikipedia/commons/7/71/Erling_Haaland_June_2025.jpg" },
  { rank: 6, name: "Pedri", url: "https://upload.wikimedia.org/wikipedia/commons/1/13/Pedri.jpg" },
  { rank: 7, name: "Nico Williams", url: "https://upload.wikimedia.org/wikipedia/commons/6/66/Nico_Williams_%28cropped%29.jpg" },
  { rank: 8, name: "Robert Lewandowski", url: "https://upload.wikimedia.org/wikipedia/commons/2/26/2019147183134_2019-05-27_Fussball_1.FC_Kaiserslautern_vs_FC_Bayern_M%C3%BCnchen_-_Sven_-_1D_X_MK_II_-_0228_-_B70I8527_%28cropped%29.jpg" },
  { rank: 9, name: "Phil Foden", url: "https://upload.wikimedia.org/wikipedia/commons/5/53/2023-10-04_Fu%C3%9Fball%2C_M%C3%A4nner%2C_UEFA_Champions_League%2C_RB_Leipzig_-_Manchester_City_FC_1DX_2613%2C_Phil_Foden.jpg" },
  { rank: 10, name: "Federico Valverde", url: "https://upload.wikimedia.org/wikipedia/commons/7/73/Federico_Valverde_2021_%28cropped%29.jpg" },
  { rank: 11, name: "Antoine Griezmann", url: "https://upload.wikimedia.org/wikipedia/commons/6/6e/FRA-ARG_%2810%29_%28cropped%29.jpg" },
  { rank: 12, name: "Jude Bellingham", url: "https://upload.wikimedia.org/wikipedia/commons/f/f9/25th_Laureus_World_Sports_Awards_-_Red_Carpet_-_Jude_Bellingham_-_240422_190551-2_%28cropped%29.jpg" },
  { rank: 13, name: "Viktor Gyokeres", url: "https://upload.wikimedia.org/wikipedia/commons/c/ce/Viktor_Gy%C3%B6keres_2018.jpg" },
  { rank: 14, name: "Kylian Mbappe", url: "https://upload.wikimedia.org/wikipedia/commons/6/66/Picture_with_Mbapp%C3%A9_%28cropped_and_rotated%29.jpg" },
  { rank: 15, name: "Bryan Mbeumo", url: "https://upload.wikimedia.org/wikipedia/commons/7/74/Bryan_Mbeumo_2018.jpg" },
]

const OUT_DIR = resolve(process.cwd(), "public", "players")
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function download(player) {
  const dest = join(OUT_DIR, `rank-${player.rank}.jpg`)
  try {
    const res = await fetch(player.url, {
      headers: {
        "user-agent": "SportsScopeDemo/1.0 (contact@sports-scope.vercel.app)",
        accept: "image/jpeg,image/png,image/*;q=0.9",
      },
    })
    if (!res.ok) {
      console.log(`[v0] rank-${player.rank} ${player.name} FAIL HTTP ${res.status}`)
      return { ok: false, player, status: res.status }
    }
    const buf = Buffer.from(await res.arrayBuffer())
    await writeFile(dest, buf)
    console.log(`[v0] rank-${player.rank} ${player.name} OK (${(buf.length / 1024).toFixed(0)} KB)`)
    return { ok: true, player }
  } catch (err) {
    console.log(`[v0] rank-${player.rank} ${player.name} ERROR ${err.message}`)
    return { ok: false, player, error: err.message }
  }
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true })

  // Launch all downloads in parallel with 150ms stagger between starts.
  const results = await Promise.all(
    PLAYERS.map(async (p, i) => {
      await sleep(i * 150)
      return download(p)
    })
  )

  const okCount = results.filter((r) => r.ok).length
  const failed = results.filter((r) => !r.ok)
  console.log(`\n[v0] First pass: ${okCount}/${PLAYERS.length} succeeded`)

  // Retry failed ones sequentially with 3s delay between each.
  if (failed.length) {
    console.log(`[v0] Retrying ${failed.length} failed downloads...`)
    for (const f of failed) {
      await sleep(3000)
      await download(f.player)
    }
  }

  console.log("[v0] DONE")
}

main()
