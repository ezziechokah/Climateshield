# syntax=docker/dockerfile:1.7
# Generic multi-stage Dockerfile for any Node.js/NestJS backend service under
# backend/<service>/. Parameterized via the SERVICE_DIR build arg so this one
# file serves every Node service in docs/06_System_Architecture.md#service-catalog
# (gateway, auth-service, climate-data-service, alerting-service,
# reporting-service, admin-audit-service) without duplicating the same
# Dockerfile six times. See docker/README.md for the build-arg convention.
#
# Build example:
#   docker build -f docker/templates/node-service.Dockerfile \
#     --build-arg SERVICE_DIR=backend/gateway -t csn/gateway .

ARG NODE_VERSION=20-alpine

# ---- deps: install once; Docker layer-caches this across services that
#      share the same root lockfile, per docs/17_Coding_Standards.md ----
FROM node:${NODE_VERSION} AS deps
WORKDIR /workspace
COPY package.json package-lock.json ./
COPY packages ./packages
ARG SERVICE_DIR
COPY ${SERVICE_DIR}/package.json ./${SERVICE_DIR}/package.json
RUN npm ci

# ---- build: compile TypeScript ----
FROM deps AS build
ARG SERVICE_DIR
COPY . .
RUN npm run build --workspace=${SERVICE_DIR}

# ---- runtime: minimal, non-root, production dependencies only ----
FROM node:${NODE_VERSION} AS runtime
ARG SERVICE_DIR
ENV NODE_ENV=production
WORKDIR /app
RUN addgroup -S csn && adduser -S csn -G csn
COPY --from=build /workspace/node_modules ./node_modules
COPY --from=build /workspace/${SERVICE_DIR}/dist ./dist
COPY --from=build /workspace/${SERVICE_DIR}/package.json ./package.json
USER csn
EXPOSE 4000
# Every service exposes GET /health per the platform-wide operational
# convention (docs/design/03_Module_Specifications.md); Kubernetes
# liveness/readiness probes hit the same endpoint (kubernetes/base/).
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:'+(process.env.PORT||4000)+'/health',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"
CMD ["node", "dist/main.js"]
