output "endpoint" {
  value       = aws_db_instance.main.endpoint
  description = "Maps to DB_HOST in docs/31_Environment_Variables.md."
}

output "db_instance_identifier" {
  value = aws_db_instance.main.identifier
}

output "master_user_secret_arn" {
  value       = aws_db_instance.main.master_user_secret[0].secret_arn
  description = "Secrets Manager ARN holding the generated master password — synced into Vault by the secrets module, never read directly by application code."
  sensitive   = true
}
