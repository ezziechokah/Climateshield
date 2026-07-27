# syntax=docker/dockerfile:1.7
# Multi-stage Dockerfile for the React/Vite web dashboard (frontend/).
# Build stage compiles static assets; runtime stage serves them via nginx —
# the frontend is a static bundle in production, never a Node server
# (docs/06_System_Architecture.md#technology-stack).

ARG NODE_VERSION=20-alpine

FROM node:${NODE_VERSION} AS build
WORKDIR /workspace
COPY package.json package-lock.json ./
COPY packages ./packages
COPY frontend/package.json ./frontend/package.json
RUN npm ci
COPY . .
RUN npm run build --workspace=frontend

FROM nginx:1.27-alpine AS runtime
COPY docker/frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /workspace/frontend/dist /usr/share/nginx/html
# Non-root nginx (nginx:alpine already provides an unprivileged 'nginx' user
# for the worker process; the master process still binds port 8080 not 80
# so no CAP_NET_BIND_SERVICE is required in Kubernetes).
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -qO- http://localhost:8080/healthz || exit 1
CMD ["nginx", "-g", "daemon off;"]
