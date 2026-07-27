# syntax=docker/dockerfile:1.7
# Edge reverse-proxy container — routes /api/* to the backend gateway and
# everything else to the frontend static container. Local stand-in for the
# WAF/CDN + Load Balancer edge tier in docs/06_System_Architecture.md#deployment-topology.
# NOT used in Kubernetes (ingress-nginx/cert-manager fill this role there,
# see kubernetes/base/ingress.yaml) — this image is for docker-compose.prod.yml
# local smoke-testing only.

FROM nginx:1.27-alpine
COPY docker/nginx/nginx.conf /etc/nginx/nginx.conf
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -qO- http://localhost:8080/healthz || exit 1
CMD ["nginx", "-g", "daemon off;"]
