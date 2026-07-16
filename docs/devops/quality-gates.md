# DevOps quality gates

## Delivery flow

```text
feature/* or fix/*
        |
        v
pull request -> development -> automated P1/P2 review -> squash auto-merge
                                      |
                                      +-- failure: annotations + PR comment/CI issue
                                      +-- success: merge enabled

development -> release pull request -> main
```

Every push to `development` or `main`, and every pull request targeting either branch, runs the
`Quality Gate` workflow.

## Severity policy

| Severity | Examples                                                                                         | Result       |
| -------- | ------------------------------------------------------------------------------------------------ | ------------ |
| P1       | committed private key, unsafe raw SQL, critical dependency vulnerability                         | Blocks merge |
| P2       | high dependency vulnerability, failed build/test/lint, multi-write operation without transaction | Blocks merge |
| P3       | TODO marker, unstructured debug logging, moderate/low dependency vulnerability                   | Warning only |

The policy engine writes `.qa/quality-report.json`; the dependency gate writes
`.qa/dependency-audit.json`. GitHub uploads both for 14 days. Failed pull requests receive one
continuously updated review comment. Failed branch pushes create or update a GitHub issue and a later
successful run closes it.

## Required repository settings

Protect `development` and require the `P1-P2 Gate Summary` status check. Require pull requests,
require conversation resolution, block force pushes and deletion, and enable squash auto-merge.
Protect `main` with the same settings and use release pull requests from `development`.

Auto-merge intentionally does not approve its own code. It is an automated review decision based on
the required checks. Add a human approval requirement later for production releases to `main`.

## Commands

```bash
npm run quality:policy  # custom P1/P2/P3 source and database rules
npm run audit:ci        # dependency severity policy
npm run quality         # complete local gate
```

Update `.github/quality-policy.yml`, the policy tests, and this document together when governance
changes. Do not reduce a blocking rule merely to make a pull request pass.
