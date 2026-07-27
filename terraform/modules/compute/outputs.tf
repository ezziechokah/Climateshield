output "cluster_name" {
  value = aws_eks_cluster.main.name
}

output "cluster_endpoint" {
  value = aws_eks_cluster.main.endpoint
}

output "cluster_certificate_authority_data" {
  value = aws_eks_cluster.main.certificate_authority[0].data
}

output "cluster_oidc_issuer_url" {
  value       = aws_eks_cluster.main.identity[0].oidc[0].issuer
  description = "Used to configure IRSA (IAM Roles for Service Accounts) in the iam module. NOTE: this creates a real dependency cycle with modules/iam (which needs the OIDC issuer to create IRSA roles, while this module needs iam's role ARNs to create the cluster) — resolved operationally via a two-pass apply, see terraform/MODULES.md#known-limitations."
}

output "node_security_group_id" {
  value       = aws_security_group.nodes.id
  description = "Consumed by the database module's security group ingress rule."
}
