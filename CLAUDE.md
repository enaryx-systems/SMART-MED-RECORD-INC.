# Smart Med Records — repository guide

This file documents the repo layout, per-app commands, and conventions for anyone (human or AI
agent) working across the codebase. For PR-review rules and severity policy, see [AGENTS.md](AGENTS.md).

## Repository layout

Two independent apps, each installed and run on its own — there is no top-level package manager
tying them together. Always `cd`/`pnpm --dir` into the relevant app before running its commands.

| Path | Stack | Port | Role |
| ---- | ----- | ---- | ---- |
| [apps/api/](apps/api/) | NestJS 11 + Prisma 6 + JWT (bcryptjs) | 4000 | REST API, auth, RBAC, domain logic. Owner of the database schema. |
| [apps/web/](apps/web/) | Next.js 15 (App Router) + React 19 + TanStack Query + Redux Toolkit (UI state only) + Tailwind 3 | 3000 | Public marketing site + client/admin portal. |

The root `package.json` is its own independent pnpm install too — it owns repo-wide tooling
(ESLint, Prettier, the P1/P2 quality-gate scripts) that spans both apps, plus convenience scripts
that shell into each app. It is **not** an npm/pnpm workspace root.

`apps/web` itself carries two clearly separated areas, split consistently across `app/`,
`components/`, and `lib/`:

| Area | Routes | Components | Notes |
| ---- | ------ | ----------- | ----- |
| **Website** (public marketing) | `app/(website)/` — a route group, so it adds no path segment (`/`, `/about`, `/contact`, `/features`, `/pricing`) | `components/website/` (header, footer, hero backdrop) | Static content; `lib/data/services.ts` holds its service-catalog copy. |
| **Portal** (authenticated app) | `app/portal/` — a real folder, so `/portal/login`, `/portal/dashboard`, etc. are real paths | `components/portal/` (sidebar, header, stat cards, charts) | Backed by the API; auth-gated in `app/portal/layout.tsx`. |

Shared across both: `components/app/` (root providers), `components/brand/` (logo), and the
function-scoped `lib/{api,auth,types}/` (network client, session storage, shared domain types).
Never import portal-only code (e.g. `lib/auth/session.ts`, anything under `components/portal/`)
from a website page, or vice versa — the two areas should stay independently deletable.

## Common commands

### Root (repo-wide tooling)

```bash
pnpm install                # root devDependencies only (eslint, prettier, quality-gate scripts)
pnpm run dev                 # runs both apps concurrently (shells into each app's own pnpm)
pnpm run build                # apps/api build, then apps/web build
pnpm run lint / lint:fix       # eslint.config.mjs covers apps/api/**/*.ts and apps/web/**/*.{ts,tsx}
pnpm run format / format:check  # prettier across the repo
pnpm run typecheck             # tsc --noEmit in each app, via `pnpm --dir <app> exec tsc`
pnpm run quality               # the full local gate (mirrors CI's required checks)
pnpm run db:generate / db:migrate / db:seed   # shells into apps/api's own prisma scripts
```

### `apps/api/` (pnpm)

```bash
pnpm install
pnpm run start:dev        # nest start --watch
pnpm run build             # nest build
pnpm run prisma:generate / prisma:migrate / prisma:seed
```

### `apps/web/` (pnpm)

```bash
pnpm install
pnpm run dev     # next dev
pnpm run build    # next build (output: standalone)
```

## Conventions

- **NestJS modules are feature-scoped**, one per domain (`modules/auth/`, `modules/cases/`), each
  following `*.module.ts` / `*.controller.ts` / `*.service.ts` / `dto/*.dto.ts`. Add new backend
  functionality as a new module registered in [app.module.ts](apps/api/src/app.module.ts) rather
  than growing an existing one.
- **Database access** goes through `PrismaService` ([common/prisma/prisma.service.ts](apps/api/src/common/prisma/prisma.service.ts)),
  a global provider. The generated client is the standard `@prisma/client` (no custom output path).
- **Auth**: JWT bearer tokens (`@nestjs/jwt` + `passport-jwt`), issued by `POST /api/auth/login`
  ([modules/auth/auth.service.ts](apps/api/src/modules/auth/auth.service.ts)). A global
  `JwtAuthGuard` + `RolesGuard` protect every route by default — opt out with `@Public()`
  ([common/auth/public.decorator.ts](apps/api/src/common/auth/public.decorator.ts)), restrict by
  role with `@Roles(Role.ADMIN)`, and read the authenticated user with `@CurrentUser()`.
- **Multi-tenancy & roles**: every `User` and `Case` belongs to an `Organization`
  (`apps/api/prisma/schema.prisma`). Client-side users (`Role.CLIENT`) belong to one law-firm
  `Organization` and only ever see that firm's cases/invoices — this is how "team seats" work,
  multiple users at the same firm share visibility into the firm's cases. All internal staff
  (`ADMIN`, `REVIEWER`, `BILLING`) belong to a single seeded `INTERNAL` organization. Four roles:
  `CLIENT` (own org's cases only), `ADMIN` (everything, manages organizations/users/assignment),
  `REVIEWER` (only cases assigned to them via `Case.assignedReviewerId`, updates status, uploads
  deliverables), `BILLING` (invoices + a minimal case picker — no case documents/comments/content).
  RBAC is enforced server-side per endpoint; the frontend route guard in
  [app/portal/layout.tsx](apps/web/app/portal/layout.tsx) (role → URL prefix) is a UX convenience
  only, not the security boundary.
- **Frontend routing**: the portal lives under `app/portal/` as a real folder (not a Next.js route
  group), so `/portal/login`, `/portal/dashboard`, etc. are real URL paths. The public marketing
  site lives under `app/(website)/`.
- **Frontend data**: server state (cases, stats) goes through TanStack Query, calling the typed
  wrapper in [lib/api/client.ts](apps/web/lib/api/client.ts) (attaches the JWT as an
  `Authorization: Bearer` header from [lib/auth/session.ts](apps/web/lib/auth/session.ts)).
  **UI-only state** (currently: sidebar expand/collapse) goes through Redux Toolkit
  ([redux/store.ts](apps/web/redux/store.ts), [redux/uiSlice.ts](apps/web/redux/uiSlice.ts)) — Redux
  never holds session/user data; that stays in `lib/auth/session.ts` (JWT in `localStorage`, read
  via `getSession()`).
- **Portal UI**: shared pieces (sidebar, header, stat cards, charts) live in
  [components/portal/](apps/web/components/portal/); brand assets/logo in
  [components/brand/](apps/web/components/brand/).

## Database

- One PostgreSQL database, owned by `apps/api/prisma/schema.prisma`. Any schema change **must**
  ship a migration under `apps/api/prisma/migrations/` (`pnpm run db:migrate` from `apps/api/`,
  or `pnpm run db:migrate` from the root). Never `prisma db push` outside local scratch work.
- `apps/api/prisma/seed.ts` seeds an internal organization (`ADMIN`, `REVIEWER`, `BILLING` demo
  accounts) plus two client-firm organizations (each with two `CLIENT` demo accounts, to
  demonstrate shared team-seat visibility), sample cases across every `CaseStatus`, and a couple of
  sample invoices/timeline events.

## Deployment

- `apps/web` auto-deploys via **Vercel's own git integration** on pushes to `development`
  (`apps/web/vercel.json` restricts branch deploys to `development`; see the root `README.md`'s
  branch workflow section). There is no custom build/deploy GitHub Action for it — Vercel handles
  build and deploy itself once the repo is imported with `apps/web` as the Root Directory.
- **`apps/api` currently has no production host.** `apps/api/Dockerfile` and the root
  `docker-compose.yml` exist for local/self-hosted use, but there is no CI deploy step and no
  cloud target configured. Treat this as a known gap, not an oversight — don't invent Kubernetes
  manifests or cloud credentials that don't exist for this project.
- CI (`.github/workflows/quality-gate.yml`) covers policy checks, lint/typecheck, build, dependency
  audit, and a Docker image build + Trivy vulnerability scan (HIGH/CRITICAL fails the build) for
  both apps — but stops at "image builds and is scanned," not "image is pushed and deployed."

## Further reading

- [AGENTS.md](AGENTS.md) — AI PR-review contract (severity policy, database/security rules, review
  procedure and output format).
- [CONTRIBUTING.md](CONTRIBUTING.md) — branch workflow and local verification steps.
