console.log("[v0] test start")
const res = await fetch("https://en.wikipedia.org/api/rest_v1/page/summary/Lamine_Yamal", {
  headers: { "user-agent": "SportsScope/1.0" },
})
console.log("[v0] status:", res.status)
console.log("[v0] test end")
