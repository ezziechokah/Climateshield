output "cluster_name" {
  value = module.compute.cluster_name
}

output "cluster_endpoint" {
  value = module.compute.cluster_endpoint
}

output "database_endpoint" {
  value = module.database.endpoint
}

output "object_storage_buckets" {
  value = module.storage.bucket_names
}

output "kms_key_arn" {
  value = module.secrets.kms_key_arn
}

output "waf_web_acl_arn" {
  value = module.load_balancer.web_acl_arn
}
