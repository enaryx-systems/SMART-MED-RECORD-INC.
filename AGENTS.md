# Smart Med AI review contract

These instructions apply to every file in this repository. Use them when an AI agent reviews a pull
request, a branch, staged changes, or a local diff.

## Review objective

Review only the changed code and the minimum surrounding code needed to verify it. Identify concrete,
actionable defects. P1 and P2 findings block approval. P3 findings are informational and must not
block approval or automatic merge.

Do not approve based only on formatting or successful compilation. Check behavior, security, privacy,
database atomicity, error paths, tests, and operational impact. Never invent a finding without a
specific file, line, failure scenario, and remediation.

## Severity policy

### P1 — blocking critical issue

- Credential, private key, access token, protected health information, or patient data exposure.
- Authentication or authorization bypass.
- SQL injection, unsafe raw SQL, arbitrary code execution, or a remotely exploitable vulnerability.
- Irrecoverable data loss, destructive migration without safeguards, or a likely production outage.
- Critical dependency vulnerability affecting the delivered application.

### P2 — blocking major issue

- Incorrect behavior on a supported path or a major regression.
- Multiple related database writes without an explicit transaction.
- QueryBuilder write operation outside an explicit transaction.
- Missing rollback/error handling that can leave partial or inconsistent data.
- High-severity dependency vulnerability.
- Failed build, test, typecheck, lint error, container build, or required quality check.
- Missing authorization, validation, audit logging, or tenant scoping on a sensitive operation.
- A changed behavior with no meaningful test when a regression is reasonably likely.

### P3 — non-blocking information

- Maintainability, naming, small performance improvements, TODO/FIXME markers, debug logging,
  unused code, image optimization, or moderate/low dependency advisories.
- P3 may be mentioned in a separate section, but the verdict remains approved when no P1/P2 exists.

## Database and query rules

- Prefer Prisma's typed client or a parameterized query builder.
- Forbid `$queryRawUnsafe`, `$executeRawUnsafe`, interpolated SQL strings, and concatenated SQL.
- Wrap two or more related writes in `prisma.$transaction()` or the equivalent ORM transaction.
- QueryBuilder insert, update, delete, soft-delete, and restore operations require an explicit
  transaction with rollback handling.
- Keep reads used to make a write decision inside the same transaction when concurrency can change
  the result.
- Validate ownership/tenant scope in the query; checking it only in the UI is insufficient.
- Migrations must be forward-safe and document rollback or recovery for destructive changes.
- A transaction is not proof of correctness: check idempotency, isolation, retry behavior, unique
  constraints, and side effects such as messages or object-storage writes.

## Medical-record security rules

- Treat medical records and case details as sensitive data. Do not log request bodies, document
  contents, credentials, tokens, or personal data.
- Require server-side authentication and role/tenant authorization for every sensitive endpoint.
- Validate input through DTO/schema validation and reject unexpected fields.
- Record auditable security-relevant actions without storing sensitive payloads in audit metadata.
- Do not expose internal errors, stack traces, storage keys, or database identifiers unnecessarily.
- Require encryption-capable managed services and secret-manager/environment configuration for
  production. Repository examples must contain placeholders only.

## Required review procedure

1. Determine the comparison range. For a pull request, compare the merge base with the PR head. For
   local work, review staged and unstaged changes separately.
2. Read every changed file and inspect callers, tests, schemas, migrations, authorization boundaries,
   and configuration affected by the change.
3. Run the automated gates from the repository root:

   ```bash
   npm ci
   npm run quality
   ```

4. If Docker is available, also run:

   ```bash
   docker build --file apps/api/Dockerfile --tag smart-med-api:review .
   docker build --file apps/web/Dockerfile --tag smart-med-web:review .
   ```

5. Inspect database changes manually even when the policy script passes. Static checks cannot prove
   transaction boundaries, authorization, migration safety, or concurrency correctness.
6. Confirm new behavior has focused tests for success, validation failure, authorization failure,
   and transaction rollback where applicable.
7. Report the verdict using the exact format below.

## Review output format

List findings first, ordered P1 then P2, and include P3 only in its non-blocking section.

```text
AI REVIEW VERDICT: BLOCKED | APPROVED

P1 BLOCKERS
- [P1][RULE-ID] path/to/file.ts:line — Problem and realistic impact. Fix: concrete remediation.

P2 BLOCKERS
- [P2][RULE-ID] path/to/file.ts:line — Problem and realistic impact. Fix: concrete remediation.

P3 NON-BLOCKING
- [P3][RULE-ID] path/to/file.ts:line — Optional improvement.

CHECKS
- npm run quality: PASS | FAIL | NOT RUN
- API container: PASS | FAIL | NOT RUN
- Web container: PASS | FAIL | NOT RUN

SUMMARY
- Blocking findings: <count>
- Non-blocking findings: <count>
- Residual risk or testing gap: <short statement>
```

Omit an empty severity list or write `None`. The verdict must be `BLOCKED` when any P1 or P2 exists or
a required check fails. The verdict must be `APPROVED` when there are no P1/P2 findings and required
checks pass; P3 findings alone never change it to blocked.

## Manual AI invocation prompt

Use this prompt with an AI coding agent from the repository root:

```text
Read AGENTS.md completely. Review the current pull request changes against its rules. Inspect the
merge-base diff and relevant surrounding code, run the required checks, and return only the defined
AI REVIEW VERDICT format. Do not modify code unless I explicitly ask you to fix the findings.
```

The executable policy remains in `scripts/quality-gate.mjs`, the CI implementation is in
`.github/workflows/quality-gate.yml`, and the detailed delivery model is in
`docs/devops/quality-gates.md`. Update all of them together when the severity policy changes.
