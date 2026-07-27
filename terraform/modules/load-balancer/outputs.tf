output "web_acl_arn" {
  value       = aws_wafv2_web_acl.edge.arn
  description = "Associate this with the ingress-nginx NLB (aws_wafv2_web_acl_association, added once the NLB exists)."
}
