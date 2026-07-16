# Smart Med Records

A full-stack medico-legal record review platform with a public marketing site and role-aware client portal.

## Stack

- `apps/web`: Next.js, React, TypeScript, Tailwind CSS, TanStack Query, React Hook Form, Zod
- `apps/api`: NestJS, Prisma, PostgreSQL-ready data model, Swagger, Socket.IO-ready gateway
- Infrastructure templates: Docker and Nginx

## Run locally

```bash
npm install
copy apps\\api\\.env.example apps\\api\\.env
npm run db:generate
npm run dev
```

Open `http://localhost:3000`. The demo login accepts any email and password (6+ characters); select a role on the login page. The API runs on `http://localhost:4000/api` and Swagger is at `http://localhost:4000/docs`.

Role-aware portal sections are available for attorney/client, case manager, physician, medical reviewer, billing specialist, and administrator users. Change the active demo role from the portal sidebar to inspect each permission set.

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
npm run dev
```

In Vercel, import this repository with `apps/web` as the Root Directory and set the Production
environment's tracked branch to `development`. The branch deployment rule in
`apps/web/vercel.json` keeps all other branches local-only.

The portal has a resilient demo-data fallback when the API is offline. For production, replace the demo auth endpoint with Clerk/JWT verification, configure PostgreSQL and object storage, and enable the services listed in `.env.example`.

## Project structure

```text
smart-med/
├─ apps/
│  ├─ web/                         # Next.js frontend
│  │  ├─ app/                     # Route entry points
│  │  │  ├─ (website)/            # Public website route group
│  │  │  │  ├─ page.tsx           # Homepage (/)
│  │  │  │  ├─ about/             # About page (/about)
│  │  │  │  ├─ contact/           # Contact page (/contact)
│  │  │  │  ├─ features/          # Resources page (/features)
│  │  │  │  └─ pricing/           # Pricing page (/pricing)
│  │  │  ├─ (portal)/             # Portal route group
│  │  │  │  ├─ login/             # Authentication page (/login)
│  │  │  │  └─ portal/            # Authenticated pages (/portal/*)
│  │  │  ├─ layout.tsx            # Shared root layout
│  │  │  └─ globals.css           # Shared design system
│  │  ├─ components/
│  │  │  ├─ app/                  # Root application providers
│  │  │  ├─ brand/                # Logo and brand components
│  │  │  ├─ portal/               # Portal shell, tables, headings, status UI
│  │  │  └─ website/              # Public header, footer, visual backgrounds
│  │  ├─ lib/
│  │  │  ├─ api/                  # Typed frontend API client
│  │  │  ├─ data/                 # Demo cases and service catalogs
│  │  │  └─ types/                # Shared frontend domain types
│  │  └─ public/images/
│  │     ├─ brand/                # Logos and brand-board assets
│  │     └─ website/              # Homepage and public-page imagery
│  └─ api/                         # NestJS backend
│     ├─ prisma/                  # Database schema
│     └─ src/
│        ├─ common/health/        # Cross-application health endpoint
│        └─ modules/
│           ├─ auth/              # Authentication controller and DTOs
│           ├─ cases/             # Cases controller, service, and module
│           ├─ dashboard/         # Dashboard aggregation endpoint
│           └─ services/          # Service catalog endpoint
├─ nginx/                         # Reverse-proxy configuration
├─ docker-compose.yml             # Local service orchestration
└─ .env.example                   # Documented environment variables
```

## Organization conventions

- Keep `app/**/page.tsx` focused on route composition; reusable UI belongs in `components`.
- Use `(website)` and `(portal)` route groups to keep public and authenticated routes separate without adding those folder names to URLs.
- Public website components and portal components stay separate.
- Images are referenced from `/images/brand/*` or `/images/website/*`.
- Frontend network calls live in `lib/api`; demo content lives in `lib/data`.
- Backend functionality is registered through feature modules rather than directly in `AppModule`.
- Add request validation classes beneath the owning backend module’s `dto` folder.
