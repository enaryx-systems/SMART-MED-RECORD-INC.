# Contributing

Create feature and fix branches from `development`; do not push application changes directly to
`main`. Open a pull request back to `development`. GitHub performs the automated review and enables
squash auto-merge only when all P1/P2 gates pass.

## Local verification

```bash
npm ci
npm run quality
```

The same command set runs in GitHub Actions. A failed P1 or P2 check blocks merge. P3 findings are
reported as warnings and should be scheduled for cleanup, but they do not block the pull request.

## Database rules

- Prefer Prisma's typed client or a parameterized query builder.
- Never use `$queryRawUnsafe` or `$executeRawUnsafe`.
- Wrap operations containing two or more writes in `prisma.$transaction()`.
- Run QueryBuilder writes in an explicit transaction.
- Include forward and rollback considerations for schema migrations.

An exceptional suppression must be reviewed by the code owner and documented in the pull request;
do not weaken or bypass the checker in application code.
