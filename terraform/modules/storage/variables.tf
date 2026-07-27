variable "raw_bucket_name" { type = string }
variable "processed_bucket_name" { type = string }
variable "reports_bucket_name" { type = string }

variable "kms_key_arn" {
  type        = string
  description = "KMS key ARN for server-side encryption (from the secrets module)."
}

variable "tags" {
  type    = map(string)
  default = {}
}
