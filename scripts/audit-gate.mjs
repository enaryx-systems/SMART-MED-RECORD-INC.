import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";

const APPS = ["apps/api", "apps/web"];

// `pnpm audit --json` always reports every advisory in `metadata.vulnerabilities`,
// even ones muted via `auditConfig.ignoreGhsas` in pnpm-workspace.yaml — the mute
// only changes the command's exit code. So we run it twice: once unfiltered for
// the archived report and the P3 (moderate/low) warning count, and once at
// `--audit-level high` whose exit code and advisory list already respect the
// documented ignore list. Each ignored advisory carries a comment in that file
// explaining why it is accepted and what upstream bump would let us drop it.
function runAudit(dir, args) {
  try {
    const output = execFileSync("pnpm", ["audit", "--json", ...args], {
      cwd: dir,
      encoding: "utf8",
      shell: process.platform === "win32",
      stdio: ["ignore", "pipe", "pipe"],
    });
    return { report: JSON.parse(output), blocked: false };
  } catch (error) {
    const output = error.stdout?.toString();
    if (!output) throw error;
    return { report: JSON.parse(output), blocked: true };
  }
}

const audits = {};
let blockingCount = 0;
let p3Count = 0;

for (const dir of APPS) {
  const full = runAudit(dir, []);
  const blocking = runAudit(dir, ["--audit-level", "high"]);
  audits[dir] = full.report;

  const v = full.report.metadata?.vulnerabilities ?? {};
  p3Count += (v.moderate ?? 0) + (v.low ?? 0);
  blockingCount += Object.keys(blocking.report.advisories ?? {}).length;
  if (blocking.blocked && Object.keys(blocking.report.advisories ?? {}).length === 0) {
    // Non-zero exit with nothing left to report means an audit that could not
    // complete — treat that as blocking rather than silently passing.
    blockingCount += 1;
  }
}

mkdirSync(".qa", { recursive: true });
writeFileSync(".qa/dependency-audit.json", `${JSON.stringify(audits, null, 2)}\n`);

const annotation = blockingCount > 0 ? "error" : p3Count > 0 ? "warning" : "notice";
console.log(
  `::${annotation} title=Dependency severity summary::high/critical (after documented ignores)=${blockingCount}, moderate/low=${p3Count}`,
);
console.log(
  `Dependency audit summary: blocking=${blockingCount}, moderate/low=${p3Count} (see pnpm-workspace.yaml auditConfig for accepted advisories)`,
);
if (blockingCount > 0) process.exitCode = 1;
