import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

const METHOD_NOT_ALLOWED = { error: "Method Not Allowed. Use POST." };

function methodNotAllowed() {
  return NextResponse.json(METHOD_NOT_ALLOWED, {
    status: 405,
    headers: { Allow: "POST" },
  });
}

export async function GET() {
  return methodNotAllowed();
}

export async function PUT() {
  return methodNotAllowed();
}

export async function PATCH() {
  return methodNotAllowed();
}

export async function DELETE() {
  return methodNotAllowed();
}

export async function OPTIONS() {
  return methodNotAllowed();
}

export async function POST(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || cronSecret.length < 20) {
    return NextResponse.json(
      { error: "Server misconfiguration: CRON_SECRET missing or too short" },
      { status: 500 }
    );
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${cronSecret}`) {
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

  const failed = results.filter((result) => result.status === "error");
  if (failed.length > 0) {
    return NextResponse.json(
      {
        success: false,
        error: "One or more pipeline steps failed",
        failed,
        results,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    results,
    timestamp: new Date().toISOString(),
  });
}

