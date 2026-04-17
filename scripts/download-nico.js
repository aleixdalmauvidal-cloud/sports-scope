import { writeFile, mkdir } from "node:fs/promises"
import { resolve, join } from "node:path"

const URL = "https://upload.wikimedia.org/wikipedia/commons/1/15/Nico_Williams_%28cropped%29.jpg"
const OUT_DIR = resolve(process.cwd(), "public", "players")

async function main() {
  await mkdir(OUT_DIR, { recursive: true })
  const res = await fetch(URL, {
    headers: {
      "user-agent": "SportsScopeDemo/1.0 (contact@sports-scope.vercel.app)",
      accept: "image/jpeg,image/png,image/*;q=0.9",
    },
  })
  if (!res.ok) {
    console.log(`[v0] FAIL HTTP ${res.status}`)
    return
  }
  const buf = Buffer.from(await res.arrayBuffer())
  await writeFile(join(OUT_DIR, "rank-7.jpg"), buf)
  console.log(`[v0] Nico Williams OK (${(buf.length / 1024).toFixed(0)} KB)`)
}

main()
