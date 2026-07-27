# Dev environment values. NOTE: per docs/diagrams/14_Deployment_Diagrams.md#development,
# local development normally uses docker-compose.yml, not this Terraform
# environment — these values exist for the rare case of a shared cloud dev
# sandbox (e.g., testing a Terraform module change itself).
environment                    = "dev"
kubernetes_node_count          = 2
kubernetes_node_instance_type  = "t3.large"
database_instance_class        = "db.t4g.medium"
database_allocated_storage_gb  = 20
enable_multi_az                = false

tags = {
  Project     = "climateshield-nexus"
  Environment = "dev"
  ManagedBy   = "terraform"
}
