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

The portal has a resilient demo-data fallback when the API is offline. For production, replace the demo auth endpoint with Clerk/JWT verification, configure PostgreSQL and object storage, and enable the services listed in `.env.example`.
