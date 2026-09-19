# syntax=docker/dockerfile:1
#
# Multi-stage build for the word-search generator.
# Uses Next.js "standalone" output (next.config.ts -> output: 'standalone')
# so the runtime image is a single node server + its own node_modules.
# No public ports — Traefik routes on the shared "web" network.

# ---- Stage 1: install dependencies -----------------------------------------
FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---- Stage 2: build the app ------------------------------------------------
FROM node:24-alpine AS build
WORKDIR /app
# Make next.config.ts build to the standard .next (instead of local dist-next)
# and emit .next/standalone for the runner stage.
ENV DOCKER_BUILD=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---- Stage 3: slim runtime -------------------------------------------------
FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0
# Run as an unprivileged user.
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

# standalone/ = server.js + pruned node_modules + minimal app files.
# static/ and public/ are not part of standalone and must be copied over.
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=build --chown=nextjs:nodejs /app/public ./public
# Word banks are read at RUNTIME from process.cwd()/data by /api/generate
# (dynamic path — Next's file tracing cannot see it), so copy them explicitly.
# Without this the API fails with "word bank ... not found / empty".
COPY --from=build --chown=nextjs:nodejs /app/data ./data

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
