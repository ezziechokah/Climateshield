output "bucket_names" {
  value       = { for k, v in aws_s3_bucket.zones : k => v.id }
  description = "Map of zone name (raw/processed/reports) to bucket name — mirrors OBJECT_STORAGE_BUCKET_* env vars in docs/31_Environment_Variables.md."
}

output "bucket_arns" {
  value = { for k, v in aws_s3_bucket.zones : k => v.arn }
}
