# Observability

Logging, tracing, and error-tracking strategy and configuration — the "what happened and why" complement to [`monitoring/`](../monitoring/)'s "is it healthy" metrics/alerting. Implements [`docs/29_Logging_and_Monitoring.md`](../docs/29_Logging_and_Monitoring.md).

## Contents

| Document/Config | Covers |
|---|---|
| [`logging-strategy.md`](logging-strategy.md) | Log levels, structured schema, correlation IDs, PII scrubbing, shipping pipeline |
| [`tracing-strategy.md`](tracing-strategy.md) | OpenTelemetry instrumentation, context propagation, sampling |
| [`metrics-strategy.md`](metrics-strategy.md) | Metric naming convention, standard + business metrics, SLO definitions |
| [`audit-logging.md`](audit-logging.md) | How the audit log (a security control) surfaces as an observability signal |
| [`error-tracking.md`](error-tracking.md) | Sentry integration for frontend/backend exception tracking |
| [`otel-collector-config.yaml`](otel-collector-config.yaml) | OpenTelemetry Collector pipeline (traces + metrics) |
| [`loki-config.yaml`](loki-config.yaml) | Loki log-aggregation configuration |
| [`promtail-config.yaml`](promtail-config.yaml) | Log shipping from containers to Loki |

## References

- [`docs/29_Logging_and_Monitoring.md`](../docs/29_Logging_and_Monitoring.md)
- [`monitoring/`](../monitoring/)
- [`docs/13_Security_Design.md`](../docs/13_Security_Design.md)
