import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results: Array<
    | { step: string; status: "ok"; output: string }
    | { step: string; status: "error"; error: string }
  > = [];

  const steps = [
    "npx tsx scripts/sync-football-stats.ts",
    "npx tsx scripts/scrape-instagram.ts",
    "npx tsx scripts/scrape-tiktok.ts",
    "npx tsx scripts/calculate-cmv.ts --force",
  ];

  for (const step of steps) {
    try {
      const { stdout, stderr } = await execAsync(step, { timeout: 300000 });
      const combined = `${stdout ?? ""}${stderr ?? ""}`;
      results.push({
        step,
        status: "ok",
        output: combined.slice(-500),
      });
    } catch (error: any) {
      results.push({
        step,
        status: "error",
        error: error?.message ?? String(error),
      });
    }
  }

  return NextResponse.json({
    success: true,
    results,
    timestamp: new Date().toISOString(),
  });
}

