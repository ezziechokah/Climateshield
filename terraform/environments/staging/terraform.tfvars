environment                    = "staging"
kubernetes_node_count          = 3
kubernetes_node_instance_type  = "m6i.large"
database_instance_class        = "db.r6g.large"
database_allocated_storage_gb  = 100
enable_multi_az                = false

tags = {
  Project     = "climateshield-nexus"
  Environment = "staging"
  ManagedBy   = "terraform"
}
