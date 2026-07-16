import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));
const SOURCE_EXTENSIONS = new Set([".js", ".jsx", ".mjs", ".ts", ".tsx"]);
const BLOCKING_SEVERITIES = new Set(["P1", "P2"]);

function lineAt(source, index) {
  return source.slice(0, index).split("\n").length;
}

function finding(severity, rule, message, file, line) {
  return { severity, rule, message, file: file.replaceAll("\\", "/"), line };
}

function inspectFunctionTransactions(sourceFile, file) {
  const results = [];
  const writeMethods = new Set([
    "create",
    "createMany",
    "delete",
    "deleteMany",
    "update",
    "updateMany",
    "upsert",
  ]);

  function inspect(node) {
    if (ts.isFunctionLike(node) && node.body) {
      const writes = [];
      let hasTransaction = false;
      let hasQueryBuilderWrite = false;

      function visitBody(child) {
        if (child !== node && ts.isFunctionLike(child)) return;
        if (ts.isCallExpression(child) && ts.isPropertyAccessExpression(child.expression)) {
          const method = child.expression.name.text;
          const receiver = child.expression.expression.getText(sourceFile);
          const callText = child.getText(sourceFile);
          if (
            method === "$transaction" ||
            /queryRunner\.(startTransaction|commitTransaction)/.test(callText)
          ) {
            hasTransaction = true;
          }
          if (writeMethods.has(method) && /(?:^|\.)prisma(?:\.|$)/i.test(receiver)) {
            writes.push(child);
          }
          if (
            ["insert", "update", "delete", "softDelete", "restore"].includes(method) &&
            /queryBuilder|createQueryBuilder/i.test(node.getText(sourceFile))
          ) {
            hasQueryBuilderWrite = true;
          }
        }
        ts.forEachChild(child, visitBody);
      }

      visitBody(node.body);
      if (writes.length >= 2 && !hasTransaction) {
        results.push(
          finding(
            "P2",
            "DB-MULTI-WRITE-TRANSACTION",
            "Multiple Prisma writes in one operation must be wrapped in prisma.$transaction().",
            file,
            sourceFile.getLineAndCharacterOfPosition(writes[0].getStart()).line + 1,
          ),
        );
      }
      if (hasQueryBuilderWrite && !hasTransaction) {
        results.push(
          finding(
            "P2",
            "DB-QUERY-BUILDER-TRANSACTION",
            "QueryBuilder write operations must run inside an explicit transaction.",
            file,
            sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1,
          ),
        );
      }
    }
    ts.forEachChild(node, inspect);
  }

  inspect(sourceFile);
  return results;
}

export function analyzeSource(source, file) {
  const results = [];
  const patternRules = [
    {
      severity: "P1",
      rule: "DB-UNSAFE-RAW-SQL",
      pattern: /\$(?:queryRawUnsafe|executeRawUnsafe)\s*\(/g,
      message:
        "Unsafe raw SQL APIs are forbidden; use parameterized queries or the ORM query builder.",
    },
    {
      severity: "P1",
      rule: "SEC-EVAL",
      pattern: /\beval\s*\(/g,
      message: "Dynamic eval() execution is forbidden.",
    },
    {
      severity: "P1",
      rule: "SEC-PRIVATE-KEY",
      pattern: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g,
      message: "A private key appears to be committed in source.",
    },
    {
      severity: "P2",
      rule: "DB-DESTRUCTIVE-SQL",
      pattern: /\b(?:DROP\s+(?:TABLE|DATABASE)|TRUNCATE\s+TABLE)\b/gi,
      message:
        "Destructive SQL requires an explicitly reviewed migration and must not appear in application code.",
    },
    {
      severity: "P3",
      rule: "MAINT-TODO",
      pattern: /\b(?:TODO|FIXME)\b/g,
      message: "Track TODO/FIXME work in an issue instead of leaving an unowned marker.",
    },
    {
      severity: "P3",
      rule: "OBS-CONSOLE",
      pattern: /\bconsole\.(?:log|debug)\s*\(/g,
      message: "Use the application logger so logs remain structured and redactable.",
    },
  ];

  for (const rule of patternRules) {
    for (const match of source.matchAll(rule.pattern)) {
      results.push(
        finding(rule.severity, rule.rule, rule.message, file, lineAt(source, match.index)),
      );
    }
  }

  const credentialPattern =
    /\b(?:apiKey|api_key|clientSecret|secret|accessToken|token|password)\b\s*[:=]\s*["'`]([^"'`\n]{8,})["'`]/gi;
  for (const match of source.matchAll(credentialPattern)) {
    const value = match[1];
    if (!/^(?:demo|test|example|replace|change|your-|<)/i.test(value)) {
      results.push(
        finding(
          "P1",
          "SEC-HARDCODED-CREDENTIAL",
          "A credential-like value is hardcoded; load it from the secret manager or environment.",
          file,
          lineAt(source, match.index),
        ),
      );
    }
  }

  if ([".ts", ".tsx", ".js", ".jsx"].includes(extname(file))) {
    const kind = file.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
    const sourceFile = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, kind);
    results.push(...inspectFunctionTransactions(sourceFile, file));
  }

  return results;
}

function collectFiles(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return collectFiles(path);
    return SOURCE_EXTENSIONS.has(extname(entry.name)) ? [path] : [];
  });
}

export function runQualityGate(root = ROOT) {
  const files = [join(root, "apps", "api", "src"), join(root, "apps", "web")]
    .flatMap(collectFiles)
    .filter((file) => !/[\\/](?:\.next|node_modules|dist)[\\/]/.test(file));
  const findings = files.flatMap((absolute) => {
    const file = relative(root, absolute);
    return analyzeSource(readFileSync(absolute, "utf8"), file);
  });
  const counts = { P1: 0, P2: 0, P3: 0 };
  for (const item of findings) {
    counts[item.severity] += 1;
    const command = BLOCKING_SEVERITIES.has(item.severity) ? "error" : "warning";
    console.log(
      `::${command} file=${item.file},line=${item.line},title=${item.severity} ${item.rule}::${item.message}`,
    );
    console.log(`${item.severity} ${item.rule} ${item.file}:${item.line} - ${item.message}`);
  }

  const reportDirectory = join(root, ".qa");
  mkdirSync(reportDirectory, { recursive: true });
  writeFileSync(
    join(reportDirectory, "quality-report.json"),
    `${JSON.stringify({ generatedAt: new Date().toISOString(), counts, findings }, null, 2)}\n`,
  );
  console.log(`Quality policy summary: P1=${counts.P1}, P2=${counts.P2}, P3=${counts.P3}`);
  return { findings, counts, blocked: counts.P1 + counts.P2 > 0 };
}

const invokedDirectly =
  process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) {
  const result = runQualityGate();
  process.exitCode = result.blocked ? 1 : 0;
}
