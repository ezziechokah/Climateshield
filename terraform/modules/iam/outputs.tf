output "eks_cluster_role_arn" {
  value = aws_iam_role.eks_cluster.arn
}

output "eks_node_role_arn" {
  value = aws_iam_role.eks_node.arn
}

output "external_secrets_role_arn" {
  value       = aws_iam_role.external_secrets.arn
  description = "Annotate the external-secrets-sa ServiceAccount with this ARN (eks.amazonaws.com/role-arn)."
}
