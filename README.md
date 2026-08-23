# Smart Med Records

A full-stack medico-legal record review platform with a public marketing site and role-aware client portal.

## Stack

- `apps/web`: Next.js, React, TypeScript, Tailwind CSS, TanStack Query, React Hook Form, Zod
- `apps/api`: NestJS, Prisma, PostgreSQL-ready data model, Swagger, Socket.IO-ready gateway
- Infrastructure templates: Docker and Nginx

## Run locally

Each app installs independently with pnpm (no top-level workspace) — see [CLAUDE.md](CLAUDE.md) for
the full repo-layout and conventions guide.

```bash
pnpm install                      # root tooling (lint/format/quality-gate)
pnpm --dir apps/api install
pnpm --dir apps/web install
copy apps\\api\\.env.example apps\\api\\.env
pnpm run db:generate
pnpm run db:migrate
pnpm run db:seed
pnpm run dev
```

Open `http://localhost:3000/portal/login`. Auth is real (JWT + bcrypt) — sign in with a seeded
account (see `apps/api/prisma/seed.ts`), role (`CLIENT`/`ADMIN`) comes from the account. The API
runs on `http://localhost:4000/api` and Swagger is at `http://localhost:4000/docs`.

## Branch and deployment workflow

- `development` is the base and Vercel production branch.
- Create every working branch from the latest `development` branch.
- Working branches run locally at `http://localhost:3000` and do not deploy to Vercel.
- Open pull requests back into `development`. The required quality gate runs before merge.
- Every commit merged into `development` is deployed automatically to the production Vercel URL.

Start a new branch and run it locally:

```bash
git switch development
git pull --ff-only origin development
git switch -c feature/short-description
pnpm run dev
```

In Vercel, import this repository with `apps/web` as the Root Directory and set the Production
environment's tracked branch to `development`. The branch deployment rule in
`apps/web/vercel.json` keeps all other branches local-only.

The portal has a resilient demo-data fallback when the API is offline. For production, replace the demo auth endpoint with Clerk/JWT verification, configure PostgreSQL and object storage, and enable the services listed in `.env.example`.

## Project structure and conventions

See [CLAUDE.md](CLAUDE.md) for the full repo layout, per-app commands, and code conventions
(NestJS module pattern, Prisma access, auth guards, frontend routing and state).
