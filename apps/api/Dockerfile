FROM node:22-alpine AS build
RUN npm install -g pnpm
WORKDIR /app/apps/api
# The build stage only compiles — it never launches a browser — so skip
# Puppeteer's own Chromium download here; the runtime stage below installs
# Alpine's chromium package and points Puppeteer at it instead.
ENV PUPPETEER_SKIP_DOWNLOAD=true
COPY apps/api/package.json apps/api/pnpm-lock.yaml apps/api/pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY apps/api .
RUN pnpm run prisma:generate
RUN pnpm run build
# Strip everything the compiled dist/main never imports before the runtime
# stage copies node_modules:
#  --prod         drops devDependencies (ts-node, @nestjs/cli, typescript, ...)
#  --no-optional  drops the `prisma` CLI, which @prisma/client pulls back in as
#                 an optionalDependency — it (via @prisma/config) is the only
#                 path deepmerge-ts (CVE-2026-40345, HIGH) reaches this image.
# The generated .prisma/client and @prisma/client runtime stay put; migrations
# are never run from this container (CMD is `node dist/main`).
RUN pnpm prune --prod --no-optional
# Fail the build here (not at container start) if the prune removed something
# the generated Prisma client needs to load.
RUN node -e "if (typeof require('@prisma/client').PrismaClient !== 'function') process.exit(1); console.log('prisma client OK')"

FROM node:22-alpine
# apk upgrade pulls in patched OS packages (e.g. libssl3/libcrypto3) released
# after this base image tag was built. The rm afterward drops node:22-alpine's
# bundled npm/corepack — this image only ever runs `node dist/main`, so their
# transitive CVEs (tar, sigstore, pacote, ...) are dead weight, not an attack
# surface; Trivy's image scan still flags them if left in place.
RUN apk upgrade --no-cache \
  && apk add --no-cache chromium nss freetype harfbuzz ca-certificates ttf-freefont \
  && rm -rf /usr/local/lib/node_modules/npm /usr/local/lib/node_modules/corepack \
    /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/corepack
WORKDIR /app/apps/api
ENV NODE_ENV=production
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
COPY --from=build /app/apps/api/node_modules ./node_modules
COPY --from=build /app/apps/api/dist ./dist
COPY --from=build /app/apps/api/prisma ./prisma
COPY --from=build /app/apps/api/assets ./assets
COPY --from=build /app/apps/api/package.json ./package.json
EXPOSE 4000
CMD ["node", "dist/main"]
