# Monitoring module — cloud-managed primitives that support the
# self-hosted Prometheus/Grafana/Loki stack deployed via Kubernetes
# (monitoring/, observability/), rather than replacing it: a managed
# Prometheus workspace for long-term metric retention beyond what the
# in-cluster Prometheus retains, and a CloudWatch log group as a
# durable secondary sink for audit-relevant logs (docs/13_Security_Design.md#audit-integrity).

resource "aws_prometheus_workspace" "main" {
  alias = "${var.project_name}-${var.environment}"
  tags  = var.tags
}

resource "aws_cloudwatch_log_group" "audit_secondary_sink" {
  name              = "/climateshield-nexus/${var.environment}/audit-log-checkpoint"
  retention_in_days = 2557 # ~7 years, matches NFR-SEC-005 (docs/05_Non_Functional_Requirements.md#security)
  kms_key_id        = var.kms_key_arn
  tags              = var.tags
}

resource "aws_cloudwatch_log_group" "application" {
  name              = "/climateshield-nexus/${var.environment}/application"
  retention_in_days = var.environment == "production" ? 365 : 90
  kms_key_id        = var.kms_key_arn
  tags              = var.tags
}

# SNS topic that Alertmanager (monitoring/alertmanager/) publishes to for
# the highest-severity operational pages — bridges in-cluster alerting to
# PagerDuty/on-call tooling outside the cluster.
resource "aws_sns_topic" "oncall_page" {
  name              = "${var.project_name}-${var.environment}-oncall-page"
  kms_master_key_id = var.kms_key_arn
  tags              = var.tags
}
