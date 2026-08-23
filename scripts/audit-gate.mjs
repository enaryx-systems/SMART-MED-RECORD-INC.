import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";

const APPS = ["apps/api", "apps/web"];

function runAudit(dir) {
  try {
    const output = execFileSync("pnpm", ["audit", "--json"], {
      cwd: dir,
      encoding: "utf8",
      shell: process.platform === "win32",
      stdio: ["ignore", "pipe", "pipe"],
    });
    return JSON.parse(output);
  } catch (error) {
    const output = error.stdout?.toString();
    if (!output) throw error;
    return JSON.parse(output);
  }
}

const audits = Object.fromEntries(APPS.map((dir) => [dir, runAudit(dir)]));

const counts = { P1: 0, P2: 0, P3: 0 };
for (const audit of Object.values(audits)) {
  const vulnerabilities = audit.metadata?.vulnerabilities ?? {};
  counts.P1 += vulnerabilities.critical ?? 0;
  counts.P2 += vulnerabilities.high ?? 0;
  counts.P3 += (vulnerabilities.moderate ?? 0) + (vulnerabilities.low ?? 0);
}

mkdirSync(".qa", { recursive: true });
writeFileSync(".qa/dependency-audit.json", `${JSON.stringify(audits, null, 2)}\n`);

const annotation = counts.P1 + counts.P2 > 0 ? "error" : counts.P3 > 0 ? "warning" : "notice";
console.log(
  `::${annotation} title=Dependency severity summary::P1 critical=${counts.P1}, P2 high=${counts.P2}, P3 moderate/low=${counts.P3}`,
);
console.log(`Dependency audit summary: P1=${counts.P1}, P2=${counts.P2}, P3=${counts.P3}`);
if (counts.P1 + counts.P2 > 0) process.exitCode = 1;
