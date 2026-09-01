FROM node:22-alpine AS build
RUN npm install -g pnpm
WORKDIR /app/apps/web
COPY apps/web/package.json apps/web/pnpm-lock.yaml apps/web/pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY apps/web .
ARG NEXT_PUBLIC_API_URL=http://localhost:4000/api
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
RUN pnpm run build

FROM node:22-alpine AS runtime
# apk upgrade pulls in patched OS packages (e.g. libssl3/libcrypto3) released
# after this base image tag was built. The rm afterward drops node:22-alpine's
# bundled npm/corepack — the standalone server only ever runs `node server.js`,
# so their transitive CVEs (tar, sigstore, pacote, ...) are dead weight, not an
# attack surface; Trivy's image scan still flags them if left in place.
RUN apk upgrade --no-cache \
  && rm -rf /usr/local/lib/node_modules/npm /usr/local/lib/node_modules/corepack \
    /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/corepack
WORKDIR /app
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
COPY --from=build --chown=node:node /app/apps/web/.next/standalone ./
COPY --from=build --chown=node:node /app/apps/web/.next/static ./.next/static
COPY --from=build --chown=node:node /app/apps/web/public ./public
USER node
EXPOSE 3000
CMD ["node", "server.js"]
