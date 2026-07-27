environment                    = "production"
kubernetes_node_count          = 5
kubernetes_node_instance_type  = "m6i.xlarge"
database_instance_class        = "db.r6g.xlarge"
database_allocated_storage_gb  = 200
enable_multi_az                = true

tags = {
  Project     = "climateshield-nexus"
  Environment = "production"
  ManagedBy   = "terraform"
  DataClass   = "restricted"
}
