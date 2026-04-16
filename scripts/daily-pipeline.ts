import { spawn } from "child_process";

function ts(): string {
  return new Date().toISOString();
}

function runStep(cmd: string[], label: string): Promise<void> {
  return new Promise((resolve) => {
    console.log(`[${ts()}] ▶️  Starting step: ${label}`);

    const child = spawn(cmd[0]!, cmd.slice(1), {
      stdio: "inherit",
      shell: process.platform === "win32",
    });

    child.on("exit", (code) => {
      if (code === 0) {
        console.log(`[${ts()}] ✅ Finished step: ${label} (exit ${code})`);
      } else {
        console.error(
          `[${ts()}] ❌ Step failed: ${label} (exit ${code}) — continuing with next step`
        );
      }
      resolve();
    });

    child.on("error", (err) => {
      console.error(
        `[${ts()}] ❌ Step error: ${label} — ${err?.message ?? String(err)}`
      );
      resolve();
    });
  });
}

async function main() {
  console.log(`[${ts()}] 🚀 Daily pipeline started`);

  await runStep(["npx", "tsx", "scripts/sync-football-stats.ts"], "sync-football-stats");
  await runStep(["npx", "tsx", "scripts/scrape-instagram.ts"], "scrape-instagram");
  await runStep(["npx", "tsx", "scripts/scrape-tiktok.ts"], "scrape-tiktok");
  await runStep(
    ["npx", "tsx", "scripts/calculate-cmv.ts", "--force"],
    "calculate-cmv --force"
  );

  console.log(`[${ts()}] 🎉 Daily pipeline finished`);
}

main().catch((err) => {
  console.error(`[${ts()}] ❌ Pipeline fatal error:`, err?.message ?? err);
  process.exit(1);
});

