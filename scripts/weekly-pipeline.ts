import { spawn } from "child_process";

function ts(): string {
  return new Date().toISOString();
}

type StepResult = {
  label: string;
  ok: boolean;
  exitCode: number | null;
  critical: boolean;
  error?: string;
};

function runStep(cmd: string[], label: string, critical: boolean): Promise<StepResult> {
  return new Promise((resolve) => {
    console.log(`[${ts()}] ▶️  Starting step: ${label}`);
    const child = spawn(cmd[0]!, cmd.slice(1), {
      stdio: "inherit",
      shell: process.platform === "win32",
    });

    child.on("exit", (code) => {
      if (code === 0) {
        console.log(`[${ts()}] ✅ Finished step: ${label} (exit ${code})`);
        resolve({ label, ok: true, exitCode: code, critical });
      } else {
        console.error(
          `[${ts()}] ❌ Step failed: ${label} (exit ${code}) — continuing with next step`
        );
        resolve({ label, ok: false, exitCode: code, critical });
      }
    });

    child.on("error", (err) => {
      console.error(`[${ts()}] ❌ Step error: ${label} — ${err?.message ?? String(err)}`);
      resolve({
        label,
        ok: false,
        exitCode: null,
        critical,
        error: err?.message ?? String(err),
      });
    });
  });
}

async function main() {
  console.log(`[${ts()}] 🚀 Weekly pipeline started`);

  const results: StepResult[] = [];
  results.push(
    await runStep(["npx", "tsx", "scripts/agent-sponsor-discovery.ts"], "agent-sponsor-discovery", false)
  );
  results.push(
    await runStep(["npx", "tsx", "scripts/agent-sponsor-valuation.ts"], "agent-sponsor-valuation", false)
  );
  results.push(
    await runStep(["npx", "tsx", "scripts/calculate-cmv.ts", "--force"], "calculate-cmv --force", true)
  );

  const criticalFailures = results.filter((step) => step.critical && !step.ok);
  const nonCriticalFailures = results.filter((step) => !step.critical && !step.ok);

  if (nonCriticalFailures.length > 0) {
    console.warn(
      `[${ts()}] ⚠️ Non-critical failures: ${nonCriticalFailures
        .map((step) => step.label)
        .join(", ")}`
    );
  }

  if (criticalFailures.length > 0) {
    console.error(
      `[${ts()}] ❌ Critical failures: ${criticalFailures
        .map((step) => step.label)
        .join(", ")}`
    );
    process.exit(1);
  }

  console.log(`[${ts()}] 🎉 Weekly pipeline finished`);
}

main().catch((err) => {
  console.error(`[${ts()}] ❌ Pipeline fatal error:`, err?.message ?? err);
  process.exit(1);
});
