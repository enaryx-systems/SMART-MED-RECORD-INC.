import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";

let audit;
try {
  const output = execFileSync("npm", ["audit", "--json"], {
    encoding: "utf8",
    shell: process.platform === "win32",
    stdio: ["ignore", "pipe", "pipe"],
  });
  audit = JSON.parse(output);
} catch (error) {
  const output = error.stdout?.toString();
  if (!output) throw error;
  audit = JSON.parse(output);
}

const vulnerabilities = audit.metadata?.vulnerabilities ?? {};
const counts = {
  P1: vulnerabilities.critical ?? 0,
  P2: vulnerabilities.high ?? 0,
  P3: (vulnerabilities.moderate ?? 0) + (vulnerabilities.low ?? 0),
};

mkdirSync(".qa", { recursive: true });
writeFileSync(".qa/dependency-audit.json", `${JSON.stringify(audit, null, 2)}\n`);

const annotation = counts.P1 + counts.P2 > 0 ? "error" : counts.P3 > 0 ? "warning" : "notice";
console.log(
  `::${annotation} title=Dependency severity summary::P1 critical=${counts.P1}, P2 high=${counts.P2}, P3 moderate/low=${counts.P3}`,
);
console.log(`Dependency audit summary: P1=${counts.P1}, P2=${counts.P2}, P3=${counts.P3}`);
if (counts.P1 + counts.P2 > 0) process.exitCode = 1;
