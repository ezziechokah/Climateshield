output "vpc_id" {
  value       = aws_vpc.main.id
  description = "VPC ID, consumed by the compute/database/load-balancer modules."
}

output "public_subnet_ids" {
  value       = aws_subnet.public[*].id
  description = "Public subnet IDs (load balancer placement only)."
}

output "private_subnet_ids" {
  value       = aws_subnet.private[*].id
  description = "Private subnet IDs (Kubernetes nodes, database placement)."
}

output "vpc_cidr_block" {
  value       = aws_vpc.main.cidr_block
}
