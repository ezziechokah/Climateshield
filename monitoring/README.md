# Monitoring

Prometheus, Grafana, and Alertmanager configuration implementing [`docs/29_Logging_and_Monitoring.md`](../docs/29_Logging_and_Monitoring.md). Distinct from [`observability/`](../observability/), which holds the logging/tracing strategy and Loki/OpenTelemetry configuration — this directory is metrics + alerting specifically.

## Structure

```
monitoring/
├── health-checks.md                        # The /health, /health/ready, /metrics contract every service implements
├── prometheus/
│   ├── prometheus.yml                        # Scrape configuration
│   └── alerts/platform-alerts.yml             # Alerting rules (operational, not climate hazard alerts)
├── alertmanager/alertmanager.yml               # Routing + on-call escalation
└── grafana/
    ├── provisioning/datasources/datasources.yml
    ├── provisioning/dashboards/dashboards.yml
    └── dashboards/platform-health.json          # Auto-loaded dashboard
```

## Local Usage

These configs are mounted into the monitoring containers once added to `docker-compose.yml` (Prometheus/Grafana/Alertmanager are not in the base compose file yet — add them as a `monitoring` profile when a developer needs local observability, per [`docs/15_Deployment_Guide.md`](../docs/15_Deployment_Guide.md)). In every deployed environment they run as Kubernetes workloads in the `csn-observability` namespace ([`kubernetes/base/00-namespaces.yaml`](../kubernetes/base/00-namespaces.yaml)).

## References

- [`docs/29_Logging_and_Monitoring.md`](../docs/29_Logging_and_Monitoring.md)
- [`observability/`](../observability/)
- [`terraform/modules/monitoring/`](../terraform/modules/monitoring/)
