# Multi-stage production Dockerfile for AgencyOS Express API Server
FROM node:22-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat

# Stage 1: Build dependencies & TypeScript
FROM base AS builder
COPY package.json package-lock.json ./
COPY backend/package.json ./backend/
COPY packages ./packages
RUN npm ci

COPY backend ./backend
WORKDIR /app/backend
RUN npm run build

# Stage 2: Production runner
FROM base AS runner
ENV NODE_ENV=production
ENV PORT=4000

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 expressjs

WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/package.json ./backend/package.json
COPY --from=builder /app/packages ./packages

USER expressjs
EXPOSE 4000

WORKDIR /app/backend
CMD ["node", "dist/server.js"]

