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
        console.error(`[${ts()}] ❌ Step failed: ${label} (exit ${code}) — continuing`);
      }
      resolve();
    });
    child.on("error", (err) => {
      console.error(`[${ts()}] ❌ Step error: ${label} — ${err?.message ?? String(err)}`);
      resolve();
    });
  });
}

async function main() {
  console.log(`[${ts()}] 🚀 Weekly pipeline started`);
  await runStep(["npx", "tsx", "scripts/agent-sponsor-discovery.ts"], "agent-sponsor-discovery");
  await runStep(["npx", "tsx", "scripts/agent-sponsor-valuation.ts"], "agent-sponsor-valuation");
  console.log(`[${ts()}] 🎉 Weekly pipeline finished`);
}

main().catch((err) => {
  console.error(`[${ts()}] ❌ Pipeline fatal error:`, err?.message ?? err);
  process.exit(1);
});
