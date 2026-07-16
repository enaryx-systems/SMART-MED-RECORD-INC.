import assert from "node:assert/strict";
import test from "node:test";
import { analyzeSource } from "./quality-gate.mjs";

test("unsafe raw SQL is a blocking P1 finding", () => {
  const findings = analyzeSource("prisma.$queryRawUnsafe(sql);", "unsafe.ts");
  assert.equal(
    findings.some((item) => item.severity === "P1"),
    true,
  );
});

test("hardcoded credentials are a blocking P1 finding", () => {
  const findings = analyzeSource('const apiKey = "live-secret-value";', "secret.ts");
  assert.equal(
    findings.some((item) => item.rule === "SEC-HARDCODED-CREDENTIAL"),
    true,
  );
});

test("documented demo credentials remain allowed", () => {
  const findings = analyzeSource('const accessToken = "demo-token";', "demo.ts");
  assert.equal(
    findings.some((item) => item.rule === "SEC-HARDCODED-CREDENTIAL"),
    false,
  );
});

test("multiple Prisma writes require a transaction", () => {
  const findings = analyzeSource(
    `async function save() {
      await prisma.case.create({ data: {} });
      await prisma.auditLog.create({ data: {} });
    }`,
    "writes.ts",
  );
  assert.equal(
    findings.some((item) => item.rule === "DB-MULTI-WRITE-TRANSACTION"),
    true,
  );
});

test("multiple Prisma writes inside a transaction pass", () => {
  const findings = analyzeSource(
    `async function save() {
      await prisma.$transaction(async (tx) => {
        await tx.case.create({ data: {} });
        await tx.auditLog.create({ data: {} });
      });
    }`,
    "transaction.ts",
  );
  assert.equal(
    findings.some((item) => item.rule === "DB-MULTI-WRITE-TRANSACTION"),
    false,
  );
});

test("P3 findings do not imply a blocking policy", () => {
  const findings = analyzeSource("// TODO: replace demo", "todo.ts");
  assert.deepEqual(
    findings.map((item) => item.severity),
    ["P3"],
  );
});
