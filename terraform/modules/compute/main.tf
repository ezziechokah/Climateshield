# Compute module — the managed Kubernetes cluster (EKS) that every workload
# manifest in kubernetes/ runs on. Deliberately thin: cluster + one managed
# node group. Workload scheduling, namespaces, and autoscaling policy live
# in kubernetes/, not here (ADR-001, docs/architecture/ADR-001-modular-monolith-to-microservices.md) —
# Terraform's job stops at "a working cluster exists."

resource "aws_security_group" "nodes" {
  name_prefix = "${var.project_name}-${var.environment}-nodes-"
  vpc_id      = var.vpc_id
  description = "Attached to every EKS worker node via the node group's launch template; referenced by the database module's ingress rule so only cluster workloads can reach Postgres."

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = var.tags
}

resource "aws_eks_cluster" "main" {
  name     = "${var.project_name}-${var.environment}"
  role_arn = var.cluster_role_arn
  version  = var.kubernetes_version

  vpc_config {
    subnet_ids              = var.private_subnet_ids
    endpoint_private_access  = true
    endpoint_public_access   = var.environment != "production" # production: bastion/VPN access only
  }

  encryption_config {
    provider {
      key_arn = var.kms_key_arn
    }
    resources = ["secrets"]
  }

  tags = var.tags
}

resource "aws_eks_node_group" "default" {
  cluster_name    = aws_eks_cluster.main.name
  node_group_name = "${var.project_name}-${var.environment}-default"
  node_role_arn   = var.node_role_arn
  subnet_ids      = var.private_subnet_ids

  scaling_config {
    desired_size = var.node_count
    min_size     = max(1, var.node_count - 1)
    max_size     = var.node_count * 3 # headroom for HPA-driven pod scale-out
  }

  instance_types = [var.node_instance_type]

  update_config {
    max_unavailable = 1
  }

  labels = {
    "csn.io/node-pool" = "default"
  }

  tags = var.tags
}
