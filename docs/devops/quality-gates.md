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

On GitHub Pro/Team, protect `development` and require the `P1-P2 Gate Summary` status check. Require
pull requests, require conversation resolution, and block force pushes and deletion. Protect `main`
with the same settings plus one human approval, then use release pull requests from `development`.

On GitHub Free with a private repository, branch protection and native auto-merge are unavailable.
The `Development Auto Merge` workflow therefore waits for the exact pull request head commit to pass
the P1/P2 gate and then squash-merges it through the GitHub API. This does not prevent a repository
administrator from pushing directly; upgrading the plan or making the repository public is required
to enforce that boundary on GitHub.

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
