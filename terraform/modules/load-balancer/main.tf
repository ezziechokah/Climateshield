# Load Balancer module — the WAF and DNS layer in front of the
# Kubernetes-provisioned ingress-nginx Network Load Balancer
# (docs/06_System_Architecture.md#deployment-topology). The NLB itself is
# created by the ingress-nginx Helm chart inside the cluster, not here —
# Terraform's job is the AWS-side edge: WAFv2 rules and the DNS record
# pointing at whatever hostname the NLB gets assigned.

resource "aws_wafv2_web_acl" "edge" {
  name        = "${var.project_name}-${var.environment}-edge"
  description = "Baseline managed-rule WAF in front of the API Gateway/Ingress — first defense-in-depth layer in docs/architecture/system-architecture-views.md#security-architecture."
  scope       = "REGIONAL"

  default_action {
    allow {}
  }

  rule {
    name     = "AWSManagedRulesCommonRuleSet"
    priority = 1
    override_action { none {} }
    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesCommonRuleSet"
        vendor_name = "AWS"
      }
    }
    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "common-rule-set"
      sampled_requests_enabled   = true
    }
  }

  rule {
    name     = "AWSManagedRulesKnownBadInputsRuleSet"
    priority = 2
    override_action { none {} }
    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesKnownBadInputsRuleSet"
        vendor_name = "AWS"
      }
    }
    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "known-bad-inputs"
      sampled_requests_enabled   = true
    }
  }

  # Rate-based rule as an edge-level backstop; the authoritative rate limit
  # is enforced at the gateway itself (docs/12_API_Specification.md#rate-limiting).
  rule {
    name     = "RateLimitPerIp"
    priority = 3
    action { block {} }
    statement {
      rate_based_statement {
        limit              = 3000 # requests per 5-minute window per IP
        aggregate_key_type = "IP"
      }
    }
    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "rate-limit-per-ip"
      sampled_requests_enabled   = true
    }
  }

  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name                = "${var.project_name}-${var.environment}-edge"
    sampled_requests_enabled   = true
  }

  tags = var.tags
}

# DNS record pointing at the ingress-nginx-provisioned NLB. The NLB hostname
# is not known until the ingress-nginx Helm release is applied, so this is
# wired in a second `terraform apply` pass (or via a data source once the
# Kubernetes Service exists) — documented in docs/15_Deployment_Guide.md.
resource "aws_route53_record" "api" {
  count   = var.nlb_dns_name != "" ? 1 : 0
  zone_id = var.hosted_zone_id
  name    = var.api_hostname
  type    = "CNAME"
  ttl     = 300
  records = [var.nlb_dns_name]
}

resource "aws_route53_record" "app" {
  count   = var.nlb_dns_name != "" ? 1 : 0
  zone_id = var.hosted_zone_id
  name    = var.app_hostname
  type    = "CNAME"
  ttl     = 300
  records = [var.nlb_dns_name]
}
