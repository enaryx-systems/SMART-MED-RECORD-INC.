## What changed

Describe the user or system outcome and link the related issue.

## Risk classification

- [ ] P1 — security, privacy, data loss, or production outage risk
- [ ] P2 — broken behavior, unsafe database operation, or major regression
- [ ] P3 — maintainability or low-impact improvement
- [ ] No known issue

## Quality checklist

- [ ] I ran `npm run quality` locally.
- [ ] Database multi-write operations use an explicit transaction.
- [ ] Queries are parameterized; no unsafe raw SQL API is used.
- [ ] Tests cover the changed behavior.
- [ ] No secrets, credentials, or patient data are included.
- [ ] Migration and rollback impact has been reviewed, if applicable.

## Verification evidence

List the commands, screenshots, or test cases used to verify this change.
